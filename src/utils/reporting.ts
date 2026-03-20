/**
 * Board Reporting Interface
 * Provides performance updates and trade history for dashboard consumption
 */

import { hyperliquid as hlClient } from './hyperliquid';
import { logger } from './logger';
import { Portfolio, Position, Trade, MarketData } from '../types';

export interface PerformanceReport {
  portfolio: PortfolioSummary;
  positions: Position[];
  dailyStats: DailyStats;
  riskMetrics: RiskMetrics;
  generatedAt: number;
}

export interface PortfolioSummary {
  totalValueUsd: number;
  cashUsd: number;
  positionsValueUsd: number;
  availableUsd: number;
  reservedUsd: number;
  dailyPnl: number;
  dailyPnlPercent: number;
  weeklyPnl: number;
  weeklyPnlPercent: number;
  totalPnl: number;
  totalPnlPercent: number;
}

export interface DailyStats {
  tradesCount: number;
  volumeUsd: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWinUsd: number;
  avgLossUsd: number;
  largestWinUsd: number;
  largestLossUsd: number;
}

export interface RiskMetrics {
  totalLeverage: number;
  largestPositionPercent: number;
  sectorExposures: Record<string, number>;
  riskScore: number; // 0-100
}

export interface TradeHistoryReport {
  trades: Trade[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Generate a comprehensive performance report
 */
export async function generatePerformanceReport(): Promise<PerformanceReport> {
  logger.info('Generating performance report...');
  
  try {
    // Get current portfolio state
    const positions = await hlClient.getPositions();
    const usdcBalance = await hlClient.getUsdcBalance();
    const tradeHistory = await getTradeHistory(0, 100);
    
    // Calculate portfolio summary
    const positionsValueUsd = positions.reduce((sum: any, p: any) => {
      return sum + (p.size * p.currentPrice);
    }, 0);
    
    const totalValueUsd = positionsValueUsd + usdcBalance;
    const dailyPnl = calculateDailyPnl(tradeHistory.trades);
    const weeklyPnl = calculateWeeklyPnl(tradeHistory.trades);
    const totalPnl = calculateTotalPnl(tradeHistory.trades);
    
    const portfolioSummary: PortfolioSummary = {
      totalValueUsd,
      cashUsd: usdcBalance,
      positionsValueUsd,
      availableUsd: usdcBalance, // Would subtract reserved
      reservedUsd: totalValueUsd * 0.1, // From config
      dailyPnl,
      dailyPnlPercent: totalValueUsd > 0 ? (dailyPnl / totalValueUsd) * 100 : 0,
      weeklyPnl,
      weeklyPnlPercent: totalValueUsd > 0 ? (weeklyPnl / totalValueUsd) * 100 : 0,
      totalPnl,
      totalPnlPercent: totalValueUsd > 0 ? (totalPnl / totalValueUsd) * 100 : 0,
    };
    
    // Calculate daily stats
    const dailyStats = calculateDailyStats(tradeHistory.trades);
    
    // Calculate risk metrics
    const riskMetrics = calculateRiskMetrics(positions, totalValueUsd);
    
    return {
      portfolio: portfolioSummary,
      positions,
      dailyStats,
      riskMetrics,
      generatedAt: Date.now(),
    };
  } catch (error) {
    logger.error('Failed to generate performance report', { error });
    throw error;
  }
}

/**
 * Get trade history with pagination
 */
export async function getTradeHistory(
  page: number = 0,
  pageSize: number = 50
): Promise<TradeHistoryReport> {
  try {
    // Get fills from Hyperliquid
    const fills = await hlClient.getFillHistory();
    
    // Convert to Trade format
    const trades: Trade[] = fills.map((fill: any) => ({
      id: fill.hash || fill.id || '',
      asset: fill.coin || fill.asset || '',
      side: fill.side === 'Buy' ? 'buy' : 'sell',
      size: Math.abs(fill.size || fill.qty || 0),
      price: fill.price || 0,
      fee: fill.fee || 0,
      timestamp: fill.time || fill.timestamp || Date.now(),
      orderId: fill.oid || fill.orderId || '',
    }));
    
    // Sort by timestamp descending
    trades.sort((a, b) => b.timestamp - a.timestamp);
    
    // Paginate
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedTrades = trades.slice(start, end);
    
    return {
      trades: paginatedTrades,
      pagination: {
        page,
        pageSize,
        total: trades.length,
        hasMore: end < trades.length,
      },
    };
  } catch (error) {
    logger.error('Failed to get trade history', { error });
    // Return empty history on error
    return {
      trades: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        hasMore: false,
      },
    };
  }
}

/**
 * Get summary for board display (lightweight)
 */
export async function getBoardSummary(): Promise<{
  totalValue: number;
  dailyPnl: number;
  dailyPnlPercent: number;
  openPositions: number;
  recentTrades: number;
  riskScore: number;
}> {
  try {
    const positions = await hlClient.getPositions();
    const usdcBalance = await hlClient.getUsdcBalance();
    const tradeHistory = await getTradeHistory(0, 100);
    
    const positionsValue = positions.reduce((sum: any, p: any) => {
      return sum + (p.size * p.currentPrice);
    }, 0);
    const totalValue = positionsValue + usdcBalance;
    
    const dailyPnl = calculateDailyPnl(tradeHistory.trades);
    const dailyPnlPercent = totalValue > 0 ? (dailyPnl / totalValue) * 100 : 0;
    
    const riskMetrics = calculateRiskMetrics(positions, totalValue);
    
    // Get trades from last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentTrades = tradeHistory.trades.filter(t => t.timestamp > oneDayAgo).length;
    
    return {
      totalValue,
      dailyPnl,
      dailyPnlPercent,
      openPositions: positions.length,
      recentTrades,
      riskScore: riskMetrics.riskScore,
    };
  } catch (error) {
    logger.error('Failed to get board summary', { error });
    return {
      totalValue: 0,
      dailyPnl: 0,
      dailyPnlPercent: 0,
      openPositions: 0,
      recentTrades: 0,
      riskScore: 0,
    };
  }
}

// Helper functions

function calculateDailyPnl(trades: Trade[]): number {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return trades
    .filter(t => t.timestamp > oneDayAgo)
    .reduce((sum, t) => {
      const pnl = t.side === 'buy' ? -t.size * t.price : t.size * t.price;
      return sum + pnl - t.fee;
    }, 0);
}

function calculateWeeklyPnl(trades: Trade[]): number {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return trades
    .filter(t => t.timestamp > oneWeekAgo)
    .reduce((sum, t) => {
      const pnl = t.side === 'buy' ? -t.size * t.price : t.size * t.price;
      return sum + pnl - t.fee;
    }, 0);
}

function calculateTotalPnl(trades: Trade[]): number {
  return trades.reduce((sum, t) => {
    const pnl = t.side === 'buy' ? -t.size * t.price : t.size * t.price;
    return sum + pnl - t.fee;
  }, 0);
}

function calculateDailyStats(trades: Trade[]): DailyStats {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const dayTrades = trades.filter(t => t.timestamp > oneDayAgo);
  
  let winningTrades = 0;
  let losingTrades = 0;
  let totalWin = 0;
  let totalLoss = 0;
  let largestWin = 0;
  let largestLoss = 0;
  let volumeUsd = 0;
  
  for (const trade of dayTrades) {
    const pnl = trade.side === 'buy' ? -trade.size * trade.price : trade.size * trade.price;
    volumeUsd += trade.size * trade.price;
    
    if (pnl > 0) {
      winningTrades++;
      totalWin += pnl;
      largestWin = Math.max(largestWin, pnl);
    } else if (pnl < 0) {
      losingTrades++;
      totalLoss += Math.abs(pnl);
      largestLoss = Math.max(largestLoss, Math.abs(pnl));
    }
  }
  
  const totalTrades = winningTrades + losingTrades;
  
  return {
    tradesCount: dayTrades.length,
    volumeUsd,
    winningTrades,
    losingTrades,
    winRate: totalTrades > 0 ? winningTrades / totalTrades : 0,
    avgWinUsd: winningTrades > 0 ? totalWin / winningTrades : 0,
    avgLossUsd: losingTrades > 0 ? totalLoss / losingTrades : 0,
    largestWinUsd: largestWin,
    largestLossUsd: largestLoss,
  };
}

function calculateRiskMetrics(positions: Position[], totalValueUsd: number): RiskMetrics {
  // Calculate total leverage
  const totalLeverage = positions.reduce((sum: any, p: any) => {
    return sum + (Math.abs(p.size * p.currentPrice) / totalValueUsd) * p.leverage;
  }, 0);
  
  // Calculate largest position percentage
  let largestPositionPercent = 0;
  const sectorExposures: Record<string, number> = {};
  
  for (const pos of positions) {
    const positionValue = Math.abs(pos.size * pos.currentPrice);
    const percent = (positionValue / totalValueUsd) * 100;
    
    if (percent > largestPositionPercent) {
      largestPositionPercent = percent;
    }
    
    // Group by asset class (simplified)
    const sector = pos.asset.includes('BTC') ? 'crypto' : 
                   pos.asset.includes('ETH') ? 'crypto' : 'other';
    sectorExposures[sector] = (sectorExposures[sector] || 0) + percent;
  }
  
  // Calculate risk score (0-100, higher is riskier)
  let riskScore = 0;
  riskScore += Math.min(totalLeverage * 10, 30); // Up to 30 points for leverage
  riskScore += Math.min(largestPositionPercent, 30); // Up to 30 points for concentration
  riskScore += Math.min(Object.keys(sectorExposures).length * 5, 20); // Up to 20 for diversification
  riskScore = Math.min(riskScore, 100);
  
  return {
    totalLeverage,
    largestPositionPercent,
    sectorExposures,
    riskScore,
  };
}

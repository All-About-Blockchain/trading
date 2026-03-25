/**
 * Momentum Trading Agent
 * Pure momentum strategy using price momentum, RSI, and trend analysis
 */

import { BaseAgent } from './BaseAgent';
import { Signal, MarketData, Portfolio, AgentConfig } from '../types';
import { logger } from '../utils/logger';

interface PriceHistory {
  prices: number[];
  highs: number[];
  lows: number[];
  volumes: number[];
  timestamps: number[];
}

interface MomentumIndicators {
  rsi: number;
  momentum: number;
  roc: number; // Rate of change
  trend: 'up' | 'down' | 'sideways';
  strength: number; // 0-100
}

/**
 * Momentum indicators calculator
 */
class MomentumIndicators {
  /**
   * Calculate RSI
   */
  static rsi(prices: number[], period: number = 14): number {
    if (!prices || prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Calculate Momentum (change over period)
   */
  static momentum(prices: number[], period: number = 10): number {
    if (prices.length < period) return 0;
    return prices[prices.length - 1] - prices[prices.length - period];
  }

  /**
   * Calculate Rate of Change (ROC)
   */
  static roc(prices: number[], period: number = 12): number {
    if (prices.length < period) return 0;
    const oldPrice = prices[prices.length - period];
    if (oldPrice === 0) return 0;
    return ((prices[prices.length - 1] - oldPrice) / oldPrice) * 100;
  }

  /**
   * Calculate trend using linear regression
   */
  static trend(prices: number[]): { direction: 'up' | 'down' | 'sideways'; strength: number } {
    if (prices.length < 10) return { direction: 'sideways', strength: 0 };

    // Simple linear regression
    const n = prices.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += prices[i];
      sumXY += i * prices[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgPrice = sumY / n;
    const normalizedSlope = (slope / avgPrice) * 100;

    let direction: 'up' | 'down' | 'sideways';
    let strength: number;

    if (normalizedSlope > 0.5) {
      direction = 'up';
      strength = Math.min(100, normalizedSlope * 20);
    } else if (normalizedSlope < -0.5) {
      direction = 'down';
      strength = Math.min(100, Math.abs(normalizedSlope) * 20);
    } else {
      direction = 'sideways';
      strength = 50;
    }

    return { direction, strength };
  }

  /**
   * Calculate all momentum indicators
   */
  static calculate(prices: number[]): MomentumIndicators {
    const rsi = this.rsi(prices);
    const momentum = this.momentum(prices);
    const roc = this.roc(prices);
    const { direction, strength } = this.trend(prices);

    return { rsi, momentum, roc, trend: direction, strength };
  }
}

export class MomentumAgent extends BaseAgent {
  private priceHistory: Map<string, PriceHistory> = new Map();
  private initialized: boolean = false;

  constructor(config: AgentConfig) {
    super(config);
  }

  /**
   * Initialize with seed historical data for demo
   */
  private initializeSeedData(): void {
    if (this.initialized) return;

    // Seed with sample data for major assets
    const seedAssets = {
      'BTC': [66500, 66800, 67100, 66900, 67200, 67500, 67100, 66800, 67000, 67300, 67197],
      'ETH': [2050, 2060, 2080, 2070, 2090, 2100, 2085, 2070, 2088, 2095, 2088.45],
      'SOL': [85, 86, 87.5, 86.5, 88, 89, 87, 85.5, 87, 88, 87.677],
      'AVAX': [8.9, 9.0, 9.1, 8.95, 9.05, 9.15, 9.0, 8.85, 9.0, 9.1, 9.0669],
      'ARB': [0.091, 0.092, 0.093, 0.092, 0.094, 0.095, 0.093, 0.091, 0.092, 0.093, 0.09297],
    };

    for (const [asset, prices] of Object.entries(seedAssets)) {
      const history: PriceHistory = {
        prices: prices,
        highs: prices.map(p => p * 1.002),
        lows: prices.map(p => p * 0.998),
        volumes: prices.map(() => 1000000),
        timestamps: prices.map((_, i) => Date.now() - (prices.length - i) * 60000),
      };
      this.priceHistory.set(asset, history);
    }

    this.initialized = true;
    logger.info('Momentum agent initialized with seed data');
  }

  private tradeLog: Array<{
    timestamp: number;
    asset: string;
    action: 'buy' | 'sell';
    price: number;
    pnl?: number;
  }> = [];
  
  /**
   * Update price history for an asset
   */
  private updateHistory(asset: string, data: MarketData): void {
    let history = this.priceHistory.get(asset);
    if (!history) {
      history = { prices: [], highs: [], lows: [], volumes: [], timestamps: [] };
    }

    history.prices.push(data.last);
    history.highs.push(data.ask); // Using ask as proxy for high
    history.lows.push(data.bid);  // Using bid as proxy for low
    history.volumes.push(data.volume24h);
    history.timestamps.push(data.timestamp);

    // Keep only last 100 data points
    if (history.prices.length > 100) {
      history.prices = history.prices.slice(-100);
      history.highs = history.highs.slice(-100);
      history.lows = history.lows.slice(-100);
      history.volumes = history.volumes.slice(-100);
      history.timestamps = history.timestamps.slice(-100);
    }

    this.priceHistory.set(asset, history);
  }

  /**
   * Get current position for an asset
   */
  private getPosition(portfolio: Portfolio, asset: string): number {
    const position = portfolio.positions.find(p => p.asset === asset);
    return position?.size || 0;
  }

  /**
   * Analyze market and generate momentum signals
   */
  async analyze(
    marketData: Map<string, MarketData>,
    portfolio: Portfolio
  ): Promise<Signal[]> {
    // Initialize seed data on first run
    this.initializeSeedData();

    const signals: Signal[] = [];

    // Use assets from marketData
    const assets = Array.from(marketData.keys());

    for (const asset of assets) {
      const data = marketData.get(asset);
      if (!data) continue;

      // Update price history
      this.updateHistory(asset, data);

      const history = this.priceHistory.get(asset);
      if (!history || history.prices.length < 5) {
        logger.debug(`Insufficient history for ${asset}`);
        continue;
      }

      // Calculate momentum indicators
      const indicators = MomentumIndicators.calculate(history.prices);

      // Generate signal
      logger.info(`Momentum agent: ${asset} indicators - RSI:${indicators.rsi.toFixed(1)}, ROC:${indicators.roc.toFixed(1)}%, trend:${indicators.trend}`);

      const signal = this.generateMomentumSignal(
        asset,
        data,
        portfolio,
        indicators,
        this.getPosition(portfolio, asset)
      );

      if (signal) {
        signals.push(signal);
      }
    }

    return signals;
  }

  /**
   * Generate momentum-based trading signal
   */
  private generateMomentumSignal(
    asset: string,
    data: MarketData,
    portfolio: Portfolio,
    indicators: MomentumIndicators,
    currentPosition: number
  ): Signal | null {
    let score = 0;
    const reasons: string[] = [];

    // RSI signals (mean reversion)
    if (indicators.rsi < 30) {
      score += 2;
      reasons.push(`RSI oversold (${indicators.rsi.toFixed(1)})`);
    } else if (indicators.rsi > 70) {
      score -= 2;
      reasons.push(`RSI overbought (${indicators.rsi.toFixed(1)})`);
    } else if (indicators.rsi < 40) {
      score += 1;
      reasons.push(`RSI bearish (${indicators.rsi.toFixed(1)})`);
    } else if (indicators.rsi > 60) {
      score -= 1;
      reasons.push(`RSI bullish (${indicators.rsi.toFixed(1)})`);
    }

    // Rate of change - more sensitive for demo
    if (indicators.roc > 3) {
      score += 2;
      reasons.push(`Strong ROC +${indicators.roc.toFixed(1)}%`);
    } else if (indicators.roc < -3) {
      score -= 2;
      reasons.push(`Strong ROC ${indicators.roc.toFixed(1)}%`);
    } else if (indicators.roc > 1.5) {
      score += 1;
      reasons.push(`Positive ROC +${indicators.roc.toFixed(1)}%`);
    } else if (indicators.roc < -1.5) {
      score -= 1;
      reasons.push(`Negative ROC ${indicators.roc.toFixed(1)}%`);
    }

    // Trend alignment
    if (indicators.trend === 'up' && indicators.strength > 60) {
      score += 2;
      reasons.push(`Strong uptrend (${indicators.strength.toFixed(0)})`);
    } else if (indicators.trend === 'down' && indicators.strength > 60) {
      score -= 2;
      reasons.push(`Strong downtrend (${indicators.strength.toFixed(0)})`);
    }

    // Volume confirmation
    const history = this.priceHistory.get(asset);
    if (!history) return null;
    const avgVolume = history.volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    if (data.volume24h > avgVolume * 1.5) {
      if (score > 0) {
        score += 1;
        reasons.push('High volume confirming bullish');
      } else if (score < 0) {
        score -= 1;
        reasons.push('High volume confirming bearish');
      }
    }

    // Determine action
    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let confidence = 0;

    if (score >= 3 && currentPosition === 0) {
      action = 'buy';
      confidence = Math.min(0.85, 0.5 + (score / 10));
      reasons.push('BUY signal');
    } else if (score <= -3 && currentPosition > 0) {
      action = 'sell';
      confidence = Math.min(0.85, 0.5 + (Math.abs(score) / 10));
      reasons.push('SELL signal');
    } else if (score >= 1 && score < 3 && currentPosition === 0) {
      action = 'buy';
      confidence = 0.55;
      reasons.push('WEAK BUY signal');
    } else if (score <= -1 && score > -3 && currentPosition > 0) {
      action = 'sell';
      confidence = 0.55;
      reasons.push('WEAK SELL signal');
    }

    if (action === 'hold' || confidence < 0.55) {
      return null;
    }

    // Calculate position size based on confidence and risk
    const baseSize = portfolio.availableUsd * 0.08; // 8% of available
    const adjustedSize = baseSize * confidence;

    return {
      asset,
      strategy: 'momentum',
      action,
      confidence,
      targetSize: adjustedSize,
      stopLoss: action === 'buy' ? data.last * 0.95 : data.last * 1.05,
      takeProfit: action === 'buy' ? data.last * 1.10 : data.last * 0.90,
      reasoning: `Momentum: ${reasons.join('; ')}`,
      modelSource: 'minimax',
      timestamp: Date.now(),
    };
  }

  /**
   * Log a trade for performance tracking
   */
  logTrade(asset: string, action: 'buy' | 'sell', price: number): void {
    this.tradeLog.push({
      timestamp: Date.now(),
      asset,
      action,
      price,
    });

    // Keep last 1000 trades
    if (this.tradeLog.length > 1000) {
      this.tradeLog = this.tradeLog.slice(-1000);
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): {
    totalTrades: number;
    buyTrades: number;
    sellTrades: number;
    winRate: number;
  } {
    const totalTrades = this.tradeLog.length;
    const buyTrades = this.tradeLog.filter(t => t.action === 'buy').length;
    const sellTrades = this.tradeLog.filter(t => t.action === 'sell').length;

    // Calculate win rate (simplified - would need actual PnL)
    let wins = 0;
    for (let i = 1; i < this.tradeLog.length; i++) {
      if (this.tradeLog[i].action === 'sell' && this.tradeLog[i - 1].action === 'buy') {
        if (this.tradeLog[i].price > this.tradeLog[i - 1].price) {
          wins++;
        }
      }
    }

    const winRate = sellTrades > 0 ? wins / sellTrades * 100 : 0;

    return { totalTrades, buyTrades, sellTrades, winRate };
  }
}

/**
 * Board Reporting Interface
 * Provides performance updates and trade history for dashboard consumption
 */
import { Position, Trade } from '../types';
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
    riskScore: number;
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
export declare function generatePerformanceReport(): Promise<PerformanceReport>;
/**
 * Get trade history with pagination
 */
export declare function getTradeHistory(page?: number, pageSize?: number): Promise<TradeHistoryReport>;
/**
 * Get summary for board display (lightweight)
 */
export declare function getBoardSummary(): Promise<{
    totalValue: number;
    dailyPnl: number;
    dailyPnlPercent: number;
    openPositions: number;
    recentTrades: number;
    riskScore: number;
}>;
//# sourceMappingURL=reporting.d.ts.map
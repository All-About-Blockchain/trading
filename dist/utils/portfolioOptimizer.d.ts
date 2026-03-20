/**
 * Portfolio Optimizer Module
 * Balances multiple trading strategies using Modern Portfolio Theory and risk-adjusted returns
 */
import { Portfolio, Position } from '../types';
export interface StrategyPerformance {
    strategyId: string;
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    avgWinLossRatio: number;
    tradeCount: number;
    lastUpdated: number;
}
export interface StrategyAllocation {
    strategyId: string;
    allocatedPercent: number;
    currentValue: number;
    targetValue: number;
}
export interface OptimizerConfig {
    rebalanceIntervalMs: number;
    minTradesForAllocation: number;
    maxStrategies: number;
    riskFreeRate: number;
    targetVolatility: number;
}
/**
 * Portfolio Optimizer using Modern Portfolio Theory
 */
export declare class PortfolioOptimizer {
    private performance;
    private allocations;
    private trades;
    private lastRebalance;
    private config;
    /**
     * Record a trade for performance tracking
     */
    recordTrade(strategyId: string, pnl: number, confidence: number): void;
    /**
     * Update performance metrics for a strategy
     */
    private updatePerformance;
    /**
     * Calculate standard deviation
     */
    private calculateStdDev;
    /**
     * Check if rebalancing is needed
     */
    shouldRebalance(): boolean;
    /**
     * Calculate optimal allocations using risk-parity approach
     */
    calculateOptimalAllocations(portfolioValue: number): StrategyAllocation[];
    /**
     * Calculate risk-parity weights
     * Each strategy contributes equally to portfolio risk
     */
    private calculateRiskParityWeights;
    /**
     * Get current allocations
     */
    getAllocations(): StrategyAllocation[];
    /**
     * Get performance metrics
     */
    getPerformance(strategyId?: string): StrategyPerformance | Map<string, StrategyPerformance>;
    /**
     * Calculate portfolio-level metrics
     */
    getPortfolioMetrics(portfolio: Portfolio): {
        expectedReturn: number;
        volatility: number;
        sharpeRatio: number;
        diversificationBenefit: number;
    };
    /**
     * Generate rebalancing signals
     */
    generateRebalanceSignals(portfolio: Portfolio, positions: Position[]): {
        strategyId: string;
        action: 'increase' | 'decrease' | 'hold';
        amount: number;
    }[];
    /**
     * Reset performance data (for testing)
     */
    reset(): void;
}
export declare const portfolioOptimizer: PortfolioOptimizer;
//# sourceMappingURL=portfolioOptimizer.d.ts.map
"use strict";
/**
 * Portfolio Optimizer Module
 * Balances multiple trading strategies using Modern Portfolio Theory and risk-adjusted returns
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.portfolioOptimizer = exports.PortfolioOptimizer = void 0;
const logger_1 = require("./logger");
/**
 * Portfolio Optimizer using Modern Portfolio Theory
 */
class PortfolioOptimizer {
    constructor() {
        this.performance = new Map();
        this.allocations = new Map();
        this.trades = [];
        this.lastRebalance = Date.now();
        this.config = {
            rebalanceIntervalMs: 24 * 60 * 60 * 1000, // Daily rebalancing
            minTradesForAllocation: 5,
            maxStrategies: 5,
            riskFreeRate: 0.02, // 2% annual risk-free rate
            targetVolatility: 0.15, // 15% target volatility
        };
    }
    /**
     * Record a trade for performance tracking
     */
    recordTrade(strategyId, pnl, confidence) {
        this.trades.push({
            strategyId,
            pnl,
            timestamp: Date.now(),
            confidence,
        });
        // Keep only last 1000 trades per strategy
        const strategyTrades = this.trades.filter(t => t.strategyId === strategyId);
        if (strategyTrades.length > 1000) {
            const oldest = strategyTrades.sort((a, b) => a.timestamp - b.timestamp)[0];
            const idx = this.trades.indexOf(oldest);
            if (idx !== -1)
                this.trades.splice(idx, 1);
        }
        this.updatePerformance(strategyId);
    }
    /**
     * Update performance metrics for a strategy
     */
    updatePerformance(strategyId) {
        const strategyTrades = this.trades.filter(t => t.strategyId === strategyId);
        if (strategyTrades.length < this.config.minTradesForAllocation) {
            return; // Not enough data
        }
        // Calculate total return
        const totalPnl = strategyTrades.reduce((sum, t) => sum + t.pnl, 0);
        const totalReturn = totalPnl / strategyTrades.length; // Average return per trade
        // Calculate Sharpe Ratio
        const returns = strategyTrades.map(t => t.pnl);
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const stdDev = this.calculateStdDev(returns);
        const annualizedReturn = avgReturn * 252; // Assuming daily trades
        const annualizedStdDev = stdDev * Math.sqrt(252);
        const sharpeRatio = annualizedStdDev > 0
            ? (annualizedReturn - this.config.riskFreeRate) / annualizedStdDev
            : 0;
        // Calculate max drawdown
        let peak = 0;
        let maxDrawdown = 0;
        let cumulative = 0;
        for (const trade of strategyTrades) {
            cumulative += trade.pnl;
            if (cumulative > peak)
                peak = cumulative;
            const drawdown = (peak - cumulative) / (peak || 1);
            if (drawdown > maxDrawdown)
                maxDrawdown = drawdown;
        }
        // Calculate win rate
        const wins = strategyTrades.filter(t => t.pnl > 0).length;
        const winRate = wins / strategyTrades.length;
        // Average win/loss ratio
        const winsList = strategyTrades.filter(t => t.pnl > 0).map(t => t.pnl);
        const lossesList = strategyTrades.filter(t => t.pnl < 0).map(t => Math.abs(t.pnl));
        const avgWin = winsList.length > 0 ? winsList.reduce((a, b) => a + b, 0) / winsList.length : 0;
        const avgLoss = lossesList.length > 0 ? lossesList.reduce((a, b) => a + b, 0) / lossesList.length : 1;
        const avgWinLossRatio = avgLoss > 0 ? avgWin / avgLoss : 0;
        this.performance.set(strategyId, {
            strategyId,
            totalReturn,
            sharpeRatio,
            maxDrawdown,
            winRate,
            avgWinLossRatio,
            tradeCount: strategyTrades.length,
            lastUpdated: Date.now(),
        });
    }
    /**
     * Calculate standard deviation
     */
    calculateStdDev(values) {
        if (values.length === 0)
            return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(variance);
    }
    /**
     * Check if rebalancing is needed
     */
    shouldRebalance() {
        return Date.now() - this.lastRebalance > this.config.rebalanceIntervalMs;
    }
    /**
     * Calculate optimal allocations using risk-parity approach
     */
    calculateOptimalAllocations(portfolioValue) {
        const strategies = Array.from(this.performance.values());
        if (strategies.length === 0) {
            return [];
        }
        // Filter strategies with enough data
        const eligibleStrategies = strategies.filter(s => s.tradeCount >= this.config.minTradesForAllocation);
        if (eligibleStrategies.length === 0) {
            return [];
        }
        // Sort by Sharpe ratio (descending)
        const sorted = eligibleStrategies.sort((a, b) => b.sharpeRatio - a.sharpeRatio);
        // Take top strategies
        const topStrategies = sorted.slice(0, this.config.maxStrategies);
        // Calculate risk parity weights
        const weights = this.calculateRiskParityWeights(topStrategies);
        // Generate allocations
        const allocations = [];
        for (let i = 0; i < topStrategies.length; i++) {
            const strategy = topStrategies[i];
            const weight = weights[i];
            allocations.push({
                strategyId: strategy.strategyId,
                allocatedPercent: weight,
                currentValue: this.allocations.get(strategy.strategyId)?.currentValue || 0,
                targetValue: portfolioValue * weight,
            });
        }
        // Update stored allocations
        for (const alloc of allocations) {
            this.allocations.set(alloc.strategyId, alloc);
        }
        this.lastRebalance = Date.now();
        logger_1.logger.info('Portfolio rebalanced', {
            allocations: allocations.map(a => ({
                strategy: a.strategyId,
                percent: (a.allocatedPercent * 100).toFixed(1) + '%'
            }))
        });
        return allocations;
    }
    /**
     * Calculate risk-parity weights
     * Each strategy contributes equally to portfolio risk
     */
    calculateRiskParityWeights(strategies) {
        // Use inverse volatility weighting as proxy for risk parity
        const volatilities = strategies.map(s => s.totalReturn !== 0 ? Math.abs(1 / s.totalReturn) : 1);
        // Add base weight from Sharpe ratio
        const adjustedWeights = strategies.map((s, i) => {
            const volWeight = volatilities[i];
            const sharpeWeight = Math.max(0.1, s.sharpeRatio);
            return volWeight * sharpeWeight;
        });
        // Normalize to sum to 1
        const total = adjustedWeights.reduce((a, b) => a + b, 0);
        return adjustedWeights.map(w => total > 0 ? w / total : 1 / strategies.length);
    }
    /**
     * Get current allocations
     */
    getAllocations() {
        return Array.from(this.allocations.values());
    }
    /**
     * Get performance metrics
     */
    getPerformance(strategyId) {
        if (strategyId) {
            return this.performance.get(strategyId) || {
                strategyId,
                totalReturn: 0,
                sharpeRatio: 0,
                maxDrawdown: 0,
                winRate: 0,
                avgWinLossRatio: 0,
                tradeCount: 0,
                lastUpdated: Date.now(),
            };
        }
        return this.performance;
    }
    /**
     * Calculate portfolio-level metrics
     */
    getPortfolioMetrics(portfolio) {
        const allocations = this.getAllocations();
        if (allocations.length === 0) {
            return {
                expectedReturn: 0,
                volatility: 0,
                sharpeRatio: 0,
                diversificationBenefit: 0,
            };
        }
        // Calculate weighted expected return
        let expectedReturn = 0;
        for (const alloc of allocations) {
            const perf = this.performance.get(alloc.strategyId);
            if (perf) {
                expectedReturn += alloc.allocatedPercent * perf.totalReturn;
            }
        }
        // Calculate portfolio volatility (simplified - assumes some correlation)
        // In production, calculate actual correlation matrix
        let volatility = 0;
        const avgVol = Array.from(this.performance.values())
            .reduce((sum, p) => sum + Math.abs(p.totalReturn), 0) / this.performance.size;
        // Diversification benefit based on number of strategies
        const diversificationBenefit = Math.min(0.3, (allocations.length - 1) * 0.05);
        volatility = avgVol * (1 - diversificationBenefit);
        // Sharpe ratio
        const sharpeRatio = volatility > 0
            ? (expectedReturn - this.config.riskFreeRate / 252) / volatility
            : 0;
        return {
            expectedReturn,
            volatility,
            sharpeRatio,
            diversificationBenefit,
        };
    }
    /**
     * Generate rebalancing signals
     */
    generateRebalanceSignals(portfolio, positions) {
        const allocations = this.calculateOptimalAllocations(portfolio.totalValueUsd);
        const signals = [];
        for (const alloc of allocations) {
            const currentPosition = positions.find(p => p.asset === alloc.strategyId);
            const currentValue = currentPosition
                ? Math.abs(currentPosition.size * currentPosition.currentPrice)
                : 0;
            const diff = alloc.targetValue - currentValue;
            if (diff > portfolio.totalValueUsd * 0.01) { // > 1% difference
                signals.push({
                    strategyId: alloc.strategyId,
                    action: 'increase',
                    amount: diff,
                });
            }
            else if (diff < -portfolio.totalValueUsd * 0.01) {
                signals.push({
                    strategyId: alloc.strategyId,
                    action: 'decrease',
                    amount: Math.abs(diff),
                });
            }
        }
        return signals;
    }
    /**
     * Reset performance data (for testing)
     */
    reset() {
        this.performance.clear();
        this.allocations.clear();
        this.trades = [];
        this.lastRebalance = Date.now();
    }
}
exports.PortfolioOptimizer = PortfolioOptimizer;
exports.portfolioOptimizer = new PortfolioOptimizer();
//# sourceMappingURL=portfolioOptimizer.js.map
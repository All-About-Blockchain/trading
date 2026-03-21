"use strict";
/**
 * Mean Reversion Trading Agent
 *
 * Strategy: Buy assets that have dropped significantly below their moving average,
 * expecting them to revert to the mean. Sell when they return to average or exceed it.
 *
 * Parameters:
 * - lookbackPeriod: Number of periods for moving average (default: 20)
 * - entryThreshold: Standard deviations below MA to enter (default: 2)
 * - exitThreshold: Standard deviations above MA to exit (default: 0.5)
 * - holdingPeriod: Max periods to hold position (default: 10)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeanReversionAgent = void 0;
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const BaseAgent_1 = require("./BaseAgent");
class MeanReversionAgent extends BaseAgent_1.BaseAgent {
    constructor(name = 'MeanReversion', params = {}) {
        super(name);
        this.assetHistories = new Map();
        this.params = {
            lookbackPeriod: params.lookbackPeriod || 20,
            entryThreshold: params.entryThreshold || 2,
            exitThreshold: params.exitThreshold || 0.5,
            holdingPeriod: params.holdingPeriod || 10,
        };
    }
    /**
     * Analyze market and generate trading signals
     */
    async analyze(marketData, portfolio) {
        const signals = [];
        const positions = new Map(portfolio.positions.map(p => [p.asset, p]));
        for (const [asset, data] of marketData) {
            try {
                const signal = await this.analyzeAsset(asset, data, positions.get(asset));
                if (signal) {
                    signals.push(signal);
                }
            }
            catch (error) {
                logger_1.logger.debug(`Failed to analyze ${asset} for mean reversion`, { error });
            }
        }
        return signals;
    }
    /**
     * Analyze a single asset for mean reversion opportunity
     */
    async analyzeAsset(asset, data, currentPosition) {
        // Get historical prices
        const history = await this.getPriceHistory(asset);
        if (history.length < this.params.lookbackPeriod) {
            return null;
        }
        // Calculate moving average and standard deviation
        const recentPrices = history.slice(-this.params.lookbackPeriod);
        const ma = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
        const variance = recentPrices.reduce((sum, p) => sum + Math.pow(p - ma, 2), 0) / recentPrices.length;
        const stdDev = Math.sqrt(variance);
        // Calculate current distance from MA
        const currentPrice = data.price;
        const zScore = (currentPrice - ma) / stdDev;
        // Check if we have a position
        if (currentPosition) {
            // Exit signal: price reverted to mean or crossed above
            if (zScore >= -this.params.exitThreshold || zScore > 1) {
                return {
                    asset,
                    action: 'sell',
                    targetSize: currentPosition.size,
                    reason: `Mean reversion complete: z-score ${zScore.toFixed(2)} above threshold`,
                    strategy: this.name,
                    confidence: Math.min(90, 50 + Math.abs(zScore) * 20),
                };
            }
            // Exit: holding period exceeded
            const holdingPeriods = (Date.now() - currentPosition.entryTime) / (24 * 60 * 60 * 1000);
            if (holdingPeriods > this.params.holdingPeriod) {
                return {
                    asset,
                    action: 'sell',
                    targetSize: currentPosition.size,
                    reason: `Max holding period reached: ${holdingPeriods.toFixed(1)} days`,
                    strategy: this.name,
                    confidence: 60,
                };
            }
            return null;
        }
        // Entry signal: price significantly below MA (oversold)
        if (zScore <= -this.params.entryThreshold) {
            // Calculate position size based on available capital
            const positionSize = this.calculatePositionSize(portfolio, data.price, Math.abs(zScore));
            if (positionSize > config_1.config.risk.minPositionSize) {
                return {
                    asset,
                    action: 'buy',
                    targetSize: positionSize,
                    reason: `Mean reversion entry: price ${Math.abs(zScore).toFixed(2)} std devs below MA`,
                    strategy: this.name,
                    confidence: Math.min(90, 60 + Math.abs(zScore) * 15),
                };
            }
        }
        return null;
    }
    /**
     * Get price history for an asset
     */
    async getPriceHistory(asset) {
        // For now, use mock data or fetch from Hyperliquid API
        // In production, would store and retrieve historical prices
        const history = this.assetHistories.get(asset) || [];
        // Simulate adding current price to history (in production, fetch real historical data)
        // This is a simplified version - real implementation would query historical candles
        return history;
    }
    /**
     * Calculate position size based on risk parameters
     */
    calculatePositionSize(portfolio, currentPrice, zScore) {
        const maxPosition = portfolio.availableUsd * config_1.config.risk.maxPositionPerAsset;
        const riskAdjustedSize = maxPosition * (Math.abs(zScore) / this.params.entryThreshold);
        return Math.min(riskAdjustedSize / currentPrice, maxPosition / currentPrice);
    }
    /**
     * Get strategy parameters
     */
    getParams() {
        return { ...this.params };
    }
    /**
     * Update strategy parameters
     */
    setParams(params) {
        this.params = { ...this.params, ...params };
    }
    /**
     * Get strategy description
     */
    getDescription() {
        return `Mean Reversion Strategy
- Lookback Period: ${this.params.lookbackPeriod} periods
- Entry Threshold: ${this.params.entryThreshold} std devs below MA
- Exit Threshold: ${this.params.exitThreshold} std devs above MA
- Max Holding Period: ${this.params.holdingPeriod} periods`;
    }
}
exports.MeanReversionAgent = MeanReversionAgent;
//# sourceMappingURL=MeanReversionAgent.js.map
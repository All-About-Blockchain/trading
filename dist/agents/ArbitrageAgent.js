"use strict";
/**
 * Arbitrage Agent
 * Detects and executes cross-exchange arbitrage opportunities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArbitrageAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const logger_1 = require("../utils/logger");
class ArbitrageAgent extends BaseAgent_1.BaseAgent {
    constructor() {
        super(...arguments);
        this.minArbitragePercent = 0.5; // Minimum 0.5% price difference to act
        this.historicalPrices = new Map();
    }
    /**
     * Analyze market data for arbitrage opportunities
     */
    async analyze(marketData, portfolio) {
        const signals = [];
        // Check for arbitrage opportunities within Hyperliquid markets
        // (same asset on different perpetuals or spot vs perpetual)
        const opportunities = this.findArbitrageOpportunities(marketData);
        if (opportunities.length > 0) {
            logger_1.logger.info(`Found ${opportunities.length} arbitrage opportunities`);
            for (const opp of opportunities) {
                // Only trade if difference is significant enough
                if (opp.differencePercent >= this.minArbitragePercent) {
                    // Determine direction based on which price is higher
                    const action = opp.price1 > opp.price2 ? 'sell' : 'buy';
                    const targetAsset = opp.asset;
                    // Calculate position size (conservative for arbitrage)
                    const positionSize = Math.min(portfolio.availableUsd * 0.05, // Max 5% of available capital
                    1000 // Max $1000 per arbitrage
                    ) / Math.max(opp.price1, opp.price2);
                    signals.push({
                        asset: targetAsset,
                        strategy: 'arbitrage',
                        action,
                        confidence: Math.min(opp.differencePercent / 2, 0.9),
                        targetSize: positionSize,
                        stopLoss: undefined, // Arbitrage is self-limiting
                        takeProfit: opp.differencePercent * 0.8, // Capture 80% of spread
                        reasoning: `Arbitrage: ${opp.exchange1} (${opp.price1}) vs ${opp.exchange2} (${opp.price2}). Spread: ${opp.differencePercent.toFixed(2)}%`,
                        modelSource: 'gpt',
                        timestamp: Date.now(),
                    });
                    logger_1.logger.info(`Arbitrage signal: ${action} ${targetAsset}, spread ${opp.differencePercent.toFixed(2)}%`);
                }
            }
        }
        return signals;
    }
    /**
     * Find arbitrage opportunities between markets
     */
    findArbitrageOpportunities(marketData) {
        const opportunities = [];
        const assets = Array.from(marketData.keys());
        // Compare prices across similar assets
        // In production: compare across exchanges
        // For now: compare spot-like vs perpetual-like (BTC vs BTC-PERP)
        for (let i = 0; i < assets.length; i++) {
            for (let j = i + 1; j < assets.length; j++) {
                const data1 = marketData.get(assets[i]);
                const data2 = marketData.get(assets[j]);
                if (!data1?.last || !data2?.last)
                    continue;
                // Skip if same asset
                if (assets[i].toUpperCase() === assets[j].toUpperCase())
                    continue;
                const price1 = data1.last;
                const price2 = data2.last;
                if (price1 === 0 || price2 === 0)
                    continue;
                // Calculate percentage difference
                const diff = Math.abs(price1 - price2) / Math.min(price1, price2) * 100;
                if (diff >= this.minArbitragePercent) {
                    opportunities.push({
                        asset: assets[i].includes('BTC') ? 'BTC' : assets[i],
                        exchange1: assets[i],
                        exchange2: assets[j],
                        price1,
                        price2,
                        differencePercent: diff,
                        timestamp: Date.now(),
                    });
                }
            }
        }
        // Sort by difference magnitude
        opportunities.sort((a, b) => b.differencePercent - a.differencePercent);
        return opportunities;
    }
    /**
     * Record price for historical analysis
     */
    recordPrice(asset, price) {
        if (!this.historicalPrices.has(asset)) {
            this.historicalPrices.set(asset, []);
        }
        const prices = this.historicalPrices.get(asset);
        prices.push(price);
        // Keep last 1000 prices
        if (prices.length > 1000) {
            prices.shift();
        }
    }
    /**
     * Get historical prices for an asset
     */
    getHistoricalPrices(asset) {
        return this.historicalPrices.get(asset) || [];
    }
    /**
     * Set minimum arbitrage percentage threshold
     */
    setMinArbitragePercent(percent) {
        this.minArbitragePercent = percent;
    }
}
exports.ArbitrageAgent = ArbitrageAgent;
//# sourceMappingURL=ArbitrageAgent.js.map
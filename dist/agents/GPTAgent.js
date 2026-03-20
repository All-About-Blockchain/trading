"use strict";
/**
 * GPT Strategy Agent
 * Specializes in pattern recognition and sentiment analysis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPTAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
class GPTAgent extends BaseAgent_1.BaseAgent {
    /**
     * GPT excels at pattern recognition across large datasets
     * and analyzing news/social sentiment
     */
    async analyze(marketData, portfolio) {
        const signals = [];
        // Analyze top assets
        const topAssets = ['BTC', 'ETH', 'SOL'];
        for (const asset of topAssets) {
            const data = marketData.get(asset);
            if (!data)
                continue;
            // Pattern recognition logic
            const priceChange = (data.last - data.bid) / data.bid;
            const spread = (data.ask - data.bid) / data.bid;
            const fundingPressure = data.fundingRate * 24 * 365; // Annualized
            // Trend detection based on price position within spread
            const pricePosition = (data.last - data.bid) / (data.ask - data.bid);
            const fundingRate = data.fundingRate;
            let action = 'hold';
            let confidence = 0.5;
            let reasoning = '';
            // Strong upward momentum
            if (pricePosition > 0.7 && fundingRate > 0) {
                action = 'buy';
                confidence = 0.7;
                reasoning = `GPT: Strong buying pressure detected (price at ${(pricePosition * 100).toFixed(1)}% of spread). Annualized funding: ${(fundingPressure * 100).toFixed(2)}%`;
            }
            // Strong downward momentum
            else if (pricePosition < 0.3 && fundingRate < 0) {
                action = 'sell';
                confidence = 0.7;
                reasoning = `GPT: Strong selling pressure detected (price at ${(pricePosition * 100).toFixed(1)}% of spread). Annualized funding: ${(fundingPressure * 100).toFixed(2)}%`;
            }
            // Low volatility - potential mean reversion
            else if (spread < 0.001) {
                action = 'hold';
                confidence = 0.6;
                reasoning = `GPT: Tight spread (${(spread * 100).toFixed(3)}%) indicates low volatility, waiting for clearer signal`;
            }
            if (action !== 'hold') {
                signals.push({
                    asset,
                    strategy: 'pattern-recognition',
                    action,
                    confidence,
                    targetSize: portfolio.totalValueUsd * 0.05,
                    reasoning,
                    modelSource: 'gpt',
                    timestamp: Date.now(),
                });
            }
        }
        return signals;
    }
}
exports.GPTAgent = GPTAgent;
//# sourceMappingURL=GPTAgent.js.map
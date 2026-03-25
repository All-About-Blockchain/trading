"use strict";
/**
 * Ensemble Agent
 * Combines signals from all strategy agents with weighted voting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnsembleAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const logger_1 = require("../utils/logger");
class EnsembleAgent extends BaseAgent_1.BaseAgent {
    constructor() {
        super(...arguments);
        this.agentResults = new Map();
        this.modelWeights = {
            gpt: 0.30,
            gemini: 0.30,
            minimax: 0.25,
            'mean-reversion': 0.15,
            ensemble: 0.0,
        };
    }
    /**
     * Register results from other agents
     */
    registerAgentResult(result) {
        this.agentResults.set(result.agentId, result);
        logger_1.logger.debug(`Registered result from ${result.agentId}`, {
            signalCount: result.signals.length
        });
    }
    /**
     * Ensemble combines all signals with weighted voting
     */
    async analyze(marketData, portfolio) {
        // Aggregate all signals
        const allSignals = [];
        for (const result of this.agentResults.values()) {
            allSignals.push(...result.signals);
        }
        // Group by asset
        const signalsByAsset = new Map();
        for (const signal of allSignals) {
            if (!signalsByAsset.has(signal.asset)) {
                signalsByAsset.set(signal.asset, []);
            }
            signalsByAsset.get(signal.asset).push(signal);
        }
        // Combine signals per asset
        const finalSignals = [];
        for (const [asset, signals] of signalsByAsset) {
            // Group by action
            const buySignals = signals.filter(s => s.action === 'buy');
            const sellSignals = signals.filter(s => s.action === 'sell');
            // Calculate weighted confidence for each action
            const buyWeight = this.calculateWeightedConfidence(buySignals);
            const sellWeight = this.calculateWeightedConfidence(sellSignals);
            // Determine final action
            let action = 'hold';
            let finalConfidence = 0;
            let finalTargetSize = 0;
            const reasons = [];
            if (buyWeight > sellWeight && buyWeight > 0.3) {
                action = 'buy';
                finalConfidence = buyWeight;
                finalTargetSize = this.calculatePositionSize(buySignals, portfolio);
                reasons.push(...buySignals.map(s => s.reasoning || s.reason || ''));
            }
            else if (sellWeight > buyWeight && sellWeight > 0.3) {
                action = 'sell';
                finalConfidence = sellWeight;
                finalTargetSize = this.calculatePositionSize(sellSignals, portfolio);
                reasons.push(...sellSignals.map(s => s.reasoning || s.reason || ''));
            }
            if (action !== 'hold') {
                // Get common take profit / stop loss from signals
                const takeProfits = signals
                    .filter(s => s.takeProfit)
                    .map(s => s.takeProfit);
                const stopLosses = signals
                    .filter(s => s.stopLoss)
                    .map(s => s.stopLoss);
                const avgTakeProfit = takeProfits.length > 0
                    ? takeProfits.reduce((a, b) => a + b, 0) / takeProfits.length
                    : undefined;
                const avgStopLoss = stopLosses.length > 0
                    ? stopLosses.reduce((a, b) => a + b, 0) / stopLosses.length
                    : undefined;
                finalSignals.push({
                    asset,
                    strategy: 'ensemble',
                    action,
                    confidence: finalConfidence,
                    targetSize: finalTargetSize,
                    stopLoss: avgStopLoss,
                    takeProfit: avgTakeProfit,
                    reasoning: `Ensemble: ${action.toUpperCase()} signal from ${signals.length} models. ` +
                        `Buy weight: ${(buyWeight * 100).toFixed(1)}%, Sell weight: ${(sellWeight * 100).toFixed(1)}%. ` +
                        `Reasons: ${reasons.slice(0, 2).join('; ')}`,
                    modelSource: 'ensemble',
                    timestamp: Date.now(),
                });
                logger_1.logger.info(`Ensemble generated ${action} signal for ${asset}`, {
                    confidence: finalConfidence.toFixed(2),
                    targetSize: finalTargetSize.toFixed(2),
                });
            }
        }
        // Clear results after processing
        this.agentResults.clear();
        return finalSignals;
    }
    /**
     * Calculate weighted confidence based on model weights
     */
    calculateWeightedConfidence(signals) {
        if (signals.length === 0)
            return 0;
        let totalWeight = 0;
        let weightedSum = 0;
        for (const signal of signals) {
            const modelWeight = this.modelWeights[signal.modelSource || 'gpt'] || 0.25;
            weightedSum += signal.confidence * modelWeight;
            totalWeight += modelWeight;
        }
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
    /**
     * Calculate position size from multiple signals
     */
    calculatePositionSize(signals, portfolio) {
        if (signals.length === 0)
            return 0;
        // Average target size weighted by confidence
        const weightedSum = signals.reduce((sum, s) => {
            return sum + (s.targetSize || 0) * s.confidence;
        }, 0);
        const avgSize = weightedSum / signals.reduce((sum, s) => sum + s.confidence, 0);
        // Cap at risk limits
        return Math.min(avgSize, portfolio.totalValueUsd * this.config.maxPositionPercent);
    }
    /**
     * Get model performance history for adaptive weighting
     */
    async getModelPerformance() {
        // In production: fetch from database
        return this.modelWeights;
    }
    /**
     * Adjust model weights based on performance
     */
    async adjustWeights(performance) {
        // Normalize weights
        const total = Object.values(performance).reduce((a, b) => a + b, 0);
        for (const model of Object.keys(performance)) {
            this.modelWeights[model] =
                performance[model] / total;
        }
        logger_1.logger.info('Ensemble weights adjusted', this.modelWeights);
    }
}
exports.EnsembleAgent = EnsembleAgent;
//# sourceMappingURL=EnsembleAgent.js.map
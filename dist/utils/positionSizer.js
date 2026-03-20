"use strict";
/**
 * Dynamic Position Sizing Module
 * Calculates optimal position sizes based on risk parameters and portfolio value
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.positionSizer = exports.PositionSizer = void 0;
const config_1 = require("../config");
const logger_1 = require("./logger");
/**
 * Calculate optimal position size based on Kelly Criterion and risk parameters
 */
class PositionSizer {
    /**
     * Calculate the recommended position size for a signal
     */
    calculatePositionSize(params) {
        const { signal, portfolio, assetInfo, confidence, volatility } = params;
        if (portfolio.totalValueUsd === 0) {
            return this.zeroPortfolioResult();
        }
        // Base position size using Kelly Criterion variant
        const kellySize = this.calculateKellySize(signal, portfolio, confidence, volatility);
        // Apply risk-based adjustments
        const riskAdjustedSize = this.applyRiskAdjustments(kellySize, portfolio, assetInfo);
        // Calculate final size with portfolio constraints
        const finalSize = this.applyPortfolioConstraints(riskAdjustedSize, portfolio, signal);
        const positionValueUsd = finalSize * (signal.price || assetInfo.price || 1);
        const positionPercent = positionValueUsd / portfolio.totalValueUsd;
        return {
            recommendedSize: kellySize,
            adjustedSize: finalSize,
            reasoning: this.generateReasoning(kellySize, riskAdjustedSize, finalSize, portfolio),
            riskMetrics: {
                positionValueUsd,
                positionPercent,
                leverageImpact: this.calculateLeverageImpact(finalSize, portfolio),
                riskScore: this.calculateRiskScore(volatility, confidence, positionPercent),
            },
        };
    }
    /**
     * Kelly Criterion calculation for position sizing
     * F* = (bp - q) / b where b = odds, p = win probability, q = loss probability
     */
    calculateKellySize(signal, portfolio, confidence, volatility) {
        const baseRiskPercent = config_1.config.risk.maxPositionPerAsset;
        // Adjust based on confidence
        const confidenceMultiplier = Math.max(0.1, Math.min(1.5, confidence));
        // Adjust based on volatility (lower size for higher volatility)
        const volatilityMultiplier = this.getVolatilityMultiplier(volatility);
        // Calculate expected win/loss ratio
        const targetProfit = signal.targetProfitPercent || 0.05; // 5% default
        const stopLoss = signal.stopLoss || 0.02; // 2% default
        const winLossRatio = targetProfit / stopLoss;
        // Win probability based on confidence
        const winProbability = confidence;
        const lossProbability = 1 - confidence;
        // Kelly fraction calculation
        const kellyFraction = (winProbability * winLossRatio - lossProbability) / winLossRatio;
        // Apply half-Kelly for more conservative sizing
        const halfKelly = Math.max(0, kellyFraction) * 0.5;
        // Calculate size in base terms
        const baseSize = portfolio.totalValueUsd * baseRiskPercent * confidenceMultiplier * volatilityMultiplier;
        // Apply Kelly adjustment
        const kellySize = baseSize * Math.max(0.1, Math.min(1, halfKelly * 10));
        return kellySize;
    }
    /**
     * Get volatility multiplier (inverse relationship)
     */
    getVolatilityMultiplier(volatility) {
        // Volatility is typically 0.01-0.5+ (1% to 50%+)
        if (volatility < 0.02)
            return 1.2; // Very low volatility
        if (volatility < 0.05)
            return 1.0; // Low volatility
        if (volatility < 0.10)
            return 0.8; // Medium volatility
        if (volatility < 0.20)
            return 0.6; // High volatility
        if (volatility < 0.30)
            return 0.4; // Very high volatility
        return 0.2; // Extreme volatility
    }
    /**
     * Apply risk-based adjustments to position size
     */
    applyRiskAdjustments(baseSize, portfolio, assetInfo) {
        let adjustedSize = baseSize;
        // Check current exposure to this asset
        const currentAssetPosition = portfolio.positions.find(p => p.asset === assetInfo.symbol);
        if (currentAssetPosition && currentAssetPosition.size !== 0) {
            const currentValue = Math.abs(currentAssetPosition.size * currentAssetPosition.currentPrice);
            const currentPercent = currentValue / portfolio.totalValueUsd;
            // If already have position, limit additional exposure
            const maxAdditionalPercent = config_1.config.risk.maxPositionPerAsset - currentPercent;
            if (maxAdditionalPercent <= 0) {
                return 0; // Already at max
            }
            const maxAdditionalSize = (portfolio.totalValueUsd * maxAdditionalPercent) / (assetInfo.price || 1);
            adjustedSize = Math.min(adjustedSize, maxAdditionalSize);
        }
        // Check sector exposure if asset has sector
        if (assetInfo.sector) {
            const sectorExposure = this.calculateSectorExposure(portfolio, assetInfo.sector);
            const maxSectorExposure = config_1.config.risk.maxSectorExposure;
            if (sectorExposure >= maxSectorExposure) {
                adjustedSize = 0; // Sector at max
                logger_1.logger.warn('Sector exposure limit reached', {
                    sector: assetInfo.sector,
                    exposure: sectorExposure
                });
            }
        }
        // Apply leverage constraints
        const currentExposure = this.calculateTotalExposure(portfolio);
        const maxExposure = portfolio.totalValueUsd * config_1.config.risk.maxLeverage;
        const availableExposure = maxExposure - currentExposure;
        const assetPrice = assetInfo.price || 1;
        const adjustedSizeUsd = adjustedSize * assetPrice;
        if (adjustedSizeUsd > availableExposure) {
            adjustedSize = availableExposure / assetPrice;
        }
        return Math.max(0, adjustedSize);
    }
    /**
     * Apply final portfolio constraints
     */
    applyPortfolioConstraints(size, portfolio, signal) {
        let finalSize = size;
        // Minimum position size (avoid dust)
        const minPositionValue = portfolio.totalValueUsd * 0.001; // 0.1%
        const assetPrice = signal.price || 1;
        const minSize = minPositionValue / assetPrice;
        if (finalSize < minSize) {
            return 0;
        }
        // Maximum position size
        const maxPositionValue = portfolio.totalValueUsd * config_1.config.risk.maxPositionPerAsset;
        const maxSize = maxPositionValue / assetPrice;
        finalSize = Math.min(finalSize, maxSize);
        // Emergency reserve check
        const reservedForEmergencies = portfolio.totalValueUsd * config_1.config.risk.emergencyReservePercent;
        const availableForTrading = portfolio.totalValueUsd - reservedForEmergencies;
        const currentExposure = this.calculateTotalExposure(portfolio);
        const available = availableForTrading - currentExposure;
        if (finalSize * assetPrice > available) {
            finalSize = available / assetPrice;
        }
        return Math.max(0, finalSize);
    }
    /**
     * Calculate total portfolio exposure
     */
    calculateTotalExposure(portfolio) {
        return portfolio.positions.reduce((total, pos) => {
            if (pos.size !== 0) {
                return total + Math.abs(pos.size * pos.currentPrice);
            }
            return total;
        }, 0);
    }
    /**
     * Calculate sector exposure
     */
    calculateSectorExposure(portfolio, sector) {
        let sectorValue = 0;
        for (const position of portfolio.positions) {
            if (position.sector === sector && position.size !== 0) {
                sectorValue += Math.abs(position.size * position.currentPrice);
            }
        }
        return portfolio.totalValueUsd > 0
            ? sectorValue / portfolio.totalValueUsd
            : 0;
    }
    /**
     * Calculate leverage impact
     */
    calculateLeverageImpact(size, portfolio) {
        const newExposure = size * (portfolio.positions[0]?.currentPrice || 1);
        const currentExposure = this.calculateTotalExposure(portfolio);
        const totalExposure = currentExposure + newExposure;
        return portfolio.totalValueUsd > 0
            ? totalExposure / portfolio.totalValueUsd
            : 0;
    }
    /**
     * Calculate overall risk score (0-10)
     */
    calculateRiskScore(volatility, confidence, positionPercent) {
        const volatilityScore = Math.min(5, volatility * 20); // 0-5 based on volatility
        const confidenceScore = (1 - confidence) * 3; // 0-3 based on low confidence
        const sizeScore = positionPercent > 0.08 ? 2 : 0; // 2 if large position
        return Math.min(10, volatilityScore + confidenceScore + sizeScore);
    }
    /**
     * Generate human-readable reasoning
     */
    generateReasoning(kellySize, riskAdjustedSize, finalSize, portfolio) {
        const reasons = [];
        if (riskAdjustedSize < kellySize) {
            reasons.push('reduced due to existing position or sector limits');
        }
        if (finalSize < riskAdjustedSize) {
            reasons.push('constrained by portfolio risk limits or emergency reserves');
        }
        if (reasons.length === 0) {
            reasons.push('full Kelly position size applied');
        }
        return reasons.join(', ');
    }
    /**
     * Handle zero portfolio case
     */
    zeroPortfolioResult() {
        return {
            recommendedSize: 0,
            adjustedSize: 0,
            reasoning: 'No portfolio value available',
            riskMetrics: {
                positionValueUsd: 0,
                positionPercent: 0,
                leverageImpact: 0,
                riskScore: 0,
            },
        };
    }
    /**
     * Get maximum position size for an asset given current portfolio
     */
    getMaxPositionSize(portfolio, assetPrice) {
        const maxValue = portfolio.totalValueUsd * config_1.config.risk.maxPositionPerAsset;
        return maxValue / assetPrice;
    }
    /**
     * Calculate position size for scaling existing position
     */
    calculateScalePosition(currentPosition, targetPercent, portfolio) {
        const currentValue = Math.abs(currentPosition.size * currentPosition.currentPrice);
        const targetValue = portfolio.totalValueUsd * targetPercent;
        const diffValue = targetValue - currentValue;
        // Return positive for increase, negative for decrease
        return currentPosition.size > 0
            ? diffValue / currentPosition.currentPrice
            : -diffValue / currentPosition.currentPrice;
    }
}
exports.PositionSizer = PositionSizer;
exports.positionSizer = new PositionSizer();
//# sourceMappingURL=positionSizer.js.map
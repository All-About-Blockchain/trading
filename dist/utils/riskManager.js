"use strict";
/**
 * Risk Management Module
 * Position limits, leverage controls, and drawdown protection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.riskManager = exports.RiskManager = void 0;
const config_1 = require("../config");
const logger_1 = require("./logger");
class RiskManager {
    constructor() {
        this.lastDailyReset = Date.now();
        this.lastWeeklyReset = Date.now();
        this.peakPortfolioValue = 0;
        this.lastDailyLoss = 0;
        this.lastWeeklyLoss = 0;
    }
    /**
     * Check if a signal passes all risk checks before execution
     */
    checkSignal(signal, portfolio) {
        const violations = [];
        // Skip risk checks for sell/hold signals (reducing exposure is generally good)
        if (signal.action === 'sell' || signal.action === 'hold') {
            return { passed: true, violations: [] };
        }
        // Check 1: Position size limit per asset
        const positionLimitViolation = this.checkPositionLimit(signal, portfolio);
        if (positionLimitViolation) {
            violations.push(positionLimitViolation);
        }
        // Check 2: Total leverage limit
        const leverageViolation = this.checkLeverageLimit(portfolio);
        if (leverageViolation) {
            violations.push(leverageViolation);
        }
        // Check 3: Drawdown protection
        const drawdownViolations = this.checkDrawdown(portfolio);
        violations.push(...drawdownViolations);
        // Check 4: Emergency reserve
        const reserveViolation = this.checkEmergencyReserve(portfolio);
        if (reserveViolation) {
            violations.push(reserveViolation);
        }
        const passed = violations.filter(v => v.severity === 'critical').length === 0;
        if (!passed) {
            logger_1.logger.warn('Risk check failed', { violations });
        }
        return { passed, violations };
    }
    /**
     * Check position size limit per asset
     */
    checkPositionLimit(signal, portfolio) {
        if (!signal.targetSize || portfolio.totalValueUsd === 0) {
            return null;
        }
        const positionValue = signal.targetSize * (signal.stopLoss || 1); // Approximate
        const positionPercent = positionValue / portfolio.totalValueUsd;
        const maxPositionPercent = config_1.config.risk.maxPositionPerAsset;
        if (positionPercent > maxPositionPercent) {
            return {
                type: 'position_limit',
                severity: 'critical',
                message: `Position size ${(positionPercent * 100).toFixed(1)}% exceeds limit ${(maxPositionPercent * 100).toFixed(1)}%`,
                current: positionPercent,
                limit: maxPositionPercent,
            };
        }
        return null;
    }
    /**
     * Check total leverage limit across all positions
     */
    checkLeverageLimit(portfolio) {
        const maxLeverage = config_1.config.risk.maxLeverage;
        let totalExposure = 0;
        for (const position of portfolio.positions) {
            if (position.size !== 0) {
                const positionValue = Math.abs(position.size * position.currentPrice);
                totalExposure += positionValue;
            }
        }
        if (portfolio.totalValueUsd > 0) {
            const currentLeverage = totalExposure / portfolio.totalValueUsd;
            if (currentLeverage > maxLeverage) {
                return {
                    type: 'leverage_limit',
                    severity: 'critical',
                    message: `Total leverage ${currentLeverage.toFixed(1)}x exceeds limit ${maxLeverage}x`,
                    current: currentLeverage,
                    limit: maxLeverage,
                };
            }
        }
        return null;
    }
    /**
     * Check drawdown protection limits
     */
    checkDrawdown(portfolio) {
        const violations = [];
        const now = Date.now();
        // Reset daily/weekly counters if needed
        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        const MS_PER_WEEK = 7 * MS_PER_DAY;
        if (now - this.lastDailyReset > MS_PER_DAY) {
            this.lastDailyReset = now;
            this.lastDailyLoss = 0;
        }
        if (now - this.lastWeeklyReset > MS_PER_WEEK) {
            this.lastWeeklyReset = now;
            this.lastWeeklyLoss = 0;
        }
        // Track peak value
        if (portfolio.totalValueUsd > this.peakPortfolioValue) {
            this.peakPortfolioValue = portfolio.totalValueUsd;
        }
        // Calculate drawdown
        const drawdown = this.peakPortfolioValue > 0
            ? (this.peakPortfolioValue - portfolio.totalValueUsd) / this.peakPortfolioValue
            : 0;
        // Check daily loss
        const dailyLoss = portfolio.dailyPnl / portfolio.totalValueUsd;
        if (dailyLoss < -config_1.config.risk.dailyLossLimit) {
            violations.push({
                type: 'drawdown',
                severity: 'critical',
                message: `Daily loss ${(Math.abs(dailyLoss) * 100).toFixed(1)}% exceeds limit ${(config_1.config.risk.dailyLossLimit * 100).toFixed(1)}%`,
                current: Math.abs(dailyLoss),
                limit: config_1.config.risk.dailyLossLimit,
            });
        }
        // Check weekly loss
        const weeklyLoss = portfolio.weeklyPnl / portfolio.totalValueUsd;
        if (weeklyLoss < -config_1.config.risk.weeklyLossLimit) {
            violations.push({
                type: 'drawdown',
                severity: 'critical',
                message: `Weekly loss ${(Math.abs(weeklyLoss) * 100).toFixed(1)}% exceeds limit ${(config_1.config.risk.weeklyLossLimit * 100).toFixed(1)}%`,
                current: Math.abs(weeklyLoss),
                limit: config_1.config.risk.weeklyLossLimit,
            });
        }
        // Check total drawdown
        if (drawdown > config_1.config.risk.totalLossLimit) {
            violations.push({
                type: 'drawdown',
                severity: 'critical',
                message: `Total drawdown ${(drawdown * 100).toFixed(1)}% exceeds limit ${(config_1.config.risk.totalLossLimit * 100).toFixed(1)}%`,
                current: drawdown,
                limit: config_1.config.risk.totalLossLimit,
            });
        }
        return violations;
    }
    /**
     * Check emergency reserve requirement
     */
    checkEmergencyReserve(portfolio) {
        const requiredReserve = portfolio.totalValueUsd * config_1.config.risk.emergencyReservePercent;
        if (portfolio.reservedUsd < requiredReserve) {
            return {
                type: 'position_limit',
                severity: 'warning',
                message: `Emergency reserve ${portfolio.reservedUsd.toFixed(2)} below required ${requiredReserve.toFixed(2)}`,
                current: portfolio.reservedUsd,
                limit: requiredReserve,
            };
        }
        return null;
    }
    /**
     * Get current risk status for monitoring
     */
    getRiskStatus(portfolio) {
        let totalExposure = 0;
        let maxPositionPercent = 0;
        for (const position of portfolio.positions) {
            if (position.size !== 0) {
                const positionValue = Math.abs(position.size * position.currentPrice);
                totalExposure += positionValue;
                const posPercent = positionValue / portfolio.totalValueUsd;
                if (posPercent > maxPositionPercent) {
                    maxPositionPercent = posPercent;
                }
            }
        }
        const leverage = portfolio.totalValueUsd > 0
            ? totalExposure / portfolio.totalValueUsd
            : 0;
        const drawdown = this.peakPortfolioValue > 0
            ? (this.peakPortfolioValue - portfolio.totalValueUsd) / this.peakPortfolioValue
            : 0;
        const reserveUtilization = portfolio.reservedUsd > 0
            ? 1 - (portfolio.availableUsd / (portfolio.totalValueUsd - portfolio.reservedUsd))
            : 0;
        return {
            leverage,
            maxPositionUtilization: maxPositionPercent / config_1.config.risk.maxPositionPerAsset,
            drawdownPercent: drawdown,
            reserveUtilization,
        };
    }
    /**
     * Reduce positions to meet risk limits (emergency action)
     */
    calculatePositionReductions(portfolio) {
        const reductions = new Map();
        const maxLeverage = config_1.config.risk.maxLeverage;
        const maxPositionPercent = config_1.config.risk.maxPositionPerAsset;
        let totalExposure = 0;
        for (const position of portfolio.positions) {
            if (position.size !== 0) {
                totalExposure += Math.abs(position.size * position.currentPrice);
            }
        }
        const currentLeverage = portfolio.totalValueUsd > 0
            ? totalExposure / portfolio.totalValueUsd
            : 0;
        // If over-leveraged, reduce positions proportionally
        if (currentLeverage > maxLeverage) {
            const targetExposure = portfolio.totalValueUsd * maxLeverage;
            const reductionRatio = targetExposure / totalExposure;
            for (const position of portfolio.positions) {
                if (position.size !== 0) {
                    const currentSize = Math.abs(position.size);
                    const newSize = currentSize * reductionRatio;
                    reductions.set(position.asset, currentSize - newSize);
                }
            }
        }
        return reductions;
    }
}
exports.RiskManager = RiskManager;
exports.riskManager = new RiskManager();
//# sourceMappingURL=riskManager.js.map
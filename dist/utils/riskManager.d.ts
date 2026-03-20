/**
 * Risk Management Module
 * Position limits, leverage controls, and drawdown protection
 */
import { Portfolio, Signal, RiskCheck } from '../types';
export declare class RiskManager {
    private lastDailyReset;
    private lastWeeklyReset;
    private peakPortfolioValue;
    private lastDailyLoss;
    private lastWeeklyLoss;
    /**
     * Check if a signal passes all risk checks before execution
     */
    checkSignal(signal: Signal, portfolio: Portfolio): RiskCheck;
    /**
     * Check position size limit per asset
     */
    private checkPositionLimit;
    /**
     * Check total leverage limit across all positions
     */
    private checkLeverageLimit;
    /**
     * Check drawdown protection limits
     */
    private checkDrawdown;
    /**
     * Check emergency reserve requirement
     */
    private checkEmergencyReserve;
    /**
     * Get current risk status for monitoring
     */
    getRiskStatus(portfolio: Portfolio): {
        leverage: number;
        maxPositionUtilization: number;
        drawdownPercent: number;
        reserveUtilization: number;
    };
    /**
     * Reduce positions to meet risk limits (emergency action)
     */
    calculatePositionReductions(portfolio: Portfolio): Map<string, number>;
}
export declare const riskManager: RiskManager;
//# sourceMappingURL=riskManager.d.ts.map
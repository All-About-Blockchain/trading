/**
 * Dynamic Position Sizing Module
 * Calculates optimal position sizes based on risk parameters and portfolio value
 */
import { Portfolio, Position, Signal, AssetInfo } from '../types';
export interface PositionSizeParams {
    signal: Signal;
    portfolio: Portfolio;
    assetInfo: AssetInfo;
    confidence: number;
    volatility: number;
}
export interface PositionSizeResult {
    recommendedSize: number;
    adjustedSize: number;
    reasoning: string;
    riskMetrics: {
        positionValueUsd: number;
        positionPercent: number;
        leverageImpact: number;
        riskScore: number;
    };
}
/**
 * Calculate optimal position size based on Kelly Criterion and risk parameters
 */
export declare class PositionSizer {
    /**
     * Calculate the recommended position size for a signal
     */
    calculatePositionSize(params: PositionSizeParams): PositionSizeResult;
    /**
     * Kelly Criterion calculation for position sizing
     * F* = (bp - q) / b where b = odds, p = win probability, q = loss probability
     */
    private calculateKellySize;
    /**
     * Get volatility multiplier (inverse relationship)
     */
    private getVolatilityMultiplier;
    /**
     * Apply risk-based adjustments to position size
     */
    private applyRiskAdjustments;
    /**
     * Apply final portfolio constraints
     */
    private applyPortfolioConstraints;
    /**
     * Calculate total portfolio exposure
     */
    private calculateTotalExposure;
    /**
     * Calculate sector exposure
     */
    private calculateSectorExposure;
    /**
     * Calculate leverage impact
     */
    private calculateLeverageImpact;
    /**
     * Calculate overall risk score (0-10)
     */
    private calculateRiskScore;
    /**
     * Generate human-readable reasoning
     */
    private generateReasoning;
    /**
     * Handle zero portfolio case
     */
    private zeroPortfolioResult;
    /**
     * Get maximum position size for an asset given current portfolio
     */
    getMaxPositionSize(portfolio: Portfolio, assetPrice: number): number;
    /**
     * Calculate position size for scaling existing position
     */
    calculateScalePosition(currentPosition: Position, targetPercent: number, portfolio: Portfolio): number;
}
export declare const positionSizer: PositionSizer;
//# sourceMappingURL=positionSizer.d.ts.map
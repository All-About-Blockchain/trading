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
import { Signal, MarketData, Portfolio } from '../types';
import { BaseAgent } from './BaseAgent';
interface MeanReversionParams {
    lookbackPeriod: number;
    entryThreshold: number;
    exitThreshold: number;
    holdingPeriod: number;
}
export declare class MeanReversionAgent extends BaseAgent {
    private params;
    private assetHistories;
    constructor(name?: string, params?: Partial<MeanReversionParams>);
    /**
     * Analyze market and generate trading signals
     */
    analyze(marketData: Map<string, MarketData>, portfolio: Portfolio): Promise<Signal[]>;
    /**
     * Analyze a single asset for mean reversion opportunity
     */
    private analyzeAsset;
    /**
     * Get price history for an asset
     */
    private getPriceHistory;
    /**
     * Calculate position size based on risk parameters
     */
    private calculatePositionSize;
    /**
     * Get strategy parameters
     */
    getParams(): MeanReversionParams;
    /**
     * Update strategy parameters
     */
    setParams(params: Partial<MeanReversionParams>): void;
    /**
     * Get strategy description
     */
    getDescription(): string;
}
export {};
//# sourceMappingURL=MeanReversionAgent.d.ts.map
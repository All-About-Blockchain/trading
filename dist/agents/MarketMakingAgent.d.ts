/**
 * Market Making Agent
 * Provides liquidity by placing bid/ask orders around the mid-price
 */
import { BaseAgent } from './BaseAgent';
import { Signal, MarketData, Portfolio } from '../types';
interface MarketMakingConfig {
    spreadPercent: number;
    maxPositionPercent: number;
    minOrderSize: number;
    maxOrderSize: number;
    refreshIntervalMs: number;
}
export declare class MarketMakingAgent extends BaseAgent {
    private mmConfig;
    private lastRefresh;
    /**
     * Analyze markets and generate market making signals
     */
    analyze(marketData: Map<string, MarketData>, portfolio: Portfolio): Promise<Signal[]>;
    /**
     * Update market making configuration
     */
    setConfig(config: Partial<MarketMakingConfig>): void;
    /**
     * Get current configuration
     */
    getMMConfig(): MarketMakingConfig;
    /**
     * Calculate optimal spread based on market conditions
     */
    calculateOptimalSpread(volume24h: number, volatility: number): number;
    /**
     * Estimate market volatility from bid-ask spread
     */
    estimateVolatility(bid: number, ask: number): number;
}
export {};
//# sourceMappingURL=MarketMakingAgent.d.ts.map
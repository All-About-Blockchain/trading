/**
 * Momentum Trading Agent
 * Pure momentum strategy using price momentum, RSI, and trend analysis
 */
import { BaseAgent } from './BaseAgent';
import { Signal, MarketData, Portfolio, AgentConfig } from '../types';
export declare class MomentumAgent extends BaseAgent {
    private priceHistory;
    private initialized;
    constructor(config: AgentConfig);
    /**
     * Initialize with seed historical data for demo
     */
    private initializeSeedData;
    private tradeLog;
    /**
     * Update price history for an asset
     */
    private updateHistory;
    /**
     * Get current position for an asset
     */
    private getPosition;
    /**
     * Analyze market and generate momentum signals
     */
    analyze(marketData: Map<string, MarketData>, portfolio: Portfolio): Promise<Signal[]>;
    /**
     * Generate momentum-based trading signal
     */
    private generateMomentumSignal;
    /**
     * Log a trade for performance tracking
     */
    logTrade(asset: string, action: 'buy' | 'sell', price: number): void;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): {
        totalTrades: number;
        buyTrades: number;
        sellTrades: number;
        winRate: number;
    };
}
//# sourceMappingURL=MomentumAgent.d.ts.map
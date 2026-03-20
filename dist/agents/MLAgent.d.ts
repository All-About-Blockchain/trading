/**
 * ML Signal Agent
 * Uses technical indicators and ML-style momentum analysis for signal generation
 */
import { BaseAgent } from './BaseAgent';
import { Signal, MarketData, Portfolio, AgentConfig } from '../types';
export declare class MLAgent extends BaseAgent {
    private priceHistory;
    private volumeHistory;
    constructor(config: AgentConfig);
    /**
     * Update price history for an asset
     */
    private updateHistory;
    /**
     * Generate ML-based signals using technical indicators
     */
    analyze(marketData: Map<string, MarketData>, portfolio: Portfolio): Promise<Signal[]>;
    /**
     * Generate basic signal when insufficient history
     */
    private generateBasicSignal;
    /**
     * Generate ML-enhanced signal using multiple indicators
     */
    private generateMLSignal;
}
//# sourceMappingURL=MLAgent.d.ts.map
/**
 * MiniMax Strategy Agent
 * Specializes in low-latency strategies, micro-structure, and funding rate arbitrage
 */
import { BaseAgent } from './BaseAgent';
import { Signal, MarketData, Portfolio } from '../types';
export declare class MiniMaxAgent extends BaseAgent {
    /**
     * MiniMax excels at fast execution and micro-structure analysis
     */
    analyze(marketData: Map<string, MarketData>, portfolio: Portfolio): Promise<Signal[]>;
    private calculateVWAP;
}
//# sourceMappingURL=MiniMaxAgent.d.ts.map
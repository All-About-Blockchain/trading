/**
 * GPT Strategy Agent
 * Specializes in pattern recognition and sentiment analysis
 */
import { BaseAgent } from './BaseAgent';
import { Signal, MarketData, Portfolio } from '../types';
export declare class GPTAgent extends BaseAgent {
    /**
     * GPT excels at pattern recognition across large datasets
     * and analyzing news/social sentiment
     */
    analyze(marketData: Map<string, MarketData>, portfolio: Portfolio): Promise<Signal[]>;
}
//# sourceMappingURL=GPTAgent.d.ts.map
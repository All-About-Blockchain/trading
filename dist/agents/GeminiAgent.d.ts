/**
 * Gemini Strategy Agent
 * Specializes in cross-asset correlation and fundamental analysis
 */
import { BaseAgent } from './BaseAgent';
import { Signal, MarketData, Portfolio } from '../types';
export declare class GeminiAgent extends BaseAgent {
    /**
     * Gemini excels at multi-modal analysis and cross-asset correlations
     */
    analyze(marketData: Map<string, MarketData>, portfolio: Portfolio): Promise<Signal[]>;
    private calculateMomentum;
}
//# sourceMappingURL=GeminiAgent.d.ts.map
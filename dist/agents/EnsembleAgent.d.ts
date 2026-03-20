/**
 * Ensemble Agent
 * Combines signals from all strategy agents with weighted voting
 */
import { BaseAgent } from './BaseAgent';
import { Signal, MarketData, Portfolio, AgentResult } from '../types';
export declare class EnsembleAgent extends BaseAgent {
    private agentResults;
    private modelWeights;
    /**
     * Register results from other agents
     */
    registerAgentResult(result: AgentResult): void;
    /**
     * Ensemble combines all signals with weighted voting
     */
    analyze(marketData: Map<string, MarketData>, portfolio: Portfolio): Promise<Signal[]>;
    /**
     * Calculate weighted confidence based on model weights
     */
    private calculateWeightedConfidence;
    /**
     * Calculate position size from multiple signals
     */
    private calculatePositionSize;
    /**
     * Get model performance history for adaptive weighting
     */
    getModelPerformance(): Promise<Record<string, number>>;
    /**
     * Adjust model weights based on performance
     */
    adjustWeights(performance: Record<string, number>): Promise<void>;
}
//# sourceMappingURL=EnsembleAgent.d.ts.map
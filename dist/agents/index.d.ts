/**
 * Agent Factory
 * Creates and manages all trading agents
 */
import { AgentConfig, AgentResult, MarketData, Portfolio } from '../types';
import { BaseAgent } from './BaseAgent';
export declare class AgentFactory {
    private agents;
    private ensembleAgent;
    constructor();
    /**
     * Initialize all agents
     */
    initialize(): void;
    /**
     * Create agent based on model type
     */
    private createAgent;
    /**
     * Run all strategy agents (non-ensemble)
     */
    runStrategyAgents(marketData: Map<string, MarketData>, portfolio: Portfolio): Promise<AgentResult[]>;
    /**
     * Run ensemble agent to combine signals
     */
    runEnsembleAgent(marketData: Map<string, MarketData>, portfolio: Portfolio): Promise<AgentResult>;
    /**
     * Get all enabled agents
     */
    getEnabledAgents(): BaseAgent[];
    /**
     * Get agent by ID
     */
    getAgent(id: string): BaseAgent | undefined;
    /**
     * Enable/disable agent
     */
    setAgentEnabled(id: string, enabled: boolean): void;
    /**
     * Get all agent statuses
     */
    getAgentStatuses(): AgentConfig[];
}
export declare const agentFactory: AgentFactory;
//# sourceMappingURL=index.d.ts.map
/**
 * Base Agent Class
 * All trading agents inherit from this
 */
import { Signal, AgentConfig, AgentResult, MarketData, Portfolio } from '../types';
export declare abstract class BaseAgent {
    protected config: AgentConfig;
    protected lastRun: number;
    constructor(config: AgentConfig);
    /**
     * Run the agent's analysis
     */
    abstract analyze(marketData: Map<string, MarketData>, portfolio: Portfolio): Promise<Signal[]>;
    /**
     * Execute the agent with timing control
     */
    execute(marketData: Map<string, MarketData>, portfolio: Portfolio): Promise<AgentResult>;
    /**
     * Get agent configuration
     */
    getConfig(): AgentConfig;
    /**
     * Enable/disable the agent
     */
    setEnabled(enabled: boolean): void;
    /**
     * Get time since last run
     */
    getTimeSinceLastRun(): number;
}
//# sourceMappingURL=BaseAgent.d.ts.map
/**
 * Agent Activity Tracker
 * Tracks agent runs, signals, and performance metrics for the dashboard
 */
import { AgentConfig, AgentResult, Signal } from '../types';
export interface AgentActivity {
    agentId: string;
    agentName: string;
    model: string;
    specialty: string;
    status: 'idle' | 'running' | 'completed' | 'error';
    lastRun: number | null;
    lastRunDuration: number | null;
    signalsGenerated: number;
    tradesRecommended: number;
    enabled: boolean;
    totalSignals: number;
    avgConfidence: number;
    recentSignals: Signal[];
}
export interface StrategyInfo {
    id: string;
    name: string;
    description: string;
    agentId: string;
    enabled: boolean;
}
declare class AgentActivityTracker {
    private activities;
    private strategies;
    private runHistory;
    constructor();
    private initializeStrategies;
    /**
     * Register an agent configuration
     */
    registerAgent(config: AgentConfig): void;
    /**
     * Initialize with multiple agent configs
     */
    initializeFromConfigs(configs: AgentConfig[]): void;
    /**
     * Mark agent as running
     */
    startRun(agentId: string): void;
    /**
     * Record agent run result
     */
    recordResult(agentId: string, result: AgentResult, duration: number): void;
    /**
     * Record error
     */
    recordError(agentId: string, error: string): void;
    /**
     * Get all agent activities
     */
    getAllActivities(): AgentActivity[];
    /**
     * Get all strategies
     */
    getAllStrategies(): StrategyInfo[];
    /**
     * Get agent activity by ID
     */
    getActivity(agentId: string): AgentActivity | undefined;
    /**
     * Get strategy by ID
     */
    getStrategy(strategyId: string): StrategyInfo | undefined;
    /**
     * Get run history for an agent
     */
    getHistory(agentId: string): AgentResult[];
    /**
     * Get combined dashboard data
     */
    getDashboardData(): {
        agents: AgentActivity[];
        strategies: StrategyInfo[];
        summary: {
            totalAgents: number;
            activeAgents: number;
            totalSignalsToday: number;
            avgConfidence: number;
        };
    };
    /**
     * Update agent enabled status
     */
    setAgentEnabled(agentId: string, enabled: boolean): void;
}
export declare const agentActivityTracker: AgentActivityTracker;
export {};
//# sourceMappingURL=AgentActivityTracker.d.ts.map
/**
 * Agent Activity Tracker
 * Tracks agent runs, signals, and performance metrics for the dashboard
 */

import { AgentConfig, AgentResult, Signal } from '../types';
import { logger } from '../utils/logger';

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
  
  // Performance metrics (can be expanded)
  totalSignals: number;
  avgConfidence: number;
  
  // Recent signals from last run
  recentSignals: Signal[];
}

export interface StrategyInfo {
  id: string;
  name: string;
  description: string;
  agentId: string;
  enabled: boolean;
}

class AgentActivityTracker {
  private activities: Map<string, AgentActivity> = new Map();
  private strategies: Map<string, StrategyInfo> = new Map();
  private runHistory: Map<string, AgentResult[]> = new Map();
  
  constructor() {
    // Initialize with known strategies
    this.initializeStrategies();
  }
  
  private initializeStrategies(): void {
    const knownStrategies: StrategyInfo[] = [
      { id: 'pattern-recognition', name: 'Pattern Recognition', description: 'Identifies chart patterns and technical formations', agentId: 'alpha-gpt', enabled: true },
      { id: 'cross-asset-correlation', name: 'Cross-Asset Correlation', description: 'Analyzes correlations between different assets', agentId: 'beta-gemini', enabled: true },
      { id: 'micro-structure', name: 'Micro-Structure', description: 'Analyzes order book and market microstructure', agentId: 'gamma-minimax', enabled: true },
      { id: 'signal-synthesis', name: 'Signal Synthesis', description: 'Combines signals from multiple agents', agentId: 'delta-ensemble', enabled: true },
      { id: 'technical-ml', name: 'Technical Analysis & ML', description: 'ML-powered technical analysis signals', agentId: 'epsilon-ml', enabled: true },
      { id: 'momentum', name: 'Momentum Trading', description: 'Follows trending momentum strategies', agentId: 'momentum', enabled: false },
      { id: 'mean-reversion', name: 'Mean Reversion', description: 'Trades based on price deviations from mean', agentId: 'mean-reversion', enabled: false },
      { id: 'market-making', name: 'Market Making', description: 'Provides liquidity to markets', agentId: 'market-making', enabled: false },
      { id: 'arbitrage', name: 'Arbitrage', description: 'Exploits price differences across venues', agentId: 'arbitrage', enabled: false },
    ];
    
    for (const strategy of knownStrategies) {
      this.strategies.set(strategy.id, strategy);
    }
  }
  
  /**
   * Register an agent configuration
   */
  registerAgent(config: AgentConfig): void {
    const activity: AgentActivity = {
      agentId: config.id,
      agentName: config.name,
      model: config.model,
      specialty: config.specialty,
      status: 'idle',
      lastRun: null,
      lastRunDuration: null,
      signalsGenerated: 0,
      tradesRecommended: 0,
      enabled: config.enabled,
      totalSignals: 0,
      avgConfidence: 0,
      recentSignals: [],
    };
    
    this.activities.set(config.id, activity);
    logger.info(`Registered agent activity: ${config.name}`);
  }
  
  /**
   * Initialize with multiple agent configs
   */
  initializeFromConfigs(configs: AgentConfig[]): void {
    for (const config of configs) {
      this.registerAgent(config);
    }
  }
  
  /**
   * Mark agent as running
   */
  startRun(agentId: string): void {
    const activity = this.activities.get(agentId);
    if (activity) {
      activity.status = 'running';
      logger.debug(`Agent ${activity.agentName} started run`);
    }
  }
  
  /**
   * Record agent run result
   */
  recordResult(agentId: string, result: AgentResult, duration: number): void {
    const activity = this.activities.get(agentId);
    if (!activity) return;
    
    const now = Date.now();
    activity.status = 'completed';
    activity.lastRun = now;
    activity.lastRunDuration = duration;
    activity.signalsGenerated = result.signals.length;
    activity.tradesRecommended = result.signals.filter(s => s.action !== 'hold').length;
    activity.recentSignals = result.signals.slice(0, 5); // Keep last 5 signals
    
    // Update aggregate metrics
    activity.totalSignals += result.signals.length;
    if (result.signals.length > 0) {
      const totalConfidence = result.signals.reduce((sum, s) => sum + s.confidence, 0);
      activity.avgConfidence = (activity.avgConfidence * (activity.totalSignals - result.signals.length) + totalConfidence) / activity.totalSignals;
    }
    
    // Store in history
    const history = this.runHistory.get(agentId) || [];
    history.push(result);
    // Keep last 50 results
    if (history.length > 50) history.shift();
    this.runHistory.set(agentId, history);
    
    logger.info(`Agent ${activity.agentName} completed run: ${result.signals.length} signals in ${duration}ms`);
  }
  
  /**
   * Record error
   */
  recordError(agentId: string, error: string): void {
    const activity = this.activities.get(agentId);
    if (activity) {
      activity.status = 'error';
      logger.error(`Agent ${activity.agentName} error: ${error}`);
    }
  }
  
  /**
   * Get all agent activities
   */
  getAllActivities(): AgentActivity[] {
    return Array.from(this.activities.values());
  }
  
  /**
   * Get all strategies
   */
  getAllStrategies(): StrategyInfo[] {
    return Array.from(this.strategies.values());
  }
  
  /**
   * Get agent activity by ID
   */
  getActivity(agentId: string): AgentActivity | undefined {
    return this.activities.get(agentId);
  }
  
  /**
   * Get strategy by ID
   */
  getStrategy(strategyId: string): StrategyInfo | undefined {
    return this.strategies.get(strategyId);
  }
  
  /**
   * Get run history for an agent
   */
  getHistory(agentId: string): AgentResult[] {
    return this.runHistory.get(agentId) || [];
  }
  
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
  } {
    const agents = this.getAllActivities();
    const strategies = this.getAllStrategies();
    
    const activeAgents = agents.filter(a => a.status === 'running' || (a.lastRun && Date.now() - a.lastRun < 3600000)); // Active in last hour
    const totalSignalsToday = agents.reduce((sum, a) => sum + a.signalsGenerated, 0);
    const avgConfidence = agents.length > 0 
      ? agents.reduce((sum, a) => sum + a.avgConfidence, 0) / agents.filter(a => a.totalSignals > 0).length 
      : 0;
    
    return {
      agents,
      strategies,
      summary: {
        totalAgents: agents.length,
        activeAgents: activeAgents.length,
        totalSignalsToday,
        avgConfidence: Math.round(avgConfidence * 100) / 100,
      },
    };
  }
  
  /**
   * Update agent enabled status
   */
  setAgentEnabled(agentId: string, enabled: boolean): void {
    const activity = this.activities.get(agentId);
    if (activity) {
      activity.enabled = enabled;
    }
    
    // Also update strategy
    for (const [id, strategy] of this.strategies) {
      if (strategy.agentId === agentId) {
        strategy.enabled = enabled;
      }
    }
  }
}

export const agentActivityTracker = new AgentActivityTracker();

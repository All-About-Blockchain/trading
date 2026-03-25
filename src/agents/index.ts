/**
 * Agent Factory
 * Creates and manages all trading agents
 */

import { AgentConfig, AgentResult, MarketData, Portfolio } from '../types';
import { BaseAgent } from './BaseAgent';
import { GPTAgent } from './GPTAgent';
import { GeminiAgent } from './GeminiAgent';
import { MiniMaxAgent } from './MiniMaxAgent';
import { EnsembleAgent } from './EnsembleAgent';
import { MLAgent } from './MLAgent';
import { MomentumAgent } from './MomentumAgent';
import { MeanReversionAgent } from './MeanReversionAgent';
import { logger } from '../utils/logger';

// Default agent configurations
const DEFAULT_AGENT_CONFIGS: AgentConfig[] = [
  {
    id: 'alpha-gpt',
    name: 'Alpha-GPT',
    model: 'gpt',
    enabled: true,
    specialty: 'Pattern Recognition',
    maxPositionPercent: 0.10,
  },
  {
    id: 'beta-gemini',
    name: 'Beta-Gemini',
    model: 'gemini',
    enabled: true,
    specialty: 'Cross-Asset Correlation',
    maxPositionPercent: 0.10,
  },
  {
    id: 'gamma-minimax',
    name: 'Gamma-MiniMax',
    model: 'minimax',
    enabled: true,
    specialty: 'Micro-Structure',
    maxPositionPercent: 0.10,
  },
  {
    id: 'delta-ensemble',
    name: 'Delta-Ensemble',
    model: 'ensemble',
    enabled: true,
    specialty: 'Signal Synthesis',
    maxPositionPercent: 0.15,
  },
  {
    id: 'epsilon-ml',
    name: 'Epsilon-ML',
    model: 'minimax',
    enabled: true,
    specialty: 'Technical Analysis & ML Signals',
    maxPositionPercent: 0.10,
  },
  {
    id: 'zeta-momentum',
    name: 'Zeta-Momentum',
    model: 'minimax',
    enabled: true,
    specialty: 'Pure Momentum Trading',
    maxPositionPercent: 0.12,
  },
  {
    id: 'eta-mean-reversion',
    name: 'Eta-MeanReversion',
    model: 'mean-reversion',
    enabled: true,
    specialty: 'Mean Reversion Trading',
    maxPositionPercent: 0.10,
  },
];

export class AgentFactory {
  private agents: Map<string, BaseAgent> = new Map();
  private ensembleAgent: EnsembleAgent;
  
  constructor() {
    // Create ensemble agent first
    this.ensembleAgent = new EnsembleAgent(
      DEFAULT_AGENT_CONFIGS.find(c => c.model === 'ensemble')!
    );
  }
  
  /**
   * Initialize all agents
   */
  initialize(): void {
    for (const config of DEFAULT_AGENT_CONFIGS) {
      const agent = this.createAgent(config);
      this.agents.set(config.id, agent);
      logger.info(`Initialized agent: ${config.name} (${config.model})`);
    }
  }
  
  /**
   * Create agent based on model type
   */
  private createAgent(config: AgentConfig): BaseAgent {
    switch (config.model) {
      case 'gpt':
        return new GPTAgent(config);
      case 'gemini':
        return new GeminiAgent(config);
      case 'minimax':
        // Use ML agent for epsilon-ml, Momentum for zeta-momentum, MiniMax for others
        if (config.id === 'epsilon-ml') {
          return new MLAgent(config);
        }
        if (config.id === 'zeta-momentum') {
          return new MomentumAgent(config);
        }
        return new MiniMaxAgent(config);
      case 'ensemble':
        return this.ensembleAgent;
      case 'mean-reversion':
        return new MeanReversionAgent(config);
      default:
        throw new Error(`Unknown model type: ${config.model}`);
    }
  }
  
  /**
   * Run all strategy agents (non-ensemble)
   */
  async runStrategyAgents(
    marketData: Map<string, MarketData>,
    portfolio: Portfolio
  ): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    
    for (const [id, agent] of this.agents) {
      if (id === 'delta-ensemble') continue; // Skip ensemble, run separately
      
      const result = await agent.execute(marketData, portfolio);
      results.push(result);
      
      // Register result with ensemble
      this.ensembleAgent.registerAgentResult(result);
    }
    
    return results;
  }
  
  /**
   * Run ensemble agent to combine signals
   */
  async runEnsembleAgent(
    marketData: Map<string, MarketData>,
    portfolio: Portfolio
  ): Promise<AgentResult> {
    return await this.ensembleAgent.execute(marketData, portfolio);
  }
  
  /**
   * Get all enabled agents
   */
  getEnabledAgents(): BaseAgent[] {
    return Array.from(this.agents.values()).filter(a => a.getConfig().enabled);
  }
  
  /**
   * Get agent by ID
   */
  getAgent(id: string): BaseAgent | undefined {
    return this.agents.get(id);
  }
  
  /**
   * Enable/disable agent
   */
  setAgentEnabled(id: string, enabled: boolean): void {
    const agent = this.agents.get(id);
    if (agent) {
      agent.setEnabled(enabled);
      logger.info(`Agent ${id} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }
  
  /**
   * Get all agent statuses
   */
  getAgentStatuses(): AgentConfig[] {
    return Array.from(this.agents.values()).map(a => a.getConfig());
  }
}

export const agentFactory = new AgentFactory();

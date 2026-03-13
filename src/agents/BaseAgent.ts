/**
 * Base Agent Class
 * All trading agents inherit from this
 */

import { Signal, AgentConfig, AgentResult, MarketData, Portfolio } from '../types';
import { logger } from '../utils/logger';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected lastRun: number = 0;
  
  constructor(config: AgentConfig) {
    this.config = config;
  }
  
  /**
   * Run the agent's analysis
   */
  abstract analyze(
    marketData: Map<string, MarketData>,
    portfolio: Portfolio
  ): Promise<Signal[]>;
  
  /**
   * Execute the agent with timing control
   */
  async execute(
    marketData: Map<string, MarketData>,
    portfolio: Portfolio
  ): Promise<AgentResult> {
    const startTime = Date.now();
    
    try {
      if (!this.config.enabled) {
        logger.debug(`${this.config.name} is disabled, skipping`);
        return {
          agentId: this.config.id,
          signals: [],
          timestamp: startTime,
        };
      }
      
      logger.info(`Running agent: ${this.config.name} (${this.config.model})`);
      
      const signals = await this.analyze(marketData, portfolio);
      
      // Filter by confidence threshold
      const filteredSignals = signals.filter(s => s.confidence >= 0.6);
      
      // Adjust signal sizes based on agent's max position
      const adjustedSignals = filteredSignals.map(s => ({
        ...s,
        targetSize: Math.min(
          s.targetSize || 0,
          (portfolio.totalValueUsd * this.config.maxPositionPercent)
        ),
      }));
      
      logger.info(`Agent ${this.config.name} generated ${adjustedSignals.length} signals`);
      
      this.lastRun = Date.now();
      
      return {
        agentId: this.config.id,
        signals: adjustedSignals,
        timestamp: startTime,
      };
    } catch (error) {
      logger.error(`Agent ${this.config.name} failed`, { error });
      return {
        agentId: this.config.id,
        signals: [],
        errors: [String(error)],
        timestamp: startTime,
      };
    }
  }
  
  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return this.config;
  }
  
  /**
   * Enable/disable the agent
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }
  
  /**
   * Get time since last run
   */
  getTimeSinceLastRun(): number {
    return Date.now() - this.lastRun;
  }
}

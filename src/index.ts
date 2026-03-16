/**
 * Hyperliquid Trading System
 * Main entry point
 */

import { config } from './config';
import { hlClient } from './utils/hyperliquid';
import { agentFactory } from './agents';
import { logger } from './utils/logger';
import { riskManager } from './utils/riskManager';
import { Portfolio, MarketData, Signal } from './types';

class TradingSystem {
  private running: boolean = false;
  private dataInterval: NodeJS.Timeout | null = null;
  private analysisInterval: NodeJS.Timeout | null = null;
  
  /**
   * Initialize the trading system
   */
  async initialize(): Promise<void> {
    logger.info('Initializing Hyperliquid Trading System...');
    
    // Initialize wallet
    const address = await hlClient.initialize();
    logger.info(`Trading from wallet: ${address}`);
    
    // Initialize agents
    agentFactory.initialize();
    logger.info(`Initialized ${agentFactory.getEnabledAgents().length} agents`);
    
    this.running = true;
  }
  
  /**
   * Start the trading loops
   */
  start(): void {
    if (!this.running) {
      throw new Error('System not initialized');
    }
    
    logger.info('Starting trading system...');
    
    // Data collection loop
    this.dataInterval = setInterval(
      () => this.collectMarketData(),
      config.agents.dataAgentIntervalMs
    );
    
    // Analysis loop
    this.analysisInterval = setInterval(
      () => this.runTradingCycle(),
      config.agents.analysisAgentIntervalMs
    );
    
    // Run initial cycle
    this.runTradingCycle();
  }
  
  /**
   * Stop the trading system
   */
  stop(): void {
    logger.info('Stopping trading system...');
    
    if (this.dataInterval) clearInterval(this.dataInterval);
    if (this.analysisInterval) clearInterval(this.analysisInterval);
    
    this.running = false;
    logger.info('Trading system stopped');
  }
  
  /**
   * Collect market data for all assets
   */
  private async collectMarketData(): Promise<Map<string, MarketData>> {
    const marketData = new Map<string, MarketData>();
    
    try {
      const assets = await hlClient.getAssets();
      
      // Get data for top assets (limit to avoid rate limits)
      const topAssets = assets.slice(0, 20);
      
      for (const asset of topAssets) {
        try {
          const data = await hlClient.getMarketData(asset);
          marketData.set(asset, data);
        } catch (error) {
          logger.warn(`Failed to get market data for ${asset}`, { error });
        }
      }
      
      logger.debug(`Collected market data for ${marketData.size} assets`);
    } catch (error) {
      logger.error('Failed to collect market data', { error });
    }
    
    return marketData;
  }
  
  /**
   * Get current portfolio state
   */
  private async getPortfolio(): Promise<Portfolio> {
    const positions = await hlClient.getPositions();
    const usdcBalance = await hlClient.getUsdcBalance();
    
    const totalValue = positions.reduce((sum, p) => {
      return sum + p.size * p.currentPrice;
    }, usdcBalance);
    
    const reserved = totalValue * config.risk.emergencyReservePercent;
    
    return {
      totalValueUsd: totalValue + usdcBalance,
      positions,
      cashUsd: usdcBalance,
      reservedUsd: reserved,
      availableUsd: usdcBalance + totalValue - reserved,
      dailyPnl: 0, // Would calculate from trades
      weeklyPnl: 0,
      totalPnl: 0,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Run a complete trading cycle
   */
  private async runTradingCycle(): Promise<void> {
    try {
      logger.info('Starting trading cycle...');
      
      // Get market data
      const marketData = await this.collectMarketData();
      
      // Get portfolio
      const portfolio = await this.getPortfolio();
      
      // Run strategy agents
      const strategyResults = await agentFactory.runStrategyAgents(marketData, portfolio);
      
      // Run ensemble to combine signals
      const ensembleResult = await agentFactory.runEnsembleAgent(marketData, portfolio);
      
      // Execute final signals
      for (const signal of ensembleResult.signals) {
        await this.executeSignal(signal);
      }
      
      logger.info(`Trading cycle complete. Generated ${ensembleResult.signals.length} signals`);
    } catch (error) {
      logger.error('Trading cycle failed', { error });
    }
  }
  
  /**
   * Execute a trading signal
   */
  private async executeSignal(signal: Signal): Promise<void> {
    // Get current portfolio for risk checks
    const portfolio = await this.getPortfolio();
    
    if (config.agents.riskCheckEnabled) {
      // Run risk checks before execution
      const riskCheck = riskManager.checkSignal(signal, portfolio);
      
      if (!riskCheck.passed) {
        logger.warn(`Signal blocked by risk checks: ${signal.asset} ${signal.action}`, {
          violations: riskCheck.violations,
        });
        return;
      }
      
      // Log warning for non-critical violations
      const warnings = riskCheck.violations.filter(v => v.severity === 'warning');
      if (warnings.length > 0) {
        logger.warn('Risk warnings', { warnings });
      }
    }
    
    await this.placeOrderFromSignal(signal);
  }
  
  /**
   * Place order from signal
   */
  private async placeOrderFromSignal(signal: Signal): Promise<void> {
    try {
      const order = {
        asset: signal.asset,
        side: signal.action as 'buy' | 'sell',
        type: 'market' as const,
        size: signal.targetSize || 0,
      };
      
      await hlClient.placeOrder(order);
      logger.info(`Executed ${signal.action} order for ${signal.asset}`, {
        size: order.size,
        strategy: signal.strategy,
      });
    } catch (error) {
      logger.error('Failed to execute signal', { signal, error });
    }
  }
}

// Main execution
async function main() {
  const system = new TradingSystem();
  
  try {
    await system.initialize();
    system.start();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      system.stop();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Fatal error', { error });
    process.exit(1);
  }
}

main();

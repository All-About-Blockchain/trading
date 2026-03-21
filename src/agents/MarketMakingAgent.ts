/**
 * Market Making Agent
 * Provides liquidity by placing bid/ask orders around the mid-price
 */

import { BaseAgent } from './BaseAgent';
import { Signal, MarketData, Portfolio, AgentConfig } from '../types';
import { logger } from '../utils/logger';

interface OrderBookLevel {
  price: number;
  size: number;
}

interface MarketMakingConfig {
  spreadPercent: number;        // Bid-ask spread as % of price
  maxPositionPercent: number;  // Max position size as % of portfolio
  minOrderSize: number;        // Minimum order size
  maxOrderSize: number;        // Maximum order size
  refreshIntervalMs: number;   // How often to refresh orders
}

export class MarketMakingAgent extends BaseAgent {
  private mmConfig: MarketMakingConfig = {
    spreadPercent: 0.1,        // 0.1% spread
    maxPositionPercent: 0.1,    // Max 10% of portfolio
    minOrderSize: 10,          // Min $10
    maxOrderSize: 1000,        // Max $1000
    refreshIntervalMs: 60000,   // Refresh every minute
  };
  
  private lastRefresh: number = 0;
  
  /**
   * Analyze markets and generate market making signals
   */
  async analyze(
    marketData: Map<string, MarketData>,
    portfolio: Portfolio
  ): Promise<Signal[]> {
    const signals: Signal[] = [];
    
    // Check if we should refresh
    if (Date.now() - this.lastRefresh < this.mmConfig.refreshIntervalMs) {
      return signals;
    }
    
    for (const [asset, data] of marketData) {
      // Skip if no valid data
      if (!data.bid || !data.ask || !data.last) continue;
      
      const midPrice = (data.bid + data.ask) / 2;
      
      // Calculate bid and ask prices
      const spread = midPrice * (this.mmConfig.spreadPercent / 100);
      const bidPrice = midPrice - spread;
      const askPrice = midPrice + spread;
      
      // Calculate order sizes
      const maxSize = Math.min(
        portfolio.availableUsd * this.mmConfig.maxPositionPercent,
        this.mmConfig.maxOrderSize
      ) / midPrice;
      
      const minSize = this.mmConfig.minOrderSize / midPrice;
      
      if (maxSize < minSize) continue;
      
      // Generate balanced signals (market making is neutral)
      // We place both bid and ask, so we signal to hold with specific prices
      signals.push({
        asset,
        strategy: 'market-making',
        action: 'buy',
        confidence: 0.7,
        targetSize: maxSize,
        stopLoss: bidPrice * 0.95,  // 5% stop loss on bid side
        takeProfit: askPrice * 1.05, // 5% take profit on ask side
        reasoning: `Market making: Bid ${bidPrice.toFixed(2)} / Ask ${askPrice.toFixed(2)}. Spread ${this.mmConfig.spreadPercent}%. Mid ${midPrice.toFixed(2)}. Vol24h ${(data.volume24h/1000000).toFixed(2)}M`,
        modelSource: 'gpt',
        timestamp: Date.now(),
      });
      
      logger.info(`Market making signal for ${asset}: Bid ${bidPrice.toFixed(2)}, Ask ${askPrice.toFixed(2)}`);
    }
    
    this.lastRefresh = Date.now();
    return signals;
  }
  
  /**
   * Update market making configuration
   */
  setConfig(config: Partial<MarketMakingConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Market making config updated', this.config);
  }
  
  /**
   * Get current configuration
   */
  getMMConfig(): MarketMakingConfig {
    return this.config;
  }
  
  /**
   * Calculate optimal spread based on market conditions
   */
  calculateOptimalSpread(volume24h: number, volatility: number): number {
    // Wider spread for less liquid markets
    // Base spread 0.1%, add volatility adjustment
    let spread = 0.1;
    
    // Adjust for volume (lower volume = wider spread)
    if (volume24h < 1000000) {
      spread += 0.1;
    } else if (volume24h < 5000000) {
      spread += 0.05;
    }
    
    // Adjust for volatility
    spread += Math.min(volatility * 2, 0.3);
    
    return spread;
  }
  
  /**
   * Estimate market volatility from bid-ask spread
   */
  estimateVolatility(bid: number, ask: number): number {
    if (bid === 0) return 0;
    return (ask - bid) / bid;
  }
}

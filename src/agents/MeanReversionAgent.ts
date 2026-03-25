/**
 * Mean Reversion Trading Agent
 * 
 * Strategy: Buy assets that have dropped significantly below their moving average,
 * expecting them to revert to the mean. Sell when they return to average or exceed it.
 * 
 * Parameters:
 * - lookbackPeriod: Number of periods for moving average (default: 20)
 * - entryThreshold: Standard deviations below MA to enter (default: 2)
 * - exitThreshold: Standard deviations above MA to exit (default: 0.5)
 * - holdingPeriod: Max periods to hold position (default: 10)
 */

import { HyperliquidClient } from '../utils/hyperliquid';
import { config } from '../config';
import { logger } from '../utils/logger';
import { Signal, MarketData, Portfolio, AgentConfig } from '../types';
import { BaseAgent } from './BaseAgent';

interface MeanReversionParams {
  lookbackPeriod: number;
  entryThreshold: number;
  exitThreshold: number;
  holdingPeriod: number;
}

export class MeanReversionAgent extends BaseAgent {
  public readonly name: string;
  private params: MeanReversionParams;
  private assetHistories: Map<string, number[]> = new Map();

  constructor(
    config: AgentConfig,
    params: Partial<MeanReversionParams> = {}
  ) {
    super({
      id: config.id,
      name: config.name,
      enabled: config.enabled,
      model: 'mean-reversion',
      specialty: config.specialty,
      maxPositionPercent: config.maxPositionPercent,
    });
    this.name = config.name;
    this.params = {
      lookbackPeriod: params.lookbackPeriod || 20,
      entryThreshold: params.entryThreshold || 2,
      exitThreshold: params.exitThreshold || 0.5,
      holdingPeriod: params.holdingPeriod || 10,
    };
  }

  /**
   * Analyze market and generate trading signals
   */
  async analyze(marketData: Map<string, MarketData>, portfolio: Portfolio): Promise<Signal[]> {
    const signals: Signal[] = [];
    const positions = new Map(portfolio.positions.map(p => [p.asset, p]));

    for (const [asset, data] of marketData) {
      try {
        const signal = await this.analyzeAsset(asset, data, positions.get(asset), portfolio);
        if (signal) {
          signals.push(signal);
        }
      } catch (error) {
        logger.debug(`Failed to analyze ${asset} for mean reversion`, { error });
      }
    }

    return signals;
  }

  /**
   * Analyze a single asset for mean reversion opportunity
   */
  private async analyzeAsset(
    asset: string,
    data: MarketData,
    currentPosition: any,
    portfolio: Portfolio
  ): Promise<Signal | null> {
    // Get historical prices
    const history = await this.getPriceHistory(asset);
    if (history.length < this.params.lookbackPeriod) {
      return null;
    }

    // Calculate moving average and standard deviation
    const recentPrices = history.slice(-this.params.lookbackPeriod);
    const ma = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const variance = recentPrices.reduce((sum, p) => sum + Math.pow(p - ma, 2), 0) / recentPrices.length;
    const stdDev = Math.sqrt(variance);

    // Calculate current distance from MA
    const currentPrice = data.price ?? data.last;
    const zScore = (currentPrice - ma) / stdDev;

    // Check if we have a position
    if (currentPosition) {
      // Exit signal: price reverted to mean or crossed above
      if (zScore >= -this.params.exitThreshold || zScore > 1) {
        return {
          asset,
          action: 'sell',
          targetSize: currentPosition.size,
          reason: `Mean reversion complete: z-score ${zScore.toFixed(2)} above threshold`,
          strategy: this.name,
          confidence: Math.min(90, 50 + Math.abs(zScore) * 20),
        };
      }

      // Exit: holding period exceeded
      const holdingPeriods = (Date.now() - currentPosition.entryTime) / (24 * 60 * 60 * 1000);
      if (holdingPeriods > this.params.holdingPeriod) {
        return {
          asset,
          action: 'sell',
          targetSize: currentPosition.size,
          reason: `Max holding period reached: ${holdingPeriods.toFixed(1)} days`,
          strategy: this.name,
          confidence: 60,
        };
      }

      return null;
    }

    // Entry signal: price significantly below MA (oversold)
    if (zScore <= -this.params.entryThreshold) {
      // Calculate position size based on available capital
      const positionSize = this.calculatePositionSize(portfolio, data.price ?? data.last, Math.abs(zScore));
      
      if (positionSize > config.risk.minPositionSize) {
        return {
          asset,
          action: 'buy',
          targetSize: positionSize,
          reason: `Mean reversion entry: price ${Math.abs(zScore).toFixed(2)} std devs below MA`,
          strategy: this.name,
          confidence: Math.min(90, 60 + Math.abs(zScore) * 15),
        };
      }
    }

    return null;
  }

  /**
   * Get price history for an asset
   */
  private async getPriceHistory(asset: string): Promise<number[]> {
    // For now, use mock data or fetch from Hyperliquid API
    // In production, would store and retrieve historical prices
    const history = this.assetHistories.get(asset) || [];
    
    // Simulate adding current price to history (in production, fetch real historical data)
    // This is a simplified version - real implementation would query historical candles
    return history;
  }

  /**
   * Calculate position size based on risk parameters
   */
  private calculatePositionSize(
    portfolio: Portfolio,
    currentPrice: number,
    zScore: number
  ): number {
    const maxPosition = portfolio.availableUsd * config.risk.maxPositionPerAsset;
    const riskAdjustedSize = maxPosition * (Math.abs(zScore) / this.params.entryThreshold);
    
    return Math.min(riskAdjustedSize / currentPrice, maxPosition / currentPrice);
  }

  /**
   * Get strategy parameters
   */
  getParams(): MeanReversionParams {
    return { ...this.params };
  }

  /**
   * Update strategy parameters
   */
  setParams(params: Partial<MeanReversionParams>): void {
    this.params = { ...this.params, ...params };
  }

  /**
   * Get strategy description
   */
  getDescription(): string {
    return `Mean Reversion Strategy
- Lookback Period: ${this.params.lookbackPeriod} periods
- Entry Threshold: ${this.params.entryThreshold} std devs below MA
- Exit Threshold: ${this.params.exitThreshold} std devs above MA
- Max Holding Period: ${this.params.holdingPeriod} periods`;
  }
}

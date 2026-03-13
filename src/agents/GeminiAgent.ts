/**
 * Gemini Strategy Agent
 * Specializes in cross-asset correlation and fundamental analysis
 */

import { BaseAgent } from './BaseAgent';
import { Signal, MarketData, Portfolio } from '../types';

export class GeminiAgent extends BaseAgent {
  /**
   * Gemini excels at multi-modal analysis and cross-asset correlations
   */
  async analyze(
    marketData: Map<string, MarketData>,
    portfolio: Portfolio
  ): Promise<Signal[]> {
    const signals: Signal[] = [];
    
    // Get correlation pairs
    const pairs = [
      { asset1: 'BTC', asset2: 'ETH', correlation: 0.7 },
      { asset1: 'ETH', asset2: 'SOL', correlation: 0.6 },
      { asset1: 'BTC', asset2: 'SOL', correlation: 0.5 },
    ];
    
    for (const pair of pairs) {
      const data1 = marketData.get(pair.asset1);
      const data2 = marketData.get(pair.asset2);
      
      if (!data1 || !data2) continue;
      
      // Calculate price momentum
      const momentum1 = this.calculateMomentum(data1);
      const momentum2 = this.calculateMomentum(data2);
      
      // Check for divergence (potential spread trade)
      const divergence = Math.abs(momentum1 - momentum2);
      const expectedDivergence = pair.correlation * 0.1;
      
      if (divergence > expectedDivergence * 2) {
        // High divergence - potential mean reversion
        const leadAsset = momentum1 > momentum2 ? pair.asset1 : pair.asset2;
        const lagAsset = momentum1 > momentum2 ? pair.asset2 : pair.asset1;
        
        signals.push({
          asset: leadAsset,
          strategy: 'correlation-spread',
          action: 'sell', // Close the spread
          confidence: 0.65,
          targetSize: portfolio.totalValueUsd * 0.03,
          reasoning: `Gemini: Cross-asset divergence detected. ${leadAsset} leading ${lagAsset}. Divergence: ${(divergence*100).toFixed(2)}%`,
          modelSource: 'gemini',
          timestamp: Date.now(),
        });
        
        signals.push({
          asset: lagAsset,
          strategy: 'correlation-spread',
          action: 'buy', // Close the spread
          confidence: 0.65,
          targetSize: portfolio.totalValueUsd * 0.03,
          reasoning: `Gemini: Cross-asset divergence detected. ${lagAsset} lagging ${leadAsset}. Divergence: ${(divergence*100).toFixed(2)}%`,
          modelSource: 'gemini',
          timestamp: Date.now(),
        });
      }
      
      // Strong momentum in both - trend following
      if (momentum1 > 0.02 && momentum2 > 0.02 && pair.correlation > 0.5) {
        const avgMomentum = (momentum1 + momentum2) / 2;
        
        signals.push({
          asset: pair.asset1,
          strategy: 'correlation-trend',
          action: 'buy',
          confidence: 0.7,
          targetSize: portfolio.totalValueUsd * 0.04,
          reasoning: `Gemini: Strong positive correlation trend. ${pair.asset1} momentum: ${(momentum1*100).toFixed(2)}%, ${pair.asset2} momentum: ${(momentum2*100).toFixed(2)}%`,
          modelSource: 'gemini',
          timestamp: Date.now(),
        });
      }
    }
    
    // Funding rate arbitrage
    for (const [asset, data] of marketData) {
      const annualizedFunding = data.fundingRate * 24 * 365;
      
      // High positive funding - long gets paid
      if (annualizedFunding > 0.10) {
        signals.push({
          asset,
          strategy: 'funding-arbitrage',
          action: 'buy',
          confidence: 0.75,
          targetSize: portfolio.totalValueUsd * 0.05,
          reasoning: `Gemini: High funding rate (${(annualizedFunding*100).toFixed(1)}% annualized). Long position earns funding.`,
          modelSource: 'gemini',
          timestamp: Date.now(),
        });
      }
      // Negative funding - short gets paid
      else if (annualizedFunding < -0.10) {
        signals.push({
          asset,
          strategy: 'funding-arbitrage',
          action: 'sell',
          confidence: 0.75,
          targetSize: portfolio.totalValueUsd * 0.05,
          reasoning: `Gemini: Negative funding (${(annualizedFunding*100).toFixed(1)}% annualized). Short position earns funding.`,
          modelSource: 'gemini',
          timestamp: Date.now(),
        });
      }
    }
    
    return signals;
  }
  
  private calculateMomentum(data: MarketData): number {
    // Simple momentum: position in spread + volume direction
    const pricePosition = (data.last - data.bid) / (data.ask - data.bid);
    const volumeBias = data.volume24h > 0 ? 0.01 : -0.01;
    return pricePosition - 0.5 + volumeBias;
  }
}

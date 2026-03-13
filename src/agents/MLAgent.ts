/**
 * ML Signal Agent
 * Uses technical indicators and ML-style momentum analysis for signal generation
 */

import { BaseAgent } from './BaseAgent';
import { Signal, MarketData, Portfolio, Position, AgentConfig } from '../types';

interface PriceHistory {
  prices: number[];
  timestamps: number[];
}

/**
 * Technical indicators calculator
 */
class TechnicalIndicators {
  /**
   * Calculate Simple Moving Average
   */
  static sma(prices: number[], period: number): number | null {
    if (prices.length < period) return null;
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
  }

  /**
   * Calculate Exponential Moving Average
   */
  static ema(prices: number[], period: number): number | null {
    if (prices.length < period) return null;
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    return ema;
  }

  /**
   * Calculate RSI (Relative Strength Index)
   */
  static rsi(prices: number[], period: number = 14): number | null {
    if (prices.length < period + 1) return null;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  static macd(prices: number[]): { macd: number; signal: number; histogram: number } | null {
    const ema12 = this.ema(prices, 12);
    const ema26 = this.ema(prices, 26);
    
    if (ema12 === null || ema26 === null) return null;
    
    const macdLine = ema12 - ema26;
    // Signal line is 9-period EMA of MACD - simplified for now
    const signalLine = macdLine * 0.9; // Simplified signal
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: macdLine - signalLine,
    };
  }

  /**
   * Calculate Bollinger Bands
   */
  static bollingerBands(prices: number[], period: number = 20, stdDev: number = 2): { upper: number; middle: number; lower: number } | null {
    const sma = this.sma(prices, period);
    if (sma === null) return null;
    
    const slice = prices.slice(-period);
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (stdDev * standardDeviation),
      middle: sma,
      lower: sma - (stdDev * standardDeviation),
    };
  }

  /**
   * Calculate ATR (Average True Range) for volatility
   */
  static atr(highs: number[], lows: number[], closes: number[], period: number = 14): number | null {
    if (closes.length < period + 1) return null;
    
    let trueRanges: number[] = [];
    for (let i = 1; i < closes.length; i++) {
      const tr = Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      );
      trueRanges.push(tr);
    }
    
    if (trueRanges.length < period) return null;
    const recentTR = trueRanges.slice(-period);
    return recentTR.reduce((a, b) => a + b, 0) / period;
  }

  /**
   * Calculate momentum score (0-100)
   */
  static momentum(prices: number[], period: number = 10): number {
    if (prices.length < period) return 50;
    
    const recent = prices.slice(-period);
    const oldest = recent[0];
    const newest = recent[recent.length - 1];
    
    const changePercent = ((newest - oldest) / oldest) * 100;
    
    // Convert to 0-100 score (50 = neutral)
    return Math.min(100, Math.max(0, 50 + changePercent * 5));
  }

  /**
   * Calculate volume-weighted price trend
   */
  static vwap(prices: number[], volumes: number[]): number | null {
    if (prices.length !== volumes.length || prices.length === 0) return null;
    
    let totalPvw = 0;
    let totalVolume = 0;
    
    for (let i = 0; i < prices.length; i++) {
      totalPvw += prices[i] * volumes[i];
      totalVolume += volumes[i];
    }
    
    return totalVolume > 0 ? totalPvw / totalVolume : null;
  }
}

export class MLAgent extends BaseAgent {
  // Simulated price history (in production, would fetch from database/API)
  private priceHistory: Map<string, PriceHistory> = new Map();
  private volumeHistory: Map<string, number[]> = new Map();
  
  constructor(config: AgentConfig) {
    super(config);
  }

  /**
   * Update price history for an asset
   */
  private updateHistory(asset: string, price: number): void {
    let history = this.priceHistory.get(asset);
    if (!history) {
      history = { prices: [], timestamps: [] };
    }
    
    history.prices.push(price);
    history.timestamps.push(Date.now());
    
    // Keep only last 100 data points
    if (history.prices.length > 100) {
      history.prices = history.prices.slice(-100);
      history.timestamps = history.timestamps.slice(-100);
    }
    
    this.priceHistory.set(asset, history);
  }

  /**
   * Generate ML-based signals using technical indicators
   */
  async analyze(
    marketData: Map<string, MarketData>,
    portfolio: Portfolio
  ): Promise<Signal[]> {
    const signals: Signal[] = [];
    const topAssets = ['BTC', 'ETH', 'SOL', 'AVAX', 'ARB'];
    
    for (const asset of topAssets) {
      const data = marketData.get(asset);
      if (!data) continue;
      
      // Update price history
      this.updateHistory(asset, data.last);
      
      const history = this.priceHistory.get(asset);
      if (!history || history.prices.length < 20) {
        // Not enough history, use basic signal
        const basicSignal = this.generateBasicSignal(data, portfolio);
        if (basicSignal) signals.push(basicSignal);
        continue;
      }
      
      // Calculate technical indicators
      const prices = history.prices;
      const rsi = TechnicalIndicators.rsi(prices);
      const sma20 = TechnicalIndicators.sma(prices, 20);
      const sma50 = TechnicalIndicators.sma(prices, 50);
      const ema12 = TechnicalIndicators.ema(prices, 12);
      const ema26 = TechnicalIndicators.ema(prices, 26);
      const macd = TechnicalIndicators.macd(prices);
      const bollinger = TechnicalIndicators.bollingerBands(prices);
      const momentum = TechnicalIndicators.momentum(prices);
      
      // Generate signal based on ML indicators
      const mlSignal = this.generateMLSignal(
        asset,
        data,
        portfolio,
        { rsi, sma20, sma50, ema12, ema26, macd, bollinger, momentum }
      );
      
      if (mlSignal) signals.push(mlSignal);
    }
    
    return signals;
  }

  /**
   * Generate basic signal when insufficient history
   */
  private generateBasicSignal(data: MarketData, portfolio: Portfolio): Signal | null {
    const spread = (data.ask - data.bid) / data.bid;
    const priceChange = (data.last - data.bid) / data.bid;
    
    if (spread > 0.005) return null; // Too volatile
    
    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let confidence = 0.5;
    
    if (priceChange > 0.02 && data.volume24h > 1000000) {
      action = 'buy';
      confidence = 0.65;
    } else if (priceChange < -0.02 && data.volume24h > 1000000) {
      action = 'sell';
      confidence = 0.65;
    }
    
    if (action === 'hold') return null;
    
    return {
      asset: data.asset,
      strategy: 'ml-basic',
      action,
      confidence,
      targetSize: portfolio.totalValueUsd * 0.03,
      reasoning: `ML-Agent: Basic momentum signal. Volume: $${(data.volume24h/1e6).toFixed(1)}M`,
      modelSource: 'minimax', // Reuse existing model type
      timestamp: Date.now(),
    };
  }

  /**
   * Generate ML-enhanced signal using multiple indicators
   */
  private generateMLSignal(
    asset: string,
    data: MarketData,
    portfolio: Portfolio,
    indicators: {
      rsi: number | null;
      sma20: number | null;
      sma50: number | null;
      ema12: number | null;
      ema26: number | null;
      macd: { macd: number; signal: number; histogram: number } | null;
      bollinger: { upper: number; middle: number; lower: number } | null;
      momentum: number;
    }
  ): Signal | null {
    let buyScore = 0;
    let sellScore = 0;
    const signals: string[] = [];
    
    // RSI analysis
    if (indicators.rsi !== null) {
      if (indicators.rsi < 30) {
        buyScore += 2;
        signals.push(`RSI oversold (${indicators.rsi.toFixed(1)})`);
      } else if (indicators.rsi > 70) {
        sellScore += 2;
        signals.push(`RSI overbought (${indicators.rsi.toFixed(1)})`);
      }
    }
    
    // Moving average crossovers
    if (indicators.ema12 !== null && indicators.ema26 !== null) {
      if (indicators.ema12 > indicators.ema26) {
        buyScore += 1.5;
        signals.push('EMA 12/26 bullish crossover');
      } else {
        sellScore += 1.5;
        signals.push('EMA 12/26 bearish crossover');
      }
    }
    
    // SMA trend
    if (indicators.sma20 !== null && indicators.sma50 !== null) {
      if (data.last > indicators.sma20 && indicators.sma20 > indicators.sma50) {
        buyScore += 1;
        signals.push('Price above 20/50 SMA bullish alignment');
      } else if (data.last < indicators.sma20 && indicators.sma20 < indicators.sma50) {
        sellScore += 1;
        signals.push('Price below 20/50 SMA bearish alignment');
      }
    }
    
    // MACD histogram
    if (indicators.macd) {
      if (indicators.macd.histogram > 0) {
        buyScore += 1;
        signals.push('MACD histogram positive');
      } else {
        sellScore += 1;
        signals.push('MACD histogram negative');
      }
    }
    
    // Bollinger Bands
    if (indicators.bollinger) {
      if (data.last < indicators.bollinger.lower) {
        buyScore += 1.5;
        signals.push('Price at lower Bollinger Band (oversold)');
      } else if (data.last > indicators.bollinger.upper) {
        sellScore += 1.5;
        signals.push('Price at upper Bollinger Band (overbought)');
      }
    }
    
    // Momentum
    if (indicators.momentum > 65) {
      buyScore += 1;
      signals.push(`Strong momentum (${indicators.momentum.toFixed(1)})`);
    } else if (indicators.momentum < 35) {
      sellScore += 1;
      signals.push(`Weak momentum (${indicators.momentum.toFixed(1)})`);
    }
    
    // Determine action and confidence
    let action: 'buy' | 'sell' | 'hold' = 'hold';
    let confidence = 0;
    const totalScore = buyScore + sellScore;
    
    if (totalScore >= 3) {
      if (buyScore > sellScore) {
        action = 'buy';
        confidence = Math.min(0.9, 0.5 + (buyScore / 10));
      } else if (sellScore > buyScore) {
        action = 'sell';
        confidence = Math.min(0.9, 0.5 + (sellScore / 10));
      }
    }
    
    if (action === 'hold' || confidence < 0.6) return null;
    
    return {
      asset,
      strategy: 'ml-technical',
      action,
      confidence,
      targetSize: portfolio.totalValueUsd * 0.05,
      stopLoss: action === 'buy' ? data.last * 0.97 : data.last * 1.03,
      takeProfit: action === 'buy' ? data.last * 1.05 : data.last * 0.95,
      reasoning: `ML-Agent: ${signals.join('; ')}`,
      modelSource: 'minimax',
      timestamp: Date.now(),
    };
  }
}

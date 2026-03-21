/**
 * Arbitrage Agent
 * Detects and executes cross-exchange arbitrage opportunities
 */
import { BaseAgent } from './BaseAgent';
import { Signal, MarketData, Portfolio } from '../types';
export declare class ArbitrageAgent extends BaseAgent {
    private minArbitragePercent;
    private historicalPrices;
    /**
     * Analyze market data for arbitrage opportunities
     */
    analyze(marketData: Map<string, MarketData>, portfolio: Portfolio): Promise<Signal[]>;
    /**
     * Find arbitrage opportunities between markets
     */
    private findArbitrageOpportunities;
    /**
     * Record price for historical analysis
     */
    recordPrice(asset: string, price: number): void;
    /**
     * Get historical prices for an asset
     */
    getHistoricalPrices(asset: string): number[];
    /**
     * Set minimum arbitrage percentage threshold
     */
    setMinArbitragePercent(percent: number): void;
}
//# sourceMappingURL=ArbitrageAgent.d.ts.map
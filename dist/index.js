"use strict";
/**
 * Hyperliquid Trading System
 * Main entry point
 */
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const hyperliquid_1 = require("./utils/hyperliquid");
const agents_1 = require("./agents");
const logger_1 = require("./utils/logger");
const riskManager_1 = require("./utils/riskManager");
class TradingSystem {
    constructor() {
        this.running = false;
        this.dataInterval = null;
        this.analysisInterval = null;
    }
    /**
     * Initialize the trading system
     */
    async initialize() {
        logger_1.logger.info('Initializing Hyperliquid Trading System...');
        // Initialize wallet
        const address = await hyperliquid_1.hyperliquid.initialize();
        logger_1.logger.info(`Trading from wallet: ${address}`);
        // Initialize agents
        agents_1.agentFactory.initialize();
        logger_1.logger.info(`Initialized ${agents_1.agentFactory.getEnabledAgents().length} agents`);
        this.running = true;
    }
    /**
     * Start the trading loops
     */
    start() {
        if (!this.running) {
            throw new Error('System not initialized');
        }
        logger_1.logger.info('Starting trading system...');
        // Data collection loop
        this.dataInterval = setInterval(() => this.collectMarketData(), config_1.config.agents.dataAgentIntervalMs);
        // Analysis loop
        this.analysisInterval = setInterval(() => this.runTradingCycle(), config_1.config.agents.analysisAgentIntervalMs);
        // Run initial cycle
        this.runTradingCycle();
    }
    /**
     * Stop the trading system
     */
    stop() {
        logger_1.logger.info('Stopping trading system...');
        if (this.dataInterval)
            clearInterval(this.dataInterval);
        if (this.analysisInterval)
            clearInterval(this.analysisInterval);
        this.running = false;
        logger_1.logger.info('Trading system stopped');
    }
    /**
     * Collect market data for all assets
     */
    async collectMarketData() {
        const marketData = new Map();
        try {
            const assets = await hyperliquid_1.hyperliquid.getAssets();
            // Get data for top assets (limit to avoid rate limits)
            const topAssets = assets.slice(0, 20);
            for (const asset of topAssets) {
                try {
                    const data = await hyperliquid_1.hyperliquid.getMarketData(asset);
                    marketData.set(asset, data);
                }
                catch (error) {
                    logger_1.logger.warn(`Failed to get market data for ${asset}`, { error });
                }
            }
            logger_1.logger.debug(`Collected market data for ${marketData.size} assets`);
        }
        catch (error) {
            logger_1.logger.error('Failed to collect market data', { error });
        }
        return marketData;
    }
    /**
     * Get current portfolio state
     */
    async getPortfolio() {
        const positions = await hyperliquid_1.hyperliquid.getPositions();
        const usdcBalance = await hyperliquid_1.hyperliquid.getUsdcBalance();
        const totalValue = positions.reduce((sum, p) => {
            return sum + p.size * p.currentPrice;
        }, usdcBalance);
        const reserved = totalValue * config_1.config.risk.emergencyReservePercent;
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
    async runTradingCycle() {
        try {
            logger_1.logger.info('Starting trading cycle...');
            // Get market data
            const marketData = await this.collectMarketData();
            // Get portfolio
            const portfolio = await this.getPortfolio();
            // Run strategy agents
            const strategyResults = await agents_1.agentFactory.runStrategyAgents(marketData, portfolio);
            // Run ensemble to combine signals
            const ensembleResult = await agents_1.agentFactory.runEnsembleAgent(marketData, portfolio);
            // Execute final signals
            for (const signal of ensembleResult.signals) {
                await this.executeSignal(signal);
            }
            logger_1.logger.info(`Trading cycle complete. Generated ${ensembleResult.signals.length} signals`);
        }
        catch (error) {
            logger_1.logger.error('Trading cycle failed', { error });
        }
    }
    /**
     * Execute a trading signal
     */
    async executeSignal(signal) {
        // Get current portfolio for risk checks
        const portfolio = await this.getPortfolio();
        if (config_1.config.agents.riskCheckEnabled) {
            // Run risk checks before execution
            const riskCheck = riskManager_1.riskManager.checkSignal(signal, portfolio);
            if (!riskCheck.passed) {
                logger_1.logger.warn(`Signal blocked by risk checks: ${signal.asset} ${signal.action}`, {
                    violations: riskCheck.violations,
                });
                return;
            }
            // Log warning for non-critical violations
            const warnings = riskCheck.violations.filter(v => v.severity === 'warning');
            if (warnings.length > 0) {
                logger_1.logger.warn('Risk warnings', { warnings });
            }
        }
        await this.placeOrderFromSignal(signal);
    }
    /**
     * Place order from signal
     */
    async placeOrderFromSignal(signal) {
        try {
            const order = {
                coin: signal.asset,
                side: signal.action === 'buy' ? 'A' : 'B',
                sz: signal.targetSize || 0,
            };
            await hyperliquid_1.hyperliquid.placeOrder(order);
            logger_1.logger.info(`Executed ${signal.action} order for ${signal.asset}`, {
                size: order.sz,
                strategy: signal.strategy,
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to execute signal', { signal, error });
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
    }
    catch (error) {
        logger_1.logger.error('Fatal error', { error });
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map
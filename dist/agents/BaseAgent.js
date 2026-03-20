"use strict";
/**
 * Base Agent Class
 * All trading agents inherit from this
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
const logger_1 = require("../utils/logger");
class BaseAgent {
    constructor(config) {
        this.lastRun = 0;
        this.config = config;
    }
    /**
     * Execute the agent with timing control
     */
    async execute(marketData, portfolio) {
        const startTime = Date.now();
        try {
            if (!this.config.enabled) {
                logger_1.logger.debug(`${this.config.name} is disabled, skipping`);
                return {
                    agentId: this.config.id,
                    signals: [],
                    timestamp: startTime,
                };
            }
            logger_1.logger.info(`Running agent: ${this.config.name} (${this.config.model})`);
            const signals = await this.analyze(marketData, portfolio);
            // Filter by confidence threshold
            const filteredSignals = signals.filter(s => s.confidence >= 0.6);
            // Adjust signal sizes based on agent's max position
            const adjustedSignals = filteredSignals.map(s => ({
                ...s,
                targetSize: Math.min(s.targetSize || 0, (portfolio.totalValueUsd * this.config.maxPositionPercent)),
            }));
            logger_1.logger.info(`Agent ${this.config.name} generated ${adjustedSignals.length} signals`);
            this.lastRun = Date.now();
            return {
                agentId: this.config.id,
                signals: adjustedSignals,
                timestamp: startTime,
            };
        }
        catch (error) {
            logger_1.logger.error(`Agent ${this.config.name} failed`, { error });
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
    getConfig() {
        return this.config;
    }
    /**
     * Enable/disable the agent
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
    }
    /**
     * Get time since last run
     */
    getTimeSinceLastRun() {
        return Date.now() - this.lastRun;
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=BaseAgent.js.map
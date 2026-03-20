"use strict";
/**
 * Agent Factory
 * Creates and manages all trading agents
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentFactory = exports.AgentFactory = void 0;
const GPTAgent_1 = require("./GPTAgent");
const GeminiAgent_1 = require("./GeminiAgent");
const MiniMaxAgent_1 = require("./MiniMaxAgent");
const EnsembleAgent_1 = require("./EnsembleAgent");
const MLAgent_1 = require("./MLAgent");
const logger_1 = require("../utils/logger");
// Default agent configurations
const DEFAULT_AGENT_CONFIGS = [
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
];
class AgentFactory {
    constructor() {
        this.agents = new Map();
        // Create ensemble agent first
        this.ensembleAgent = new EnsembleAgent_1.EnsembleAgent(DEFAULT_AGENT_CONFIGS.find(c => c.model === 'ensemble'));
    }
    /**
     * Initialize all agents
     */
    initialize() {
        for (const config of DEFAULT_AGENT_CONFIGS) {
            const agent = this.createAgent(config);
            this.agents.set(config.id, agent);
            logger_1.logger.info(`Initialized agent: ${config.name} (${config.model})`);
        }
    }
    /**
     * Create agent based on model type
     */
    createAgent(config) {
        switch (config.model) {
            case 'gpt':
                return new GPTAgent_1.GPTAgent(config);
            case 'gemini':
                return new GeminiAgent_1.GeminiAgent(config);
            case 'minimax':
                // Use ML agent for epsilon-ml, MiniMax for others
                if (config.id === 'epsilon-ml') {
                    return new MLAgent_1.MLAgent(config);
                }
                return new MiniMaxAgent_1.MiniMaxAgent(config);
            case 'ensemble':
                return this.ensembleAgent;
            default:
                throw new Error(`Unknown model type: ${config.model}`);
        }
    }
    /**
     * Run all strategy agents (non-ensemble)
     */
    async runStrategyAgents(marketData, portfolio) {
        const results = [];
        for (const [id, agent] of this.agents) {
            if (id === 'delta-ensemble')
                continue; // Skip ensemble, run separately
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
    async runEnsembleAgent(marketData, portfolio) {
        return await this.ensembleAgent.execute(marketData, portfolio);
    }
    /**
     * Get all enabled agents
     */
    getEnabledAgents() {
        return Array.from(this.agents.values()).filter(a => a.getConfig().enabled);
    }
    /**
     * Get agent by ID
     */
    getAgent(id) {
        return this.agents.get(id);
    }
    /**
     * Enable/disable agent
     */
    setAgentEnabled(id, enabled) {
        const agent = this.agents.get(id);
        if (agent) {
            agent.setEnabled(enabled);
            logger_1.logger.info(`Agent ${id} ${enabled ? 'enabled' : 'disabled'}`);
        }
    }
    /**
     * Get all agent statuses
     */
    getAgentStatuses() {
        return Array.from(this.agents.values()).map(a => a.getConfig());
    }
}
exports.AgentFactory = AgentFactory;
exports.agentFactory = new AgentFactory();
//# sourceMappingURL=index.js.map
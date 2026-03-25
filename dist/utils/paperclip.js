"use strict";
/**
 * Paperclip API Client
 * Fetches agent data from Paperclip for dashboard integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.paperclipClient = void 0;
const logger_1 = require("./logger");
class PaperclipClient {
    constructor() {
        this.config = null;
        this.cachedAgents = [];
        this.lastFetch = 0;
        this.cacheTimeoutMs = 30000; // 30 second cache
    }
    /**
     * Configure the Paperclip client
     */
    configure(config) {
        this.config = config;
        logger_1.logger.info('Paperclip client configured');
    }
    /**
     * Check if client is configured
     */
    isConfigured() {
        return this.config !== null;
    }
    /**
     * Fetch all agents from Paperclip company
     */
    async fetchAgents() {
        if (!this.config) {
            logger_1.logger.warn('Paperclip client not configured');
            return [];
        }
        // Check cache
        if (Date.now() - this.lastFetch < this.cacheTimeoutMs && this.cachedAgents.length > 0) {
            logger_1.logger.debug('Returning cached Paperclip agents');
            return this.cachedAgents;
        }
        try {
            const response = await fetch(`${this.config.apiUrl}/api/companies/${this.config.companyId}/agents`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Paperclip API error: ${response.status} ${response.statusText}`);
            }
            const agentsRaw = await response.json();
            const agents = Array.isArray(agentsRaw) ? agentsRaw : [];
            // Transform to our format
            this.cachedAgents = agents.map((agent) => ({
                id: agent.id,
                name: agent.name,
                role: agent.role,
                status: this.mapStatus(agent.status),
                lastHeartbeatAt: agent.lastHeartbeatAt,
                capabilities: agent.capabilities,
                title: agent.title,
                urlKey: agent.urlKey,
            }));
            this.lastFetch = Date.now();
            logger_1.logger.info(`Fetched ${this.cachedAgents.length} agents from Paperclip`);
            return this.cachedAgents;
        }
        catch (error) {
            logger_1.logger.error('Failed to fetch Paperclip agents', { error: error.message });
            // Return cached data if available
            return this.cachedAgents;
        }
    }
    /**
     * Map Paperclip status to our format
     */
    mapStatus(status) {
        switch (status) {
            case 'running':
                return 'running';
            case 'idle':
            case 'stopped':
                return 'idle';
            case 'error':
                return 'error';
            default:
                return 'idle';
        }
    }
    /**
     * Get agent by ID
     */
    async getAgent(agentId) {
        const agents = await this.fetchAgents();
        return agents.find(a => a.id === agentId) || null;
    }
}
exports.paperclipClient = new PaperclipClient();
//# sourceMappingURL=paperclip.js.map
/**
 * Paperclip API Client
 * Fetches agent data from Paperclip for dashboard integration
 */

import { logger } from './logger';

export interface PaperclipAgent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'running' | 'stopped' | 'error';
  lastHeartbeatAt: string | null;
  capabilities: string | null;
  title: string | null;
  urlKey: string;
}

export interface PaperclipConfig {
  apiUrl: string;
  apiKey: string;
  companyId: string;
}

class PaperclipClient {
  private config: PaperclipConfig | null = null;
  private cachedAgents: PaperclipAgent[] = [];
  private lastFetch: number = 0;
  private cacheTimeoutMs: number = 30000; // 30 second cache

  /**
   * Configure the Paperclip client
   */
  configure(config: PaperclipConfig): void {
    this.config = config;
    logger.info('Paperclip client configured');
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return this.config !== null;
  }

  /**
   * Fetch all agents from Paperclip company
   */
  async fetchAgents(): Promise<PaperclipAgent[]> {
    if (!this.config) {
      logger.warn('Paperclip client not configured');
      return [];
    }

    // Check cache
    if (Date.now() - this.lastFetch < this.cacheTimeoutMs && this.cachedAgents.length > 0) {
      logger.debug('Returning cached Paperclip agents');
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
      const agents = Array.isArray(agentsRaw) ? agentsRaw as any[] : [];
      
      // Transform to our format
      this.cachedAgents = agents.map((agent: any) => ({
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
      logger.info(`Fetched ${this.cachedAgents.length} agents from Paperclip`);
      
      return this.cachedAgents;
    } catch (error: any) {
      logger.error('Failed to fetch Paperclip agents', { error: error.message });
      // Return cached data if available
      return this.cachedAgents;
    }
  }

  /**
   * Map Paperclip status to our format
   */
  private mapStatus(status: string): 'idle' | 'running' | 'stopped' | 'error' {
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
  async getAgent(agentId: string): Promise<PaperclipAgent | null> {
    const agents = await this.fetchAgents();
    return agents.find(a => a.id === agentId) || null;
  }
}

export const paperclipClient = new PaperclipClient();
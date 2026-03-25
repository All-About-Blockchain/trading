/**
 * Paperclip API Client
 * Fetches agent data from Paperclip for dashboard integration
 */
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
declare class PaperclipClient {
    private config;
    private cachedAgents;
    private lastFetch;
    private cacheTimeoutMs;
    /**
     * Configure the Paperclip client
     */
    configure(config: PaperclipConfig): void;
    /**
     * Check if client is configured
     */
    isConfigured(): boolean;
    /**
     * Fetch all agents from Paperclip company
     */
    fetchAgents(): Promise<PaperclipAgent[]>;
    /**
     * Map Paperclip status to our format
     */
    private mapStatus;
    /**
     * Get agent by ID
     */
    getAgent(agentId: string): Promise<PaperclipAgent | null>;
}
export declare const paperclipClient: PaperclipClient;
export {};
//# sourceMappingURL=paperclip.d.ts.map
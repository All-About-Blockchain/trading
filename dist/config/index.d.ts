/**
 * Hyperliquid Trading Configuration
 */
export interface TradingConfig {
    hyperliquid: {
        network: 'mainnet' | 'testnet';
        apiUrl: string;
        wsUrl: string;
    };
    wallet: {
        privateKey: string;
        vaultSecretPath?: string;
    };
    agents: {
        dataAgentIntervalMs: number;
        analysisAgentIntervalMs: number;
        riskCheckEnabled: boolean;
    };
    risk: {
        maxPositionPerAsset: number;
        maxSectorExposure: number;
        maxLeverage: number;
        dailyLossLimit: number;
        weeklyLossLimit: number;
        totalLossLimit: number;
        emergencyReservePercent: number;
        minPositionSize: number;
    };
    database: {
        postgres: {
            host: string;
            port: number;
            database: string;
            user: string;
            password: string;
        };
        redis: {
            host: string;
            port: number;
        };
    };
    logging: {
        level: 'debug' | 'info' | 'warn' | 'error';
        filePath?: string;
    };
}
export declare const config: TradingConfig;
//# sourceMappingURL=index.d.ts.map
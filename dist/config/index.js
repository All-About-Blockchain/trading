"use strict";
/**
 * Hyperliquid Trading Configuration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Default API URLs for mainnet and testnet
const DEFAULT_API_URL = 'https://api.hyperliquid.xyz';
const DEFAULT_WS_URL = 'wss://ws.hyperliquid.xyz';
const TESTNET_API_URL = 'https://api.hyperliquid-testnet.xyz';
const TESTNET_WS_URL = 'wss://ws.hyperliquid-testnet.xyz';
exports.config = {
    hyperliquid: {
        network: process.env.HL_NETWORK || 'mainnet',
        apiUrl: process.env.HL_API_URL ||
            (process.env.HL_NETWORK === 'testnet' ? TESTNET_API_URL : DEFAULT_API_URL),
        wsUrl: process.env.HL_WS_URL ||
            (process.env.HL_NETWORK === 'testnet' ? TESTNET_WS_URL : DEFAULT_WS_URL),
    },
    wallet: {
        privateKey: process.env.WALLET_PRIVATE_KEY || '',
        vaultSecretPath: process.env.VAULT_SECRET_PATH,
    },
    agents: {
        dataAgentIntervalMs: parseInt(process.env.DATA_AGENT_INTERVAL_MS || '5000'),
        analysisAgentIntervalMs: parseInt(process.env.ANALYSIS_INTERVAL_MS || '30000'),
        riskCheckEnabled: process.env.RISK_CHECK_ENABLED !== 'false',
    },
    risk: {
        maxPositionPerAsset: 0.10, // 10%
        maxSectorExposure: 0.30, // 30%
        maxLeverage: 5,
        dailyLossLimit: 0.05, // 5%
        weeklyLossLimit: 0.10, // 10%
        totalLossLimit: 0.20, // 20%
        emergencyReservePercent: 0.10, // 10%
    },
    database: {
        postgres: {
            host: process.env.PG_HOST || 'localhost',
            port: parseInt(process.env.PG_PORT || '5432'),
            database: process.env.PG_DATABASE || 'hyperliquid_trading',
            user: process.env.PG_USER || 'postgres',
            password: process.env.PG_PASSWORD || '',
        },
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        },
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        filePath: process.env.LOG_FILE_PATH,
    },
};
//# sourceMappingURL=index.js.map
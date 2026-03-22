/**
 * Hyperliquid Trading Configuration
 */

import dotenv from 'dotenv';
dotenv.config();

export interface TradingConfig {
  // Hyperliquid API
  hyperliquid: {
    network: 'mainnet' | 'testnet';
    apiUrl: string;
    wsUrl: string;
  };
  
  // Wallet configuration
  wallet: {
    privateKey: string;
    // For production: use vault/HSM
    vaultSecretPath?: string;
  };
  
  // Agent configuration
  agents: {
    dataAgentIntervalMs: number;
    analysisAgentIntervalMs: number;
    riskCheckEnabled: boolean;
  };
  
  // Risk management
  risk: {
    maxPositionPerAsset: number;    // % of portfolio
    maxSectorExposure: number;      // % of portfolio
    maxLeverage: number;
    dailyLossLimit: number;         // % - triggers position reduction
    weeklyLossLimit: number;        // % - triggers pause
    totalLossLimit: number;         // % - triggers full stop
    emergencyReservePercent: number; // USDC reserve %
    minPositionSize: number;       // Minimum position size in USD
  };
  
  // Database
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
  
  // Logging
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    filePath?: string;
  };
}

// Default API URLs for mainnet and testnet
const DEFAULT_API_URL = 'https://api.hyperliquid.xyz';
const DEFAULT_WS_URL = 'wss://ws.hyperliquid.xyz';
const TESTNET_API_URL = 'https://api.hyperliquid-testnet.xyz';
const TESTNET_WS_URL = 'wss://ws.hyperliquid-testnet.xyz';

export const config: TradingConfig = {
  hyperliquid: {
    network: process.env.HL_NETWORK as 'mainnet' | 'testnet' || 'mainnet',
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
    maxPositionPerAsset: 0.10,       // 10%
    maxSectorExposure: 0.30,         // 30%
    maxLeverage: 5,
    dailyLossLimit: 0.05,           // 5%
    weeklyLossLimit: 0.10,         // 10%
    totalLossLimit: 0.20,           // 20%
    emergencyReservePercent: 0.10,  // 10%
    minPositionSize: 10,           // $10 minimum
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
    level: (process.env.LOG_LEVEL as any) || 'info',
    filePath: process.env.LOG_FILE_PATH,
  },
};

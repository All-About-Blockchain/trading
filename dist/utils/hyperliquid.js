"use strict";
/**
 * Hyperliquid API Client
 * Fixed for testnet API compatibility
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hlClient = exports.hyperliquid = exports.HyperliquidClient = void 0;
const axios_1 = __importDefault(require("axios"));
const ethers_1 = require("ethers");
const config_1 = require("../config");
const logger_1 = require("./logger");
class HyperliquidClient {
    constructor() {
        this.address = '';
        this.wallet = null;
        this.apiUrl = config_1.config.hyperliquid.apiUrl;
        this.wsUrl = config_1.config.hyperliquid.wsUrl;
    }
    async initialize() {
        const privateKey = config_1.config.wallet.privateKey;
        if (!privateKey) {
            logger_1.logger.warn('No wallet private key - read only mode');
            return '';
        }
        // Remove 0x prefix if present
        const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
        this.wallet = new ethers_1.ethers.Wallet('0x' + cleanKey);
        this.address = this.wallet.address;
        logger_1.logger.info(`Wallet initialized: ${this.address}`);
        return this.address;
    }
    async getBalance() {
        let totalBalance = 0;
        try {
            // Get cross margin (futures) balance
            const response = await axios_1.default.post(this.apiUrl + '/info', {
                type: 'clearinghouseState',
                user: this.address
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.data?.withdrawable) {
                totalBalance += parseFloat(response.data.withdrawable) || 0;
            }
        }
        catch (e) {
            logger_1.logger.warn('Failed to get cross margin balance:', e);
        }
        try {
            // Get spot wallet balance
            const spotResponse = await axios_1.default.post(this.apiUrl + '/info', {
                type: 'spotClearinghouseState',
                user: this.address
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (spotResponse.data?.balances) {
                const usdcBalance = spotResponse.data.balances.find((b) => b.coin === 'USDC');
                if (usdcBalance && usdcBalance.total) {
                    totalBalance += parseFloat(usdcBalance.total) || 0;
                }
            }
        }
        catch (e) {
            logger_1.logger.warn('Failed to get spot balance:', e);
        }
        return {
            available: totalBalance,
            total: totalBalance
        };
    }
    async getMarkets() {
        try {
            const response = await axios_1.default.post(this.apiUrl + '/info', {
                type: 'allMids'
            });
            return response.data;
        }
        catch (e) {
            logger_1.logger.error('Failed to get markets:', e);
            return {};
        }
    }
    // Methods expected by dashboard and reporting
    async getPositions() {
        try {
            if (!this.address) {
                logger_1.logger.warn('No address, returning empty positions');
                return [];
            }
            const response = await axios_1.default.post(this.apiUrl + '/info', {
                type: 'userPositions',
                user: this.address
            });
            const positions = response.data || [];
            // Add computed fields
            return positions.map((p) => ({
                ...p,
                asset: p.coin,
                currentPrice: p.markPrice || p.entryPrice || 0,
                leverage: 1,
                side: p.side === 'Long' ? 'long' : 'short'
            }));
        }
        catch (e) {
            logger_1.logger.warn('Failed to get positions, returning empty');
            return [];
        }
    }
    async getUsdcBalance() {
        const balance = await this.getBalance();
        return balance.total;
    }
    async getFillHistory() {
        try {
            if (!this.address) {
                return [];
            }
            const response = await axios_1.default.post(this.apiUrl + '/info', {
                type: 'userFills',
                user: this.address
            });
            return response.data || [];
        }
        catch (e) {
            logger_1.logger.warn('Failed to get fill history, returning empty');
            return [];
        }
    }
    async getAssets() {
        try {
            const response = await axios_1.default.post(this.apiUrl + '/info', {
                type: 'meta'
            });
            // Extract asset names from the universe response
            const universe = response.data?.universe || [];
            return universe.map((a) => a.name).filter((n) => n && !n.startsWith('k'));
        }
        catch (e) {
            logger_1.logger.warn('Failed to get assets, returning default list');
            return ['BTC', 'ETH', 'SOL', 'ARB', 'AVAX'];
        }
    }
    async placeOrder(order) {
        if (!this.wallet) {
            throw new Error('Wallet not initialized');
        }
        logger_1.logger.info(`Placing order: ${order.coin} ${order.side} ${order.sz}`);
        return { success: true, orderId: 'sim_' + Date.now() };
    }
    getAddress() {
        return this.address;
    }
    isInitialized() {
        return this.wallet !== null;
    }
    // Legacy methods for compatibility
    isAuthenticated() {
        return this.isInitialized();
    }
    async getMarketData(coin) {
        const markets = await this.getMarkets();
        // The markets response uses "@SYMBOL" format
        const key = '@' + coin;
        const priceStr = markets[key] || markets[coin] || '0';
        const price = typeof priceStr === 'string' ? parseFloat(priceStr) : priceStr;
        // Get bid/ask from allMids response (it's the mid price)
        return {
            asset: coin,
            bid: price * 0.999,
            ask: price * 1.001,
            last: price,
            volume24h: 1000000, // Default volume
            fundingRate: 0,
            openInterest: 0,
            timestamp: Date.now(),
        };
    }
    async cancelOrder(orderId) {
        logger_1.logger.info(`Cancelling order: ${orderId}`);
        return { success: true };
    }
    async getOpenOrders() {
        return [];
    }
}
exports.HyperliquidClient = HyperliquidClient;
exports.hyperliquid = new HyperliquidClient();
// Alias for backwards compatibility
exports.hlClient = exports.hyperliquid;
//# sourceMappingURL=hyperliquid.js.map
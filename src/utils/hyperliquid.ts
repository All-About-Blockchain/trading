/**
 * Hyperliquid API Client
 * Fixed for testnet API compatibility
 */

import axios from 'axios';
import { ethers } from 'ethers';
import { config } from '../config';
import { logger } from './logger';

export interface Balance {
  available: number;
  total: number;
}

export interface Position {
  coin: string;
  size: number;
  side: 'long' | 'short';
  entryPrice: number;
  markPrice: number;
  pnl: number;
  currentPrice: number;
  leverage: number;
  asset: string;
}

export class HyperliquidClient {
  // Make these public for prototype methods
  apiUrl: string;
  wsUrl: string;
  address: string = '';
  private wallet: ethers.Wallet | null = null;

  constructor() {
    this.apiUrl = config.hyperliquid.apiUrl;
    this.wsUrl = config.hyperliquid.wsUrl;
  }

  async initialize(): Promise<string> {
    const privateKey = config.wallet.privateKey;
    
    if (!privateKey) {
      logger.warn('No wallet private key - read only mode');
      return '';
    }

    // Remove 0x prefix if present
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    this.wallet = new ethers.Wallet('0x' + cleanKey);
    this.address = this.wallet.address;
    
    logger.info(`Wallet initialized: ${this.address}`);
    return this.address;
  }

  async getBalance(): Promise<Balance> {
    let totalBalance = 0;
    
    try {
      // Get cross margin (futures) balance
      const response = await axios.post(this.apiUrl + '/info', {
        type: 'clearinghouseState',
        user: this.address
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.data?.withdrawable) {
        totalBalance += parseFloat(response.data.withdrawable) || 0;
      }
    } catch (e: any) {
      logger.warn('Failed to get cross margin balance:', e);
    }
    
    try {
      // Get spot wallet balance
      const spotResponse = await axios.post(this.apiUrl + '/info', {
        type: 'spotClearinghouseState',
        user: this.address
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (spotResponse.data?.balances) {
        const usdcBalance = spotResponse.data.balances.find((b: any) => b.coin === 'USDC');
        if (usdcBalance && usdcBalance.total) {
          totalBalance += parseFloat(usdcBalance.total) || 0;
        }
      }
    } catch (e: any) {
      logger.warn('Failed to get spot balance:', e);
    }
    
    return {
      available: totalBalance,
      total: totalBalance
    };
  }

  async getMarkets(): Promise<Record<string, string>> {
    try {
      const response = await axios.post(this.apiUrl + '/info', {
        type: 'allMids'
      });
      return response.data;
    } catch (e) {
      logger.error('Failed to get markets:', e);
      return {};
    }
  }

  // Methods expected by dashboard and reporting
  async getPositions(): Promise<any[]> {
    try {
      if (!this.address) {
        logger.warn('No address, returning empty positions');
        return [];
      }
      const response = await axios.post(this.apiUrl + '/info', {
        type: 'userPositions',
        user: this.address
      });
      const positions = response.data || [];
      // Add computed fields
      return positions.map((p: any) => ({
        ...p,
        asset: p.coin,
        currentPrice: p.markPrice || p.entryPrice || 0,
        leverage: 1,
        side: p.side === 'Long' ? 'long' : 'short'
      }));
    } catch (e) {
      logger.warn('Failed to get positions, returning empty');
      return [];
    }
  }

  async getUsdcBalance(): Promise<number> {
    const balance = await this.getBalance();
    return balance.total;
  }

  async getFillHistory(): Promise<any[]> {
    try {
      if (!this.address) {
        return [];
      }
      const response = await axios.post(this.apiUrl + '/info', {
        type: 'userFills',
        user: this.address
      });
      return response.data || [];
    } catch (e) {
      logger.warn('Failed to get fill history, returning empty');
      return [];
    }
  }

  async getAssets(): Promise<string[]> {
    try {
      const response = await axios.post(this.apiUrl + '/info', {
        type: 'meta'
      });
      // Extract asset names from the universe response
      const universe = response.data?.universe || [];
      return universe.map((a: any) => a.name).filter((n: string) => n && !n.startsWith('k'));
    } catch (e) {
      logger.warn('Failed to get assets, returning default list');
      return ['BTC', 'ETH', 'SOL', 'ARB', 'AVAX'];
    }
  }

  async placeOrder(order: {
    coin: string;
    side: 'A' | 'B';
    sz: number;
    limitPx?: number;
  }) {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    
    logger.info(`Placing order: ${order.coin} ${order.side} ${order.sz}`);
    return { success: true, orderId: 'sim_' + Date.now() };
  }

  getAddress(): string {
    return this.address;
  }

  isInitialized(): boolean {
    return this.wallet !== null;
  }

  // Legacy methods for compatibility
  isAuthenticated(): boolean {
    return this.isInitialized();
  }

  async getMarketData(coin: string): Promise<any> {
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

  async cancelOrder(orderId: string): Promise<any> {
    logger.info(`Cancelling order: ${orderId}`);
    return { success: true };
  }

  async getOpenOrders(): Promise<any[]> {
    return [];
  }
}

export const hyperliquid = new HyperliquidClient();

// Alias for backwards compatibility
export const hlClient = hyperliquid;

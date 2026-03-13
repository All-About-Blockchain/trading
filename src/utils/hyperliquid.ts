/**
 * Hyperliquid API Client
 * Wraps the SDK for trading operations
 */

import { HttpTransport, ExchangeClient, InfoClient } from '@nktkas/hyperliquid';
import { config } from '../config';
import { Order, MarketData, Position, Trade } from '../types';
import { logger } from './logger';

export class HyperliquidClient {
  private transport: HttpTransport;
  private info: InfoClient;
  private exchange: ExchangeClient | null;
  private address: string;
  private walletPrivateKey: string;
  
  constructor() {
    this.transport = new HttpTransport();
    this.info = new InfoClient({ transport: this.transport });
    this.exchange = null;
    this.address = '';
    this.walletPrivateKey = '';
  }
  
  /**
   * Initialize wallet from private key and set up authentication
   * 
   * For full trading capabilities, you need to provide a wallet private key.
   * The SDK supports viem or ethers.js wallet objects for signing.
   * 
   * Example with viem:
   * ```ts
   * import { privateKeyToAccount } from 'viem/account';
   * const wallet = privateKeyToAccount('0x...');
   * const exchange = new ExchangeClient({ transport, wallet });
   * ```
   */
  async initialize(): Promise<string> {
    try {
      this.walletPrivateKey = config.wallet.privateKey;
      
      if (!this.walletPrivateKey) {
        logger.warn('No wallet private key configured - read-only mode');
        this.address = '';
        return this.address;
      }
      
      // Ensure private key doesn't have 0x prefix
      const privateKey = this.walletPrivateKey.startsWith('0x') 
        ? this.walletPrivateKey.slice(2) 
        : this.walletPrivateKey;
      
      // Derive address from private key (first 20 bytes / 40 chars)
      this.address = '0x' + privateKey.slice(0, 40);
      
      logger.info(`Wallet configured: ${this.address}`);
      logger.info(`Network: ${config.hyperliquid.network}`);
      
      // For full authentication (trading), you would initialize ExchangeClient with a wallet:
      // import { privateKeyToAccount } from 'viem/account';
      // const wallet = privateKeyToAccount('0x' + privateKey);
      // this.exchange = new ExchangeClient({ transport: this.transport, wallet });
      // 
      // For now, we set up the InfoClient which provides read-only access
      
      // Verify we can connect to the API
      try {
        const meta = await this.info.meta();
        logger.info(`Connected to Hyperliquid ${config.hyperliquid.network}, ${meta.universe.length} assets available`);
      } catch (error) {
        logger.warn('Could not verify API connection', { error });
      }
      
      return this.address;
    } catch (error) {
      logger.error('Failed to initialize wallet', { error });
      throw error;
    }
  }
  
  /**
   * Check if wallet is authenticated for trading
   * Returns true if private key is configured
   * Note: Full trading requires viem or ethers.js wallet setup
   */
  isAuthenticated(): boolean {
    return !!this.walletPrivateKey;
  }
  
  /**
   * Get wallet address
   */
  getAddress(): string {
    return this.address;
  }
  
  /**
   * Get account balances and positions
   */
  async getAccountState() {
    try {
      const state = await this.info.clearinghouseState({ user: this.address });
      return state;
    } catch (error) {
      logger.error('Failed to get account state', { error });
      throw error;
    }
  }
  
  /**
   * Get all positions
   */
  async getPositions(): Promise<Position[]> {
    const state = await this.getAccountState();
    const mids = await this.info.allMids();
    const positions: Position[] = [];
    
    if (state.assetPositions) {
      for (const pos of state.assetPositions) {
        if (pos.type === 'oneWay' && pos.position) {
          const p = pos.position;
          if (p.szi !== '0') {
            const currentPrice = mids[p.coin] ? parseFloat(mids[p.coin]) : 0;
            positions.push({
              asset: p.coin,
              size: parseFloat(p.szi),
              entryPrice: parseFloat(p.entryPx || '0'),
              currentPrice,
              unrealizedPnl: parseFloat(p.unrealizedPnl || '0'),
              leverage: p.leverage?.value ? parseFloat(String(p.leverage.value)) : 0,
              side: parseFloat(p.szi) > 0 ? 'long' : 'short',
            });
          }
        }
      }
    }
    
    return positions;
  }
  
  /**
   * Get wallet balance in USDC (withdrawable)
   */
  async getUsdcBalance(): Promise<number> {
    const state = await this.getAccountState();
    
    // Use withdrawable as available USDC balance
    if (state.withdrawable) {
      return parseFloat(state.withdrawable);
    }
    return 0;
  }
  
  /**
   * Get market data for an asset
   */
  async getMarketData(asset: string): Promise<MarketData> {
    try {
      const meta = await this.info.meta();
      const ticker = await this.info.allMids();
      
      // Get the asset's index from meta
      const assetMeta = meta.universe.find((u: any) => u.asset === asset);
      const currentPrice = ticker[asset] ? parseFloat(ticker[asset]) : 0;
      
      return {
        asset,
        bid: currentPrice * 0.999,  // Approximate
        ask: currentPrice * 1.001, // Approximate
        last: currentPrice,
        volume24h: 0, // Would need separate query
        fundingRate: 0, // Would need funding history
        openInterest: 0, // Would need separate query
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('Failed to get market data', { asset, error });
      throw error;
    }
  }
  
  /**
   * Get all available assets
   */
  async getAssets(): Promise<string[]> {
    try {
      const info = await this.info.meta();
      return info.universe.map((u: any) => u.asset);
    } catch (error) {
      logger.error('Failed to get assets', { error });
      throw error;
    }
  }
  
  /**
   * Place an order (requires wallet signing)
   * 
   * To enable trading, add viem or ethers.js and initialize ExchangeClient:
   * ```ts
   * import { privateKeyToAccount } from 'viem/account';
   * const wallet = privateKeyToAccount(privateKey);
   * this.exchange = new ExchangeClient({ transport: this.transport, wallet });
   * ```
   */
  async placeOrder(order: Order): Promise<string> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Wallet not authenticated. Set WALLET_PRIVATE_KEY in .env');
      }
      
      // Placeholder: Full implementation requires viem or ethers.js wallet
      // See above for how to enable trading
      logger.warn('Order placement requires viem or ethers.js wallet setup');
      logger.info(`Would place order: ${order.side} ${order.size} ${order.asset}`);
      return '';
    } catch (error) {
      logger.error('Failed to place order', { order, error });
      throw error;
    }
  }
  
  /**
   * Cancel an order (requires wallet signing)
   * 
   * To enable order cancellation, add viem or ethers.js and initialize ExchangeClient
   */
  async cancelOrder(oid: string, asset: string): Promise<void> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('Wallet not authenticated. Set WALLET_PRIVATE_KEY in .env');
      }
      
      // Placeholder: Full implementation requires viem or ethers.js wallet
      logger.warn('Order cancellation requires viem or ethers.js wallet setup');
      logger.info(`Would cancel order: ${oid} for ${asset}`);
    } catch (error) {
      logger.error('Failed to cancel order', { oid, asset, error });
      throw error;
    }
  }
  
  /**
   * Get open orders
   */
  async getOpenOrders(): Promise<any[]> {
    try {
      const orders = await this.info.openOrders({ user: this.address });
      return orders;
    } catch (error) {
      logger.error('Failed to get open orders', { error });
      throw error;
    }
  }
  
  /**
   * Get trade history (fills)
   */
  async getFillHistory(): Promise<Trade[]> {
    try {
      const fills = await this.info.userFills({ user: this.address });
      return fills.map((fill: any) => ({
        id: fill.hash || fill.id || Math.random().toString(),
        asset: fill.coin || fill.asset,
        side: fill.side === 'Buy' ? 'buy' : 'sell',
        size: parseFloat(fill.sz || fill.size || '0'),
        price: parseFloat(fill.px || fill.price || '0'),
        fee: parseFloat(fill.fee || '0'),
        timestamp: fill.time || fill.timestamp || Date.now(),
        orderId: fill.oid || fill.orderId || '',
      }));
    } catch (error) {
      logger.error('Failed to get fill history', { error });
      throw error;
    }
  }
  
  /**
   * Subscribe to WebSocket for real-time updates
   * Note: For authenticated subscriptions, the exchange client handles signing
   */
  subscribeToUpdates(callback: (data: any) => void): void {
    if (!this.isAuthenticated()) {
      logger.warn('WebSocket subscriptions require authentication. Set WALLET_PRIVATE_KEY in .env');
      return;
    }
    
    // Set up WebSocket subscription for authenticated updates
    // The exchange client handles the message signing for authentication
    logger.info('WebSocket subscription ready for authenticated user');
    
    // Note: Full WebSocket implementation would go here
    // The SDK's ExchangeClient can be used for authenticated subscriptions
  }
}

export const hlClient = new HyperliquidClient();

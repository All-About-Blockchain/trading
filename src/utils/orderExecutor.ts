/**
 * Order Execution Module
 * Core module for placing and managing orders on Hyperliquid
 */

import { hlClient } from './hyperliquid';
import { Order } from '../types';
import { logger } from './logger';

export interface OrderRequest {
  asset: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop_market' | 'stop_limit';
  size: number;
  price?: number;
  reduceOnly?: boolean;
  triggerPrice?: number;
  timeInForce?: 'Gtc' | 'Ioc' | 'Alo';
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
  filled?: {
    size: number;
    price: number;
    fee: number;
  };
}

export interface OrderBook {
  bids: [number, number][];  // [price, size]
  asks: [number, number][];
}

export interface StopOrder {
  orderId: string;
  asset: string;
  side: 'buy' | 'sell';
  triggerPrice: number;
  size: number;
  status: 'active' | 'triggered' | 'cancelled';
  createdAt: number;
}

/**
 * Order Execution Handler
 * Manages order placement, tracking, and cancellation
 */
export class OrderExecutor {
  private pendingOrders: Map<string, OrderRequest> = new Map();
  private stopOrders: Map<string, StopOrder> = new Map();
  
  /**
   * Place a new order
   */
  async placeOrder(request: OrderRequest): Promise<OrderResult> {
    try {
      logger.info(`Placing order: ${request.side} ${request.size} ${request.type} ${request.asset}`);
      
      // Validate order
      const validation = this.validateOrder(request);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      // Check authentication
      if (!hlClient.isAuthenticated()) {
        return { success: false, error: 'Wallet not authenticated. Set WALLET_PRIVATE_KEY in .env' };
      }
      
      // Build order object for Hyperliquid
      const order: Order = {
        asset: request.asset,
        side: request.side,
        type: request.type,
        size: request.size,
        price: request.price,
        reduceOnly: request.reduceOnly,
        triggerPrice: request.triggerPrice,
      };
      
      // Place the order through the Hyperliquid client
      const orderId = await hlClient.placeOrder(order);
      
      if (orderId) {
        this.pendingOrders.set(orderId, request);
        logger.info(`Order placed successfully: ${orderId}`);
        return { success: true, orderId };
      }
      
      return { success: false, error: 'Order placement returned no order ID' };
    } catch (error: any) {
      logger.error('Failed to place order', { request, error: error.message });
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Place a market order
   */
  async placeMarketOrder(
    asset: string,
    side: 'buy' | 'sell',
    size: number
  ): Promise<OrderResult> {
    return this.placeOrder({
      asset,
      side,
      type: 'market',
      size,
    });
  }
  
  /**
   * Place a limit order
   */
  async placeLimitOrder(
    asset: string,
    side: 'buy' | 'sell',
    size: number,
    price: number,
    timeInForce: 'Gtc' | 'Ioc' | 'Alo' = 'Gtc'
  ): Promise<OrderResult> {
    return this.placeOrder({
      asset,
      side,
      type: 'limit',
      size,
      price,
      timeInForce,
    });
  }
  
  /**
   * Place a stop market order
   */
  async placeStopMarketOrder(
    asset: string,
    side: 'buy' | 'sell',
    size: number,
    triggerPrice: number
  ): Promise<OrderResult> {
    return this.placeOrder({
      asset,
      side,
      type: 'stop_market',
      size,
      triggerPrice,
    });
  }
  
  /**
   * Place a stop limit order
   */
  async placeStopLimitOrder(
    asset: string,
    side: 'buy' | 'sell',
    size: number,
    triggerPrice: number,
    price: number
  ): Promise<OrderResult> {
    return this.placeOrder({
      asset,
      side,
      type: 'stop_limit',
      size,
      triggerPrice,
      price,
    });
  }
  
  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string, asset: string): Promise<OrderResult> {
    try {
      logger.info(`Cancelling order: ${orderId}`);
      
      if (!hlClient.isAuthenticated()) {
        return { success: false, error: 'Wallet not authenticated' };
      }
      
      await hlClient.cancelOrder(orderId, asset);
      this.pendingOrders.delete(orderId);
      this.stopOrders.delete(orderId);
      
      logger.info(`Order cancelled: ${orderId}`);
      return { success: true, orderId };
    } catch (error: any) {
      logger.error('Failed to cancel order', { orderId, error: error.message });
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get all open orders
   */
  async getOpenOrders(): Promise<any[]> {
    try {
      return await hlClient.getOpenOrders();
    } catch (error: any) {
      logger.error('Failed to get open orders', { error: error.message });
      return [];
    }
  }
  
  /**
   * Get order book for an asset
   */
  async getOrderBook(asset: string): Promise<OrderBook | null> {
    try {
      // Note: This would need to be implemented in the Hyperliquid client
      // For now, return placeholder
      logger.warn('getOrderBook not fully implemented - using market data instead');
      
      const marketData = await hlClient.getMarketData(asset);
      
      return {
        bids: [[marketData.bid, 0]],
        asks: [[marketData.ask, 0]],
      };
    } catch (error: any) {
      logger.error('Failed to get order book', { asset, error: error.message });
      return null;
    }
  }
  
  /**
   * Validate order parameters
   */
  private validateOrder(order: OrderRequest): { valid: boolean; error?: string } {
    if (!order.asset || order.asset.trim() === '') {
      return { valid: false, error: 'Asset is required' };
    }
    
    if (order.size <= 0) {
      return { valid: false, error: 'Order size must be greater than 0' };
    }
    
    if (order.type === 'limit' && !order.price) {
      return { valid: false, error: 'Limit orders require a price' };
    }
    
    if ((order.type === 'stop_market' || order.type === 'stop_limit') && !order.triggerPrice) {
      return { valid: false, error: 'Stop orders require a trigger price' };
    }
    
    if (order.type === 'stop_limit' && !order.price) {
      return { valid: false, error: 'Stop limit orders require a limit price' };
    }
    
    return { valid: true };
  }
  
  /**
   * Get estimated price for market order (slippage simulation)
   */
  async getEstimatedPrice(
    asset: string,
    side: 'buy' | 'sell',
    size: number
  ): Promise<{ price: number; impact: number }> {
    try {
      const marketData = await hlClient.getMarketData(asset);
      const basePrice = marketData.last;
      
      // Simple impact estimation based on size
      // In production, would use order book analysis
      const impactPercent = size > 1000 ? 0.001 * (size / 1000) : 0;
      const impact = basePrice * impactPercent;
      
      const estimatedPrice = side === 'buy' 
        ? basePrice + impact 
        : basePrice - impact;
      
      return {
        price: estimatedPrice,
        impact: impactPercent,
      };
    } catch (error: any) {
      logger.error('Failed to estimate price', { asset, error: error.message });
      return { price: 0, impact: 0 };
    }
  }
}

export const orderExecutor = new OrderExecutor();

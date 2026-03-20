"use strict";
/**
 * Order Execution Module
 * Core module for placing and managing orders on Hyperliquid
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderExecutor = exports.OrderExecutor = void 0;
const hyperliquid_1 = require("./hyperliquid");
const logger_1 = require("./logger");
/**
 * Order Execution Handler
 * Manages order placement, tracking, and cancellation
 */
class OrderExecutor {
    constructor() {
        this.pendingOrders = new Map();
        this.stopOrders = new Map();
    }
    /**
     * Place a new order
     */
    async placeOrder(request) {
        try {
            logger_1.logger.info(`Placing order: ${request.side} ${request.size} ${request.type} ${request.asset}`);
            // Validate order
            const validation = this.validateOrder(request);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }
            // Check authentication
            if (!hyperliquid_1.hyperliquid.isAuthenticated()) {
                return { success: false, error: 'Wallet not authenticated. Set WALLET_PRIVATE_KEY in .env' };
            }
            // Build order object for Hyperliquid
            const order = {
                coin: request.asset,
                side: request.side === 'buy' ? 'A' : 'B',
                sz: request.size,
                limitPx: request.price,
            };
            // Place the order through the Hyperliquid client
            const result = await hyperliquid_1.hyperliquid.placeOrder(order);
            const orderId = typeof result === 'string' ? result : result.orderId;
            if (orderId) {
                this.pendingOrders.set(orderId, request);
                logger_1.logger.info(`Order placed successfully: ${orderId}`);
                return { success: true, orderId };
            }
            return { success: false, error: 'Order placement returned no order ID' };
        }
        catch (error) {
            logger_1.logger.error('Failed to place order', { request, error: error.message });
            return { success: false, error: error.message };
        }
    }
    /**
     * Place a market order
     */
    async placeMarketOrder(asset, side, size) {
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
    async placeLimitOrder(asset, side, size, price, timeInForce = 'Gtc') {
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
    async placeStopMarketOrder(asset, side, size, triggerPrice) {
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
    async placeStopLimitOrder(asset, side, size, triggerPrice, price) {
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
    async cancelOrder(orderId, asset) {
        try {
            logger_1.logger.info(`Cancelling order: ${orderId}`);
            if (!hyperliquid_1.hyperliquid.isAuthenticated()) {
                return { success: false, error: 'Wallet not authenticated' };
            }
            await hyperliquid_1.hyperliquid.cancelOrder(orderId);
            this.pendingOrders.delete(orderId);
            this.stopOrders.delete(orderId);
            logger_1.logger.info(`Order cancelled: ${orderId}`);
            return { success: true, orderId };
        }
        catch (error) {
            logger_1.logger.error('Failed to cancel order', { orderId, error: error.message });
            return { success: false, error: error.message };
        }
    }
    /**
     * Get all open orders
     */
    async getOpenOrders() {
        try {
            return await hyperliquid_1.hyperliquid.getOpenOrders();
        }
        catch (error) {
            logger_1.logger.error('Failed to get open orders', { error: error.message });
            return [];
        }
    }
    /**
     * Get order book for an asset
     */
    async getOrderBook(asset) {
        try {
            // Note: This would need to be implemented in the Hyperliquid client
            // For now, return placeholder
            logger_1.logger.warn('getOrderBook not fully implemented - using market data instead');
            const marketData = await hyperliquid_1.hyperliquid.getMarketData(asset);
            return {
                bids: [[marketData.bid, 0]],
                asks: [[marketData.ask, 0]],
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get order book', { asset, error: error.message });
            return null;
        }
    }
    /**
     * Validate order parameters
     */
    validateOrder(order) {
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
    async getEstimatedPrice(asset, side, size) {
        try {
            const marketData = await hyperliquid_1.hyperliquid.getMarketData(asset);
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
        }
        catch (error) {
            logger_1.logger.error('Failed to estimate price', { asset, error: error.message });
            return { price: 0, impact: 0 };
        }
    }
}
exports.OrderExecutor = OrderExecutor;
exports.orderExecutor = new OrderExecutor();
//# sourceMappingURL=orderExecutor.js.map
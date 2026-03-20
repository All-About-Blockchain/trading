/**
 * Order Execution Module
 * Core module for placing and managing orders on Hyperliquid
 */
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
    bids: [number, number][];
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
export declare class OrderExecutor {
    private pendingOrders;
    private stopOrders;
    /**
     * Place a new order
     */
    placeOrder(request: OrderRequest): Promise<OrderResult>;
    /**
     * Place a market order
     */
    placeMarketOrder(asset: string, side: 'buy' | 'sell', size: number): Promise<OrderResult>;
    /**
     * Place a limit order
     */
    placeLimitOrder(asset: string, side: 'buy' | 'sell', size: number, price: number, timeInForce?: 'Gtc' | 'Ioc' | 'Alo'): Promise<OrderResult>;
    /**
     * Place a stop market order
     */
    placeStopMarketOrder(asset: string, side: 'buy' | 'sell', size: number, triggerPrice: number): Promise<OrderResult>;
    /**
     * Place a stop limit order
     */
    placeStopLimitOrder(asset: string, side: 'buy' | 'sell', size: number, triggerPrice: number, price: number): Promise<OrderResult>;
    /**
     * Cancel an order
     */
    cancelOrder(orderId: string, asset?: string): Promise<OrderResult>;
    /**
     * Get all open orders
     */
    getOpenOrders(): Promise<any[]>;
    /**
     * Get order book for an asset
     */
    getOrderBook(asset: string): Promise<OrderBook | null>;
    /**
     * Validate order parameters
     */
    private validateOrder;
    /**
     * Get estimated price for market order (slippage simulation)
     */
    getEstimatedPrice(asset: string, side: 'buy' | 'sell', size: number): Promise<{
        price: number;
        impact: number;
    }>;
}
export declare const orderExecutor: OrderExecutor;
//# sourceMappingURL=orderExecutor.d.ts.map
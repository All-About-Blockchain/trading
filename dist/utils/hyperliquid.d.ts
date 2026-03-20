/**
 * Hyperliquid API Client
 * Fixed for testnet API compatibility
 */
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
export declare class HyperliquidClient {
    apiUrl: string;
    wsUrl: string;
    address: string;
    private wallet;
    constructor();
    initialize(): Promise<string>;
    getBalance(): Promise<Balance>;
    getMarkets(): Promise<Record<string, string>>;
    getPositions(): Promise<any[]>;
    getUsdcBalance(): Promise<number>;
    getFillHistory(): Promise<any[]>;
    getAssets(): Promise<string[]>;
    placeOrder(order: {
        coin: string;
        side: 'A' | 'B';
        sz: number;
        limitPx?: number;
    }): Promise<{
        success: boolean;
        orderId: string;
    }>;
    getAddress(): string;
    isInitialized(): boolean;
    isAuthenticated(): boolean;
    getMarketData(coin: string): Promise<any>;
    cancelOrder(orderId: string): Promise<any>;
    getOpenOrders(): Promise<any[]>;
}
export declare const hyperliquid: HyperliquidClient;
export declare const hlClient: HyperliquidClient;
//# sourceMappingURL=hyperliquid.d.ts.map
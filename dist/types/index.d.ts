/**
 * Core Trading Types
 */
export interface Asset {
    symbol: string;
    name: string;
    decimals: number;
}
export interface Position {
    asset: string;
    sector?: string;
    size: number;
    entryPrice: number;
    currentPrice: number;
    unrealizedPnl: number;
    leverage: number;
    side: 'long' | 'short';
}
export interface Order {
    asset: string;
    side: 'buy' | 'sell';
    type: 'market' | 'limit' | 'stop_market' | 'stop_limit';
    size: number;
    price?: number;
    reduceOnly?: boolean;
    triggerPrice?: number;
}
export interface Trade {
    id: string;
    asset: string;
    side: 'buy' | 'sell';
    size: number;
    price: number;
    fee: number;
    timestamp: number;
    orderId: string;
}
export interface MarketData {
    asset: string;
    bid: number;
    ask: number;
    last: number;
    price?: number;
    volume24h: number;
    fundingRate: number;
    openInterest: number;
    timestamp: number;
}
export interface Signal {
    asset: string;
    strategy: string;
    action: 'buy' | 'sell' | 'hold';
    confidence: number;
    targetSize?: number;
    targetProfitPercent?: number;
    stopLoss?: number;
    takeProfit?: number;
    price?: number;
    reasoning?: string;
    reason?: string;
    modelSource?: 'gpt' | 'gemini' | 'minimax' | 'ensemble';
    timestamp?: number;
}
export interface Portfolio {
    totalValueUsd: number;
    positions: Position[];
    cashUsd: number;
    reservedUsd: number;
    availableUsd: number;
    dailyPnl: number;
    weeklyPnl: number;
    totalPnl: number;
    timestamp: number;
}
export interface RiskCheck {
    passed: boolean;
    violations: RiskViolation[];
}
export interface RiskViolation {
    type: 'position_limit' | 'sector_limit' | 'leverage_limit' | 'drawdown';
    severity: 'warning' | 'critical';
    message: string;
    current: number;
    limit: number;
}
export interface AssetInfo {
    symbol: string;
    name: string;
    price: number;
    volatility: number;
    sector?: string;
    marketCap?: number;
    volume24h?: number;
}
/**
 * Agent Types
 */
export interface AgentConfig {
    id: string;
    name: string;
    model: 'gpt' | 'gemini' | 'minimax' | 'ensemble';
    enabled: boolean;
    specialty: string;
    maxPositionPercent: number;
}
export interface AgentResult {
    agentId: string;
    signals: Signal[];
    errors?: string[];
    timestamp: number;
}
//# sourceMappingURL=index.d.ts.map
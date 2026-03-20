/**
 * Multi-Chain Wallet Manager
 * Supports EVM (Arbitrum), Solana, and Injective
 */
export type ChainType = 'evm' | 'solana' | 'injective';
export interface WalletConnection {
    chain: ChainType;
    address: string;
    connected: boolean;
    balance?: string;
}
export declare class WalletManager {
    initialize(): Promise<void>;
    connectEVM(): Promise<WalletConnection | null>;
    connectSolana(): Promise<WalletConnection | null>;
    connectInjective(): Promise<WalletConnection | null>;
    getConnectedWallets(): WalletConnection[];
}
export declare const walletManager: WalletManager;
//# sourceMappingURL=walletManager.d.ts.map
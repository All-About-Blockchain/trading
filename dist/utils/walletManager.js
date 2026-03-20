"use strict";
/**
 * Multi-Chain Wallet Manager
 * Supports EVM (Arbitrum), Solana, and Injective
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletManager = exports.WalletManager = void 0;
class WalletManager {
    async initialize() {
        console.log('Multi-chain wallet manager initialized');
    }
    async connectEVM() {
        // Implementation requires: ethers
        console.log('EVM wallet connection requires config');
        return null;
    }
    async connectSolana() {
        // Implementation requires: @solana/web3.js
        console.log('Solana wallet connection requires config');
        return null;
    }
    async connectInjective() {
        // Implementation requires: @injectivelabs/sdk-ts
        console.log('Injective wallet connection requires config');
        return null;
    }
    getConnectedWallets() {
        return [];
    }
}
exports.WalletManager = WalletManager;
exports.walletManager = new WalletManager();
//# sourceMappingURL=walletManager.js.map
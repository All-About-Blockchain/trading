/**
 * Wallet Derivation Script
 * Derives EVM, Solana, and Injective wallets from BIP39 seed phrase
 */

import { ethers, HDNodeWallet, Mnemonic } from 'ethers';
import { Keypair } from '@solana/web3.js';

// Board-provided seed phrase
const SEED_PHRASE = 'fit hotel mom today agent suspect upgrade start drive bunker method mother';

function deriveEVMWallet(mnemonic: string, index: number = 0): { address: string; privateKey: string } {
  const wallet = HDNodeWallet.fromMnemonic(
    Mnemonic.fromPhrase(mnemonic),
    `m/44'/60'/0'/0/${index}`
  );
  
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

function deriveSolanaWallet(mnemonic: string): { address: string; privateKeyBase58: string } {
  // Use ethers to derive a seed from mnemonic, then use for Solana
  const mnemonicObj = Mnemonic.fromPhrase(mnemonic);
  const seed = mnemonicObj.computeSeed();
  
  // Convert hex string to Uint8Array
  const seedBytes = new Uint8Array(Buffer.from(seed.slice(2), 'hex'));
  const keypair = Keypair.fromSeed(seedBytes.slice(0, 32));
  
  return {
    address: keypair.publicKey.toBase58(),
    privateKeyBase58: Buffer.from(keypair.secretKey).toString('base64'),
  };
}

function deriveInjectiveWallet(mnemonic: string, index: number = 0): { address: string; privateKeyHex: string } {
  // Injective uses the same derivation as EVM but with different path
  const wallet = HDNodeWallet.fromMnemonic(
    Mnemonic.fromPhrase(mnemonic),
    `m/44'/60'/0'/0/${index}`
  );
  
  return {
    address: wallet.address,
    privateKeyHex: wallet.privateKey.replace('0x', ''),
  };
}

// Main
console.log('=== Wallet Derivation from Seed Phrase ===\n');
console.log('Seed Phrase:', SEED_PHRASE, '\n');

// Derive wallets
const evm = deriveEVMWallet(SEED_PHRASE);
const solana = deriveSolanaWallet(SEED_PHRASE);
const injective = deriveInjectiveWallet(SEED_PHRASE);

console.log('EVM (Arbitrum):');
console.log('  Address:', evm.address);
console.log('  Private Key:', evm.privateKey);
console.log();

console.log('Solana:');
console.log('  Address:', solana.address);
console.log('  Private Key (base64):', solana.privateKeyBase58);
console.log();

console.log('Injective:');
console.log('  Address:', injective.address);
console.log('  Private Key (hex):', injective.privateKeyHex);
console.log();

// Output for .env file
console.log('=== Copy to .env ===\n');
console.log(`EVM_PRIVATE_KEY=${evm.privateKey.replace('0x', '')}`);
console.log(`SOLANA_PRIVATE_KEY_BASE58=${solana.privateKeyBase58}`);
console.log(`INJECTIVE_PRIVATE_KEY_HEX=${injective.privateKeyHex}`);

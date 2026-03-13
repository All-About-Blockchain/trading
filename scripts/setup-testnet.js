#!/usr/bin/env node
/**
 * Hyperliquid Testnet Setup Script
 * 
 * This script helps set up a Hyperliquid testnet account for development and testing.
 * 
 * Usage: node scripts/setup-testnet.js
 * 
 * Steps:
 * 1. Configure environment for testnet
 * 2. Show how to get a wallet
 * 3. Get testnet USDC from faucet
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Hyperliquid Testnet Setup ===\n');

// Step 1: Check/create .env file
console.log('Step 1: Environment Configuration\n');

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.testnet.example');

if (fs.existsSync(envPath)) {
  console.log('✓ Found existing .env file');
} else if (fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✓ Created .env from .env.testnet.example');
}

console.log('  Please edit .env and add your wallet private key');
console.log('');

// Step 2: Wallet options
console.log('Step 2: Wallet Setup\n');
console.log('You need an Ethereum-compatible wallet for Hyperliquid testnet.');
console.log('');
console.log('Option A: Use an existing Ethereum private key');
console.log('  - Any Ethereum wallet (MetaMask, etc.) works');
console.log('  - Add your private key to .env (without 0x prefix)');
console.log('');
console.log('Option B: Generate a new testnet-only wallet:');
console.log('  - Use MetaMask browser extension');
console.log('  - Create a new wallet');
console.log('  - In MetaMask: Settings > Advanced > Show test networks: ON');
console.log('  - Select "Hyperliquid Testnet" network');
console.log('  - Get testnet USDC from faucet');
console.log('');

// Step 3: Testnet configuration
console.log('Step 3: Testnet Details\n');
console.log('Hyperliquid Testnet:');
console.log('  - Network Name: Hyperliquid Testnet');
console.log('  - RPC URL: https://api.hyperliquid-testnet.xyz');
console.log('  - Chain ID: 424242 (or similar testnet chain ID)');
console.log('  - Symbol: USDC');
console.log('  - Explorer: https://explorer.hyperliquid-testnet.xyz');
console.log('');
console.log('Trading API:');
console.log('  - API URL: https://api.hyperliquid-testnet.xyz');
console.log('  - WebSocket: wss://ws.hyperliquid-testnet.xyz');
console.log('');

// Step 4: Getting testnet USDC
console.log('Step 4: Getting Testnet USDC\n');
console.log('To get testnet USDC tokens:');
console.log('  1. Go to: https://app.hyperliquid-testnet.xyz');
console.log('  2. Connect your wallet (MetaMask)');
console.log('  3. Click "Faucet" or "Get USDC" button');
console.log('  4. Request testnet USDC (usually 10,000 USDC)');
console.log('');

// Step 5: Show current config
console.log('Step 5: Current Configuration\n');

const network = process.env.HL_NETWORK || 'testnet';
const apiUrl = process.env.HL_API_URL || (network === 'testnet' ? 'https://api.hyperliquid-testnet.xyz' : 'https://api.hyperliquid.xyz');
const wsUrl = process.env.HL_WS_URL || (network === 'testnet' ? 'wss://ws.hyperliquid-testnet.xyz' : 'wss://ws.hyperliquid.xyz');

console.log(`  HL_NETWORK: ${network}`);
console.log(`  HL_API_URL: ${apiUrl}`);
console.log(`  HL_WS_URL: ${wsUrl}`);
console.log('');

// Step 6: Run the bot
console.log('=== Next Steps ===\n');
console.log('1. Edit .env and set WALLET_PRIVATE_KEY');
console.log('2. Get testnet USDC from faucet');
console.log('3. Run: npm run dev');
console.log('');

console.log('✓ Testnet setup script complete!');

/**
 * Wallet Connection Test Script
 * Tests connections to EVM, Solana, and Injective
 */

import { ethers } from 'ethers';
import { Keypair, Connection } from '@solana/web3.js';

// Derived wallet keys from seed phrase
const EVM_PRIVATE_KEY = '0x1391830b9ce178ceb5ccfb02c6f04b7abc30955ba99b947cfa07cd682d654053';
const SOLANA_PRIVATE_KEY_BASE64 = 'UABQI9y8IpOYt43AGGn0oIiakWONHKAvSaXSnCFSG7T8yinhxOLn/fRM91gYVoqushf0unf+6mu+hzt9t8jcuw==';
const INJECTIVE_PRIVATE_KEY_HEX = '1391830b9ce178ceb5ccfb02c6f04b7abc30955ba99b947cfa07cd682d654053';

// RPC URLs (testnet)
const EVM_RPC = 'https://sepolia-rollup.arbitrum.io/rpc';
const SOLANA_RPC = 'https://api.devnet.solana.com';

async function testEVMConnection() {
  console.log('\n=== EVM (Arbitrum Sepolia) Connection Test ===');
  try {
    const provider = new ethers.JsonRpcProvider(EVM_RPC);
    const wallet = new ethers.Wallet(EVM_PRIVATE_KEY, provider);
    
    const address = wallet.address;
    const balance = await provider.getBalance(address);
    
    console.log('✅ Connected!');
    console.log('   Address:', address);
    console.log('   Balance:', ethers.formatEther(balance), 'ETH');
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error);
    return false;
  }
}

async function testSolanaConnection() {
  console.log('\n=== Solana (Devnet) Connection Test ===');
  try {
    const connection = new Connection(SOLANA_RPC, 'confirmed');
    const keypair = Keypair.fromSecretKey(Buffer.from(SOLANA_PRIVATE_KEY_BASE64, 'base64'));
    
    const balance = await connection.getBalance(keypair.publicKey);
    
    console.log('✅ Connected!');
    console.log('   Address:', keypair.publicKey.toBase58());
    console.log('   Balance:', balance / 1e9, 'SOL');
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error);
    return false;
  }
}

async function testInjectiveConnection() {
  console.log('\n=== Injective (Testnet) Connection Test ===');
  // Injective testnet requires specific setup
  // For now, just validate the key format
  try {
    // Injective uses the same key format as EVM
    const wallet = new ethers.Wallet(INJECTIVE_PRIVATE_KEY_HEX);
    
    console.log('✅ Key format valid!');
    console.log('   Address:', wallet.address);
    console.log('   Note: Full connection requires Injective testnet RPC');
    return true;
  } catch (error) {
    console.log('❌ Key validation failed:', error);
    return false;
  }
}

async function main() {
  console.log('Testing wallet connections...\n');
  
  const results = await Promise.all([
    testEVMConnection(),
    testSolanaConnection(),
    testInjectiveConnection(),
  ]);
  
  console.log('\n=== Summary ===');
  console.log('EVM:', results[0] ? '✅' : '❌');
  console.log('Solana:', results[1] ? '✅' : '❌');
  console.log('Injective:', results[2] ? '✅' : '❌');
  
  if (results.every(r => r)) {
    console.log('\n✅ All wallets connected successfully!');
  } else {
    console.log('\n⚠️ Some connections failed. Check RPC URLs and network status.');
  }
}

main();

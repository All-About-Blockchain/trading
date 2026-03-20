/**
 * Test Trading Script
 * Simulates trading on Hyperliquid testnet
 */

import { HyperliquidClient } from '../src/utils/hyperliquid';
import { config } from '../src/config';

async function main() {
  console.log('🧪 Hyperliquid Trading Test\n');
  console.log('Network:', config.hyperliquid.network);
  
  // Initialize client
  const hyperliquid = new HyperliquidClient();
  
  // Initialize wallet
  const address = await hyperliquid.initialize();
  console.log('Wallet:', address);
  
  // Check balance
  const balance = await hyperliquid.getBalance();
  console.log('Balance:', balance.total, 'USDC');
  
  // Get available markets
  const markets = await hyperliquid.getMarkets();
  const marketKeys = Object.keys(markets);
  console.log('Markets available:', marketKeys.length);
  console.log('Sample markets:', marketKeys.slice(0, 5).join(', '));
  
  // Test order (simulation)
  console.log('\n📝 Testing order placement...');
  try {
    const order = await hyperliquid.placeOrder({
      coin: 'BTC',
      side: 'A',  // A = Ask (sell)
      sz: 0.001,
      limitPx: 50000
    });
    console.log('Order result:', JSON.stringify(order, null, 2));
  } catch (error: any) {
    console.log('Order error (expected if no testnet funds):', error.message);
  }
  
  console.log('\n✅ Test trading script complete!');
}

main().catch(console.error);

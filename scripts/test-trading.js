/**
 * Test Trading Script
 * Simulates trading on Hyperliquid testnet
 */

const { hyperliquid } = require('../src/utils/hyperliquid');
const { config } = require('../src/config');

async function main() {
  console.log('🧪 Hyperliquid Trading Test\n');
  console.log('Network:', config.hyperliquid.network);
  
  // Initialize wallet
  const address = await hyperliquid.initialize();
  console.log('Wallet:', address);
  
  // Check balance
  const balance = await hyperliquid.getBalance();
  console.log('Balance:', balance.total, 'USDC');
  
  // Get available markets
  const markets = await hyperliquid.getMarkets();
  console.log('Markets:', Object.keys(markets).slice(0, 5).join(', '), '...');
  
  // Test order (simulation)
  console.log('\n📝 Testing order...');
  const order = await hyperliquid.placeOrder({
    coin: 'BTC',
    side: 'A',
    sz: 0.001,
    limitPx: 50000
  });
  
  console.log('Order result:', order);
  console.log('\n✅ Test trading working!');
}

main().catch(console.error);

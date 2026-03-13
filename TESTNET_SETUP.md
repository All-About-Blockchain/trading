# Hyperliquid Testnet Setup

This guide covers setting up a Hyperliquid testnet account for development and testing.

## Quick Start

```bash
cd hyperliquid-trading

# Run the setup script
node scripts/setup-testnet.js
```

## Manual Setup

### 1. Configure Environment

Copy the example env file and edit it:

```bash
cp .env.testnet.example .env
nano .env
```

Set your wallet private key (without `0x` prefix):

```
HL_NETWORK=testnet
WALLET_PRIVATE_KEY=your_private_key_here
```

### 2. Get Testnet Wallet

**Option A: MetaMask**
1. Install MetaMask browser extension
2. Create a new wallet (or use existing)
3. Go to Settings > Advanced > Show test networks: ON
4. Add Hyperliquid Testnet network:
   - RPC: `https://api.hyperliquid-testnet.xyz`
   - Chain ID: `424242` (or check docs)
   - Symbol: USDC

**Option B: Generate with ethers.js**
```javascript
const { ethers } = require('ethers');
const wallet = ethers.Wallet.createRandom();
console.log(wallet.privateKey);
console.log(wallet.address);
```

### 3. Get Testnet USDC

1. Go to: https://app.hyperliquid-testnet.xyz
2. Connect your wallet
3. Click "Faucet" or "Get USDC"
4. Request testnet USDC (usually 10,000 USDC)

### 4. Verify Setup

```bash
# Test that config loads correctly
npm run dev
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `HL_NETWORK` | Network: `mainnet` or `testnet` | `mainnet` |
| `HL_API_URL` | Hyperliquid API URL | Auto-set based on network |
| `HL_WS_URL` | Hyperliquid WebSocket URL | Auto-set based on network |
| `WALLET_PRIVATE_KEY` | Your wallet private key | (required) |

## Testnet vs Mainnet

| Feature | Testnet | Mainnet |
|---------|---------|---------|
| API URL | `api.hyperliquid-testnet.xyz` | `api.hyperliquid.xyz` |
| WebSocket | `ws.hyperliquid-testnet.xyz` | `ws.hyperliquid.xyz` |
| USDC | From faucet (free) | Real money |
| Risk | None | Real risk |

## Troubleshooting

### "Invalid private key"
- Make sure private key doesn't have `0x` prefix in .env
- Check there are no extra spaces or quotes

### "Connection refused"
- Verify testnet API is accessible
- Check firewall/network settings

### "Insufficient balance"
- Make sure you got USDC from the faucet
- Check you're using testnet, not mainnet

## Security Notes

⚠️ **IMPORTANT**:
- Never use your mainnet private key for testnet
- Create a separate wallet for testing
- Don't share your testnet private key
- Testnet tokens have no real value

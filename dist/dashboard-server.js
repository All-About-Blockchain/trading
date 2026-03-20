"use strict";
/**
 * Dashboard Server
 * Real-time monitoring web interface for the trading system
 *
 * Usage:
 *   npm run dashboard        # Start dashboard server
 *   npm run dashboard:dev   # Start with dev mode (auto-reload)
 *
 * Access at http://localhost:3000
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
exports.startDashboard = startDashboard;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_basic_auth_1 = __importDefault(require("express-basic-auth"));
const hyperliquid_1 = require("./utils/hyperliquid");
const reporting_1 = require("./utils/reporting");
const logger_1 = require("./utils/logger");
const config_1 = require("./config");
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.DASHBOARD_PORT || 3000;
// Authentication configuration
const DASHBOARD_USER = process.env.DASHBOARD_USER || 'admin';
const DASHBOARD_PASS = process.env.DASHBOARD_PASS || 'change_me';
const AUTH_ENABLED = process.env.DASHBOARD_AUTH !== 'false';
// Create basic auth middleware
const authMiddleware = (0, express_basic_auth_1.default)({
    users: {
        [DASHBOARD_USER]: DASHBOARD_PASS,
    },
    challenge: true,
    realm: 'Hyperliquid Dashboard',
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static('dist/dashboard'));
// Apply auth to dashboard routes if enabled
if (AUTH_ENABLED) {
    app.use('/dashboard', authMiddleware);
    app.use('/api', authMiddleware);
    logger_1.logger.info(`Dashboard auth enabled. User: ${DASHBOARD_USER}`);
}
else {
    logger_1.logger.warn('Dashboard auth is DISABLED - anyone can access!');
}
// System state
let systemStatus = 'stopped';
let lastUpdate = 0;
let lastError = null;
// Health check endpoint (unauthenticated for monitoring)
app.get('/api/health', (_req, res) => {
    res.json({
        status: systemStatus,
        uptime: process.uptime(),
        lastUpdate,
        lastError,
        timestamp: Date.now(),
        authEnabled: AUTH_ENABLED,
    });
});
// Portfolio summary endpoint
app.get('/api/portfolio', async (_req, res) => {
    try {
        const summary = await (0, reporting_1.getBoardSummary)();
        lastUpdate = Date.now();
        lastError = null;
        res.json(summary);
    }
    catch (error) {
        lastError = error.message;
        logger_1.logger.error('Failed to get portfolio', { error });
        res.status(500).json({ error: error.message });
    }
});
// Detailed performance report
app.get('/api/performance', async (_req, res) => {
    try {
        const report = await (0, reporting_1.generatePerformanceReport)();
        lastUpdate = Date.now();
        lastError = null;
        res.json(report);
    }
    catch (error) {
        lastError = error.message;
        logger_1.logger.error('Failed to get performance report', { error });
        res.status(500).json({ error: error.message });
    }
});
// Positions endpoint
app.get('/api/positions', async (_req, res) => {
    try {
        const positions = await hyperliquid_1.hyperliquid.getPositions();
        const usdcBalance = await hyperliquid_1.hyperliquid.getUsdcBalance();
        const positionsWithValue = positions.map((p) => ({
            ...p,
            valueUsd: p.size * p.currentPrice,
            pnlPercent: p.entryPrice > 0 ? ((p.currentPrice - p.entryPrice) / p.entryPrice) * 100 : 0,
        }));
        lastUpdate = Date.now();
        res.json({
            positions: positionsWithValue,
            cashUsd: usdcBalance,
            totalPositions: positions.length,
        });
    }
    catch (error) {
        lastError = error.message;
        logger_1.logger.error('Failed to get positions', { error });
        res.status(500).json({ error: error.message });
    }
});
// Trade history endpoint
app.get('/api/trades', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const history = await (0, reporting_1.getTradeHistory)(page, pageSize);
        lastUpdate = Date.now();
        res.json(history);
    }
    catch (error) {
        lastError = error.message;
        logger_1.logger.error('Failed to get trades', { error });
        res.status(500).json({ error: error.message });
    }
});
// Market data endpoint
app.get('/api/markets', async (_req, res) => {
    try {
        const assets = await hyperliquid_1.hyperliquid.getAssets();
        const topAssets = assets.slice(0, 20).map((asset) => ({
            name: asset,
            // Note: Would need to fetch detailed market data per asset
            // This is simplified for now
        }));
        res.json({ assets: topAssets });
    }
    catch (error) {
        lastError = error.message;
        logger_1.logger.error('Failed to get markets', { error });
        res.status(500).json({ error: error.message });
    }
});
// System status endpoint
app.get('/api/system', (_req, res) => {
    res.json({
        status: systemStatus,
        config: {
            dataAgentIntervalMs: config_1.config.agents.dataAgentIntervalMs,
            analysisAgentIntervalMs: config_1.config.agents.analysisAgentIntervalMs,
            riskCheckEnabled: config_1.config.agents.riskCheckEnabled,
        },
        lastUpdate,
        lastError,
        timestamp: Date.now(),
    });
});
// Agent status endpoint
app.get('/api/agents', (_req, res) => {
    // Would integrate with actual agent system
    res.json({
        agents: [
            { name: 'GPT Agent', status: 'idle', lastRun: null },
            { name: 'Gemini Agent', status: 'idle', lastRun: null },
            { name: 'MiniMax Agent', status: 'idle', lastRun: null },
            { name: 'Ensemble Agent', status: 'idle', lastRun: null },
            { name: 'ML Agent', status: 'idle', lastRun: null },
        ],
        timestamp: Date.now(),
    });
});
// Dashboard HTML
app.get('/dashboard', (_req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All About Blockchain - Trading Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Work+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-background: #FAFAF9;
      --color-surface: #FFFFFF;
      --color-text: #1A1A1A;
      --color-primary: #2C4A5D;
      --color-secondary: #6B7280;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--color-background);
      color: var(--color-text);
      min-height: 100vh;
    }
    .header {
      background: var(--color-surface);
      padding: 0.75rem 1.5rem;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 { font-family: 'Crimson Pro', Georgia, serif; font-size: 1.5rem; color: var(--color-primary); font-weight: 600; }
    .status-badge {
      padding: 0.125rem 0.5rem;
      border-radius: 2px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-running { background: #166534; color: #86efac; }
    .status-stopped { background: #991b1b; color: #fca5a5; }
    .status-error { background: #b45309; color: #fcd34d; }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 0.75rem;
      padding: 1rem;
    }
    
    .card {
      background: var(--color-surface);
      border-radius: 2px;
      padding: 1rem;
      border: 1px solid rgba(0,0,0,0.06);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .card-title { font-size: 0.75rem; font-weight: 600; color: var(--color-secondary); text-transform: uppercase; letter-spacing: 0.1em; }
    .card-value { font-family: 'Crimson Pro', Georgia, serif; font-size: 2rem; font-weight: 700; color: var(--color-text); }
    .positive { color: #059669; }
    .negative { color: #dc2626; }
    
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }
    .stat { padding: 0.5rem; background: var(--color-background); border-radius: 2px; }
    .stat-label { font-size: 0.75rem; color: var(--color-secondary); margin-bottom: 0.25rem; }
    .stat-value { font-size: 1.125rem; font-weight: 600; color: var(--color-text); }
    
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid rgba(0,0,0,0.06); font-size: 0.875rem; }
    th { color: var(--color-secondary); font-weight: 500; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; }
    .buy { color: #059669; }
    .sell { color: #dc2626; }
    
    .last-updated {
      text-align: center;
      padding: 0.75rem;
      color: var(--color-secondary);
      font-size: 0.75rem;
    }
    
    .risk-low { color: #059669; }
    .risk-medium { color: #d97706; }
    .risk-high { color: #dc2626; }
  </style>
</head>
<body>
  <div class="header">
    <h1>All About Blockchain — Trading</h1>
    <span id="systemStatus" class="status-badge status-stopped">Stopped</span>
  </div>
  
  <div class="grid">
    <!-- Portfolio Value -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Portfolio Value</span>
      </div>
      <div class="card-value" id="totalValue">$0.00</div>
    </div>
    
    <!-- Daily P&L -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Daily P&L</span>
      </div>
      <div class="card-value" id="dailyPnl">$0.00</div>
      <div id="dailyPnlPercent" style="color: #64748b;">(0.00%)</div>
    </div>
    
    <!-- Open Positions -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Open Positions</span>
      </div>
      <div class="card-value" id="openPositions">0</div>
    </div>
    
    <!-- Risk Score -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Risk Score</span>
      </div>
      <div class="card-value" id="riskScore">0/100</div>
    </div>
  </div>
  
  <div class="grid">
    <!-- Positions Table -->
    <div class="card" style="grid-column: span 2;">
      <div class="card-header">
        <span class="card-title">Open Positions</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Side</th>
            <th>Size</th>
            <th>Price</th>
            <th>Value</th>
            <th>P&L</th>
          </tr>
        </thead>
        <tbody id="positionsTable">
          <tr><td colspan="6" style="text-align: center; color: #64748b;">Loading...</td></tr>
        </tbody>
      </table>
    </div>
    
    <!-- Recent Trades -->
    <div class="card" style="grid-column: span 2;">
      <div class="card-header">
        <span class="card-title">Recent Trades</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Asset</th>
            <th>Side</th>
            <th>Size</th>
            <th>Price</th>
            <th>Fee</th>
          </tr>
        </thead>
        <tbody id="tradesTable">
          <tr><td colspan="6" style="text-align: center; color: #64748b;">Loading...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  
  <div class="last-updated">
    Last updated: <span id="lastUpdated">-</span>
  </div>

  <script>
    const API_BASE = '';
    const UPDATE_INTERVAL = 30000; // 30 seconds
    
    async function fetchJSON(url) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(res.statusText);
        return await res.json();
      } catch (e) {
        console.error('Fetch error:', e);
        return null;
      }
    }
    
    function formatCurrency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    }
    
    function formatPercent(value) {
      return (value >= 0 ? '+' : '') + value.toFixed(2) + '%';
    }
    
    function formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString();
    }
    
    function getRiskClass(score) {
      if (score < 30) return 'risk-low';
      if (score < 60) return 'risk-medium';
      return 'risk-high';
    }
    
    async function updateDashboard() {
      // Get system health
      const health = await fetchJSON(API_BASE + '/api/health');
      if (health) {
        const statusEl = document.getElementById('systemStatus');
        statusEl.textContent = health.status.charAt(0).toUpperCase() + health.status.slice(1);
        statusEl.className = 'status-badge status-' + health.status;
      }
      
      // Get portfolio summary
      const portfolio = await fetchJSON(API_BASE + '/api/portfolio');
      if (portfolio) {
        document.getElementById('totalValue').textContent = formatCurrency(portfolio.totalValue);
        
        const pnlEl = document.getElementById('dailyPnl');
        pnlEl.textContent = formatCurrency(portfolio.dailyPnl);
        pnlEl.className = 'card-value ' + (portfolio.dailyPnl >= 0 ? 'positive' : 'negative');
        
        document.getElementById('dailyPnlPercent').textContent = 
          '(' + formatPercent(portfolio.dailyPnlPercent) + ')';
        
        document.getElementById('openPositions').textContent = portfolio.openPositions;
        
        const riskEl = document.getElementById('riskScore');
        riskEl.textContent = portfolio.riskScore + '/100';
        riskEl.className = 'card-value ' + getRiskClass(portfolio.riskScore);
        
        document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
      }
      
      // Get positions
      const positions = await fetchJSON(API_BASE + '/api/positions');
      if (positions && positions.positions) {
        const tbody = document.getElementById('positionsTable');
        if (positions.positions.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b;">No open positions</td></tr>';
        } else {
          tbody.innerHTML = positions.positions.map((p: any) => \`
            <tr>
              <td>\${p.asset}</td>
              <td class="\${p.side}">\${p.side.toUpperCase()}</td>
              <td>\${Math.abs(p.size).toFixed(4)}</td>
              <td>\$\${p.currentPrice.toFixed(2)}</td>
              <td>\${formatCurrency(p.valueUsd)}</td>
              <td class="\${p.pnlPercent >= 0 ? 'positive' : 'negative'}">\${formatPercent(p.pnlPercent)}</td>
            </tr>
          \`).join('');
        }
      }
      
      // Get recent trades
      const trades = await fetchJSON(API_BASE + '/api/trades?pageSize=10');
      if (trades && trades.trades) {
        const tbody = document.getElementById('tradesTable');
        if (trades.trades.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b;">No recent trades</td></tr>';
        } else {
          tbody.innerHTML = trades.trades.map(t => \`
            <tr>
              <td>\${formatTime(t.timestamp)}</td>
              <td>\${t.asset}</td>
              <td class="\${t.side}">\${t.side.toUpperCase()}</td>
              <td>\${Math.abs(t.size).toFixed(4)}</td>
              <td>\$\${t.price.toFixed(2)}</td>
              <td>\$\${t.fee.toFixed(2)}</td>
            </tr>
          \`).join('');
        }
      }
    }
    
    // Initial load
    updateDashboard();
    
    // Auto-refresh
    setInterval(updateDashboard, UPDATE_INTERVAL);
  </script>
</body>
</html>
  `);
});
// Redirect root to dashboard
app.get('/', (_req, res) => {
    res.redirect('/dashboard');
});
// Start server
function startDashboard() {
    app.listen(PORT, () => {
        logger_1.logger.info(`Dashboard server running at http://localhost:${PORT}`);
        logger_1.logger.info(`Dashboard URL: http://localhost:${PORT}/dashboard`);
        systemStatus = 'running';
    });
}
// Start if run directly
if (require.main === module) {
    startDashboard();
}
//# sourceMappingURL=dashboard-server.js.map
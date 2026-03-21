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

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import basicAuth from 'express-basic-auth';
import { hyperliquid as hlClient } from './utils/hyperliquid';
import { generatePerformanceReport, getBoardSummary, getTradeHistory } from './utils/reporting';
import { logger } from './utils/logger';
import { config } from './config';
import { agentActivityTracker } from './agents/AgentActivityTracker';
import { agentFactory } from './agents';

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3000;

// Authentication configuration
const DASHBOARD_USER = process.env.DASHBOARD_USER || 'admin';
const DASHBOARD_PASS = process.env.DASHBOARD_PASS || 'change_me';
const AUTH_ENABLED = false; //  !== 'false';

// Create basic auth middleware
const authMiddleware = basicAuth({
  users: {
    [DASHBOARD_USER]: DASHBOARD_PASS,
  },
  challenge: true,
  realm: 'Hyperliquid Dashboard',
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist/dashboard'));

// Apply auth to dashboard routes if enabled
if (AUTH_ENABLED) {
  app.use('/dashboard', authMiddleware);
  app.use('/api', authMiddleware);
  logger.info(`Dashboard auth enabled. User: ${DASHBOARD_USER}`);
} else {
  logger.warn('Dashboard auth is DISABLED - anyone can access!');
}

// System state
let systemStatus: 'running' | 'stopped' | 'error' = 'stopped';
let lastUpdate: number = 0;
let lastError: string | null = null;

// Health check endpoint (unauthenticated for monitoring)
app.get('/api/health', (_req: Request, res: Response) => {
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
app.get('/api/portfolio', async (_req: Request, res: Response) => {
  try {
    const summary = await getBoardSummary();
    lastUpdate = Date.now();
    lastError = null;
    res.json(summary);
  } catch (error: any) {
    lastError = error.message;
    logger.error('Failed to get portfolio', { error });
    res.status(500).json({ error: error.message });
  }
});

// Detailed performance report
app.get('/api/performance', async (_req: Request, res: Response) => {
  try {
    const report = await generatePerformanceReport();
    lastUpdate = Date.now();
    lastError = null;
    res.json(report);
  } catch (error: any) {
    lastError = error.message;
    logger.error('Failed to get performance report', { error });
    res.status(500).json({ error: error.message });
  }
});

// Positions endpoint
app.get('/api/positions', async (_req: Request, res: Response) => {
  try {
    const positions = await hlClient.getPositions();
    const usdcBalance = await hlClient.getUsdcBalance();
    
    const positionsWithValue = positions.map((p: any) => ({
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
  } catch (error: any) {
    lastError = error.message;
    logger.error('Failed to get positions', { error });
    res.status(500).json({ error: error.message });
  }
});

// Trade history endpoint
app.get('/api/trades', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    
    const history = await getTradeHistory(page, pageSize);
    lastUpdate = Date.now();
    res.json(history);
  } catch (error: any) {
    lastError = error.message;
    logger.error('Failed to get trades', { error });
    res.status(500).json({ error: error.message });
  }
});

// Market data endpoint
app.get('/api/markets', async (_req: Request, res: Response) => {
  try {
    const assets = await hlClient.getAssets();
    const topAssets = assets.slice(0, 20).map((asset: any) => ({
      name: asset,
      // Note: Would need to fetch detailed market data per asset
      // This is simplified for now
    }));
    
    res.json({ assets: topAssets });
  } catch (error: any) {
    lastError = error.message;
    logger.error('Failed to get markets', { error });
    res.status(500).json({ error: error.message });
  }
});

// System status endpoint
app.get('/api/system', (_req: Request, res: Response) => {
  res.json({
    status: systemStatus,
    config: {
      dataAgentIntervalMs: config.agents.dataAgentIntervalMs,
      analysisAgentIntervalMs: config.agents.analysisAgentIntervalMs,
      riskCheckEnabled: config.agents.riskCheckEnabled,
    },
    lastUpdate,
    lastError,
    timestamp: Date.now(),
  });
});

// Initialize agent activity tracker
agentActivityTracker.initializeFromConfigs(agentFactory.getAgentStatuses());

// Agent status endpoint
app.get('/api/agents', (_req: Request, res: Response) => {
  const data = agentActivityTracker.getDashboardData();
  res.json({
    agents: data.agents,
    strategies: data.strategies,
    summary: data.summary,
    timestamp: Date.now(),
  });
});

// Agent strategies endpoint
app.get('/api/strategies', (_req: Request, res: Response) => {
  const strategies = agentActivityTracker.getAllStrategies();
  const activities = agentActivityTracker.getAllActivities();
  
  // Enrich strategies with agent info
  const enrichedStrategies = strategies.map(strategy => {
    const activity = activities.find(a => a.agentId === strategy.agentId);
    return {
      ...strategy,
      agentName: activity?.agentName,
      agentStatus: activity?.status,
      lastRun: activity?.lastRun,
      enabled: activity?.enabled ?? strategy.enabled,
    };
  });
  
  res.json({
    strategies: enrichedStrategies,
    timestamp: Date.now(),
  });
});

// Dashboard HTML - serve from external file
import * as fs from 'fs';
import * as path from 'path';

app.get('/dashboard', (_req: Request, res: Response) => {
  const htmlPath = path.join(__dirname, 'dashboard', 'index.html');
  try {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    res.send(html);
  } catch (err) {
    logger.error('Failed to read dashboard HTML:', err);
    res.status(500).send('Dashboard not found');
  }
});

/*
// Original inline HTML (kept for reference)
app.get('/dashboard', (_req: Request, res: Response) => {
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
    
    .status-idle { background: #6b7280; color: #e5e7eb; }
    .status-completed { background: #059669; color: #a7f3d0; }
    .status-disabled { background: #9ca3af; color: #f3f4f6; }
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
  
  <!-- Agent Strategies Section -->
  <div class="grid">
    <!-- Agent Summary -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">Agent Summary</span>
      </div>
      <div class="stat-grid">
        <div class="stat">
          <div class="stat-label">Total Agents</div>
          <div class="stat-value" id="totalAgents">0</div>
        </div>
        <div class="stat">
          <div class="stat-label">Active Agents</div>
          <div class="stat-value" id="activeAgents">0</div>
        </div>
        <div class="stat">
          <div class="stat-label">Signals Today</div>
          <div class="stat-value" id="signalsToday">0</div>
        </div>
        <div class="stat">
          <div class="stat-label">Avg Confidence</div>
          <div class="stat-value" id="avgConfidence">0%</div>
        </div>
      </div>
    </div>
    
    <!-- Agent Status -->
    <div class="card" style="grid-column: span 2;">
      <div class="card-header">
        <span class="card-title">Agent Status</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Agent</th>
            <th>Model</th>
            <th>Specialty</th>
            <th>Status</th>
            <th>Last Run</th>
            <th>Signals</th>
          </tr>
        </thead>
        <tbody id="agentsTable">
          <tr><td colspan="6" style="text-align: center; color: #64748b;">Loading...</td></tr>
        </tbody>
      </table>
    </div>
    
    <!-- Strategies -->
    <div class="card" style="grid-column: span 3;">
      <div class="card-header">
        <span class="card-title">Strategies</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Strategy</th>
            <th>Description</th>
            <th>Agent</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="strategiesTable">
          <tr><td colspan="4" style="text-align: center; color: #64748b;">Loading...</td></tr>
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
      
      // Get agent data
      const agentsData = await fetchJSON(API_BASE + '/api/agents');
      if (agentsData) {
        // Update summary
        document.getElementById('totalAgents').textContent = agentsData.summary.totalAgents;
        document.getElementById('activeAgents').textContent = agentsData.summary.activeAgents;
        document.getElementById('signalsToday').textContent = agentsData.summary.totalSignalsToday;
        document.getElementById('avgConfidence').textContent = agentsData.summary.avgConfidence + '%';
        
        // Update agents table
        const agentsBody = document.getElementById('agentsTable');
        if (agentsData.agents && agentsData.agents.length > 0) {
          agentsBody.innerHTML = agentsData.agents.map(a => \`
            <tr>
              <td>\${a.agentName}</td>
              <td>\${a.model.toUpperCase()}</td>
              <td>\${a.specialty}</td>
              <td><span class="status-badge status-\${a.status}">\${a.status}</span></td>
              <td>\${a.lastRun ? new Date(a.lastRun).toLocaleString() : 'Never'}</td>
              <td>\${a.signalsGenerated}</td>
            </tr>
          \`).join('');
        } else {
          agentsBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b;">No agents configured</td></tr>';
        }
        
        // Update strategies table
        const strategiesBody = document.getElementById('strategiesTable');
        if (agentsData.strategies && agentsData.strategies.length > 0) {
          strategiesBody.innerHTML = agentsData.strategies.map(s => \`
            <tr>
              <td><strong>\${s.name}</strong></td>
              <td>\${s.description}</td>
              <td>\${s.agentId}</td>
              <td><span class="status-badge status-\${s.enabled ? 'running' : 'stopped'}">\${s.enabled ? 'Active' : 'Disabled'}</span></td>
            </tr>
          \`).join('');
        } else {
          strategiesBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b;">No strategies configured</td></tr>';
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
*/

// Redirect root to dashboard
app.get('/', (_req: Request, res: Response) => {
  res.redirect('/dashboard');
});

// Start server
export function startDashboard(): void {
  app.listen(PORT, () => {
    logger.info(`Dashboard server running at http://localhost:${PORT}`);
    logger.info(`Dashboard URL: http://localhost:${PORT}/dashboard`);
    systemStatus = 'running';
  });
}

// Export for import
export { app };

// Start if run directly
if (require.main === module) {
  startDashboard();
}

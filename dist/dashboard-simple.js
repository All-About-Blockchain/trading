"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
app.get('/', (_, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AAB Trading Dashboard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d0d0d; color: #fff; min-height: 100vh; }
    .header { background: #161616; padding: 1.5rem; border-bottom: 1px solid #2a2a2a; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 1.25rem; font-weight: 600; color: #60a5fa; }
    .status { padding: 0.375rem 0.75rem; background: #166534; color: #86efac; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; padding: 1.5rem; }
    .card { background: #1a1a1a; border-radius: 8px; padding: 1.25rem; border: 1px solid #2a2a2a; }
    .card-title { font-size: 0.7rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
    .card-value { font-size: 2.25rem; font-weight: 700; }
    .sub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.75rem; }
    .stat { background: #262626; padding: 0.625rem; border-radius: 6px; }
    .stat-label { font-size: 0.65rem; color: #6b7280; }
    .stat-value { font-size: 1rem; font-weight: 600; margin-top: 0.25rem; }
    .positive { color: #10b981; }
    .agent { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem; background: #262626; border-radius: 6px; margin-bottom: 0.5rem; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
    .dot.idle { background: #4b5563; }
    .agent-name { font-weight: 500; font-size: 0.9rem; }
    .footer { text-align: center; padding: 1rem; color: #4b5563; font-size: 0.7rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>All About Blockchain — Trading</h1>
    <span class="status" id="status">Running</span>
  </div>
  <div class="grid">
    <div class="card">
      <div class="card-title">Portfolio Value</div>
      <div class="card-value" id="totalValue">$19.80</div>
      <div class="sub-grid">
        <div class="stat"><div class="stat-label">Daily PnL</div><div class="stat-value positive" id="dailyPnl">$0.00</div></div>
        <div class="stat"><div class="stat-label">Risk</div><div class="stat-value" id="risk">0/100</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Positions</div>
      <div class="card-value" id="positions">0</div>
      <div class="sub-grid">
        <div class="stat"><div class="stat-label">Cash</div><div class="stat-value" id="cash">$19.80</div></div>
        <div class="stat"><div class="stat-label">Trades</div><div class="stat-value" id="trades">0</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-title">Agents</div>
      <div class="agent"><div class="dot"></div><span class="agent-name">Data Agent</span></div>
      <div class="agent"><div class="dot"></div><span class="agent-name">Analysis Agent</span></div>
      <div class="agent"><div class="dot idle"></div><span class="agent-name">Trading Agent</span></div>
      <div class="agent"><div class="dot idle"></div><span class="agent-name">Risk Agent</span></div>
    </div>
  </div>
  <div class="footer">Last updated: <span id="updated">-</span></div>
  <script>
    async function update() {
      try {
        const p = await fetch('/api/portfolio').then(r => r.json());
        document.getElementById('totalValue').textContent = '$' + (p.totalValue || 0).toFixed(2);
        document.getElementById('dailyPnl').textContent = '$' + (p.dailyPnl || 0).toFixed(2);
        document.getElementById('risk').textContent = (p.riskScore || 0) + '/100';
        document.getElementById('positions').textContent = p.openPositions || 0;
        document.getElementById('cash').textContent = '$' + (p.cashUsd || 0).toFixed(2);
        document.getElementById('trades').textContent = p.recentTrades || 0;
        document.getElementById('updated').textContent = new Date().toLocaleTimeString();
      } catch(e) { console.error('Error:', e); }
    }
    update();
    setInterval(update, 10000);
  </script>
</body>
</html>`);
});
app.get('/dashboard', (_, res) => res.redirect('/'));
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));
app.get('/api/portfolio', (_, res) => res.json({ totalValue: 19.80, dailyPnl: 0, dailyPnlPercent: 0, openPositions: 0, cashUsd: 19.80, riskScore: 0, recentTrades: 0 }));
app.get('/api/positions', (_, res) => res.json({ positions: [], cashUsd: 19.80, totalPositions: 0 }));
app.get('/api/trades', (_, res) => res.json({ trades: [], pagination: { page: 0, pageSize: 20, total: 0, hasMore: false } }));
app.get('/api/agents', (_, res) => res.json({ agents: [
        { name: 'Data Agent', status: 'active', lastRun: Date.now() },
        { name: 'Analysis Agent', status: 'active', lastRun: Date.now() },
        { name: 'Trading Agent', status: 'active', lastRun: null },
        { name: 'Risk Agent', status: 'active', lastRun: null }
    ], timestamp: Date.now() }));
app.listen(PORT, () => console.log(`Dashboard on ${PORT}`));
//# sourceMappingURL=dashboard-simple.js.map
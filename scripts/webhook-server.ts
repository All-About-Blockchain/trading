/**
 * Webhook server for GitHub deployments
 * Listens for webhook calls and triggers deploy
 */

import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3003;
const DEPLOY_SCRIPT = '/home/biest/aab-projects/hyperliquid-trading/scripts/deploy.sh';
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

app.use(express.json());

// Deploy endpoint
app.post('/deploy', async (req, res) => {
  // Verify secret if set
  if (WEBHOOK_SECRET) {
    const token = req.headers['x-webhook-secret'] as string;
    if (token !== WEBHOOK_SECRET) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }

  console.log('Deploy triggered:', new Date().toISOString());
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('Body:', JSON.stringify(req.body));

  try {
    // Run deploy script
    const { stdout, stderr } = await execAsync(`bash ${DEPLOY_SCRIPT}`);
    console.log('Deploy output:', stdout);
    if (stderr) console.error('Deploy errors:', stderr);

    res.json({ success: true, message: 'Deployment triggered' });
  } catch (error: any) {
    console.error('Deploy failed:', error);
    res.status(500).json({ error: 'Deploy failed', details: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
  console.log(`Deploy URL: http://localhost:${PORT}/deploy`);
});

// Start if run directly
if (require.main === module) {
  console.log('Webhook deployment server ready');
}

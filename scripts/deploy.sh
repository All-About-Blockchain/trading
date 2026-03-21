#!/bin/bash
# Deploy script for hyperliquid-trading dashboard
# Can be triggered via webhook or manually

set -e

PROJECT_DIR="/home/biest/aab-projects/hyperliquid-trading"
LOG_FILE="/tmp/dashboard-deploy.log"

echo "$(date): Starting deployment..." >> $LOG_FILE

cd $PROJECT_DIR

# Pull latest changes
echo "$(date): Pulling latest changes..." >> $LOG_FILE
git pull origin main >> $LOG_FILE 2>&1

# Rebuild TypeScript (ignore errors from broken agent files)
echo "$(date): Building..." >> $LOG_FILE
npx tsc --skipLibCheck >> $LOG_FILE 2>&1 || true

# Restart dashboard
echo "$(date): Restarting dashboard..." >> $LOG_FILE

# Kill existing dashboard
pkill -f "dashboard-server" 2>/dev/null || true
sleep 1

# Start dashboard on port 3002
cd $PROJECT_DIR
DASHBOARD_PORT=3002 node dist/dashboard-server.js >> $LOG_FILE 2>&1 &

# Verify it's running
sleep 2
if curl -sf http://localhost:3002/dashboard > /dev/null; then
    echo "$(date): Deployment successful!" >> $LOG_FILE
    echo "Dashboard deployed successfully to https://trading.aab.engineering/dashboard"
else
    echo "$(date): WARNING - Dashboard may not be responding" >> $LOG_FILE
fi

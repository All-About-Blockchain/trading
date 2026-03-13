/**
 * Board Reporting CLI
 * Run to generate reports for board/dashboard display
 * 
 * Usage:
 *   npm run report          # Show board summary
 *   npm run report:perf     # Show full performance report
 *   npm run report:trades   # Show trade history
 */

import { generatePerformanceReport, getTradeHistory, getBoardSummary } from './utils/reporting';
import { hlClient } from './utils/hyperliquid';
import { config } from './config';
import { logger } from './utils/logger';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'summary';
  
  // Initialize the client
  try {
    await hlClient.initialize();
  } catch (error) {
    logger.warn('Could not initialize Hyperliquid client (missing credentials?)');
  }
  
  switch (command) {
    case 'summary':
    case 'board':
      await showBoardSummary();
      break;
    case 'perf':
    case 'performance':
      await showPerformanceReport();
      break;
    case 'trades':
      await showTradeHistory();
      break;
    default:
      console.log('Unknown command:', command);
      console.log('Usage: npm run report [summary|perf|trades]');
  }
}

async function showBoardSummary() {
  console.log('\n📊 BOARD SUMMARY\n' + '=' .repeat(50));
  
  try {
    const summary = await getBoardSummary();
    
    console.log(`Total Portfolio Value: $${summary.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
    console.log(`Daily PnL: $${summary.dailyPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${summary.dailyPnlPercent.toFixed(2)}%)`);
    console.log(`Open Positions: ${summary.openPositions}`);
    console.log(`Trades Today: ${summary.recentTrades}`);
    console.log(`Risk Score: ${summary.riskScore}/100`);
    
    // Color coding for PnL
    const pnlEmoji = summary.dailyPnl >= 0 ? '🟢' : '🔴';
    console.log(`\n${pnlEmoji} Status: ${summary.dailyPnl >= 0 ? 'Profit' : 'Loss'} today`);
  } catch (error) {
    console.log('Error generating summary:', error);
  }
  
  console.log('=' .repeat(50) + '\n');
}

async function showPerformanceReport() {
  console.log('\n📈 PERFORMANCE REPORT\n' + '=' .repeat(50));
  
  try {
    const report = await generatePerformanceReport();
    
    // Portfolio Summary
    console.log('\n💰 PORTFOLIO');
    console.log(`  Total Value:      $${report.portfolio.totalValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
    console.log(`  Cash:             $${report.portfolio.cashUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
    console.log(`  Positions Value:  $${report.portfolio.positionsValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
    console.log(`  Available:        $${report.portfolio.availableUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
    
    // PnL
    console.log('\n📊 P&L');
    console.log(`  Daily:    $${report.portfolio.dailyPnl.toFixed(2)} (${report.portfolio.dailyPnlPercent.toFixed(2)}%)`);
    console.log(`  Weekly:   $${report.portfolio.weeklyPnl.toFixed(2)} (${report.portfolio.weeklyPnlPercent.toFixed(2)}%)`);
    console.log(`  Total:    $${report.portfolio.totalPnl.toFixed(2)} (${report.portfolio.totalPnlPercent.toFixed(2)}%)`);
    
    // Daily Stats
    console.log('\n📈 DAILY STATS');
    console.log(`  Trades:        ${report.dailyStats.tradesCount}`);
    console.log(`  Volume:       $${report.dailyStats.volumeUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
    console.log(`  Win Rate:     ${(report.dailyStats.winRate * 100).toFixed(1)}%`);
    console.log(`  Winners:       ${report.dailyStats.winningTrades}`);
    console.log(`  Losers:        ${report.dailyStats.losingTrades}`);
    
    // Positions
    console.log('\n📋 POSITIONS');
    if (report.positions.length === 0) {
      console.log('  No open positions');
    } else {
      for (const pos of report.positions) {
        const pnlEmoji = pos.unrealizedPnl >= 0 ? '🟢' : '🔴';
        console.log(`  ${pos.asset}: ${pos.side.toUpperCase()} ${Math.abs(pos.size)} @ $${pos.currentPrice} ${pnlEmoji} $${pos.unrealizedPnl.toFixed(2)}`);
      }
    }
    
    // Risk
    console.log('\n⚠️  RISK METRICS');
    console.log(`  Total Leverage:     ${report.riskMetrics.totalLeverage.toFixed(2)}x`);
    console.log(`  Largest Position:   ${report.riskMetrics.largestPositionPercent.toFixed(1)}%`);
    console.log(`  Risk Score:          ${report.riskMetrics.riskScore}/100`);
    
    console.log(`\nGenerated: ${new Date(report.generatedAt).toISOString()}`);
  } catch (error) {
    console.log('Error generating report:', error);
  }
  
  console.log('=' .repeat(50) + '\n');
}

async function showTradeHistory() {
  console.log('\n📜 TRADE HISTORY\n' + '=' .repeat(50));
  
  try {
    const page = parseInt(process.argv[2]) || 0;
    const pageSize = parseInt(process.argv[3]) || 20;
    
    const history = await getTradeHistory(page, pageSize);
    
    console.log(`Page ${history.pagination.page + 1} of ${Math.ceil(history.pagination.total / pageSize)}`);
    console.log(`Total trades: ${history.pagination.total}\n`);
    
    if (history.trades.length === 0) {
      console.log('No trades found');
    } else {
      for (const trade of history.trades) {
        const date = new Date(trade.timestamp).toISOString();
        const sideEmoji = trade.side === 'buy' ? '🟢' : '🔴';
        console.log(`${date} ${sideEmoji} ${trade.side.toUpperCase()} ${trade.size} ${trade.asset} @ $${trade.price} (fee: $${trade.fee.toFixed(2)})`);
      }
    }
  } catch (error) {
    console.log('Error generating trade history:', error);
  }
  
  console.log('=' .repeat(50) + '\n');
}

main();

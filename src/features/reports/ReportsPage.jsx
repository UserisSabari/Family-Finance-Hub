import { useCallback, useEffect, useState } from 'react';

import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { CategoryBreakdown } from '../../components/finance/CategoryBreakdown';
import { SpendDonutChart } from '../../components/finance/SpendDonutChart';
import { TrendChart } from '../../components/finance/TrendChart';
import { formatInr } from '../../lib/format/currency';
import { useWorkspace } from '../../hooks/useWorkspace';
import { listReportTransactions } from './reportRepository';
import {
  buildCategoryBreakdown,
  buildPaymentModeBreakdown,
  buildTrend,
  calculateSpendVelocity,
} from './reportCalculations';
import '../budgets-goals-reports/features.css';

export function ReportsPage() {
  const { workspace, loading: workspaceLoading, error: workspaceError } = useWorkspace();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('all');

  const load = useCallback(async () => {
    if (!workspace?.id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listReportTransactions(workspace.id);
      setTransactions(result || []);
    } catch (reason) {
      setError(reason);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  useEffect(() => { load(); }, [load]);

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const threeMonthsStr = `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`;

  let range = { start: '0000-01-01', end: '9999-12-31' };
  if (period === 'month') {
    range = {
      start: `${currentMonthStr}-01`,
      end: `${currentMonthStr}-31`,
    };
  } else if (period === '3months') {
    range = {
      start: threeMonthsStr,
      end: `${now.getFullYear()}-12-31`,
    };
  }

  const categoryItems = buildCategoryBreakdown(transactions, range);
  const trendPoints = buildTrend(transactions, range);
  const totalExpense = categoryItems.reduce((sum, item) => sum + item.amount, 0);
  const paymentMode = buildPaymentModeBreakdown(transactions, range);
  const velocity = calculateSpendVelocity(transactions, range);

  return (
    <main className="page-content reports-page">
      <header className="feature-header">
        <p className="eyebrow">Understand your habits</p>
        <h1>Reports</h1>
        <p className="muted">Spending categories and trends based on source transactions.</p>
      </header>

      {workspaceLoading && <LoadingState label="Loading your workspace…" />}
      {workspaceError && <ErrorState message="Could not load your workspace." />}
      {error && <ErrorState message="Could not load reports. Please try again." />}

      {!workspaceLoading && !workspaceError && (
        <>
          {loading ? (
            <LoadingState label="Loading reports…" />
          ) : transactions.length === 0 ? (
            <p className="muted">No transaction data yet. Reports will appear after you add transactions.</p>
          ) : (
            <>
              {/* Period Filter Pills */}
              <div className="report-period-pills" role="tablist" aria-label="Select report period">
                <button
                  type="button"
                  className={`report-period-btn ${period === 'all' ? 'active' : ''}`}
                  onClick={() => setPeriod('all')}
                >
                  All Time
                </button>
                <button
                  type="button"
                  className={`report-period-btn ${period === '3months' ? 'active' : ''}`}
                  onClick={() => setPeriod('3months')}
                >
                  Last 3 Months
                </button>
                <button
                  type="button"
                  className={`report-period-btn ${period === 'month' ? 'active' : ''}`}
                  onClick={() => setPeriod('month')}
                >
                  This Month
                </button>
              </div>

              {/* Period Summary Metric Banner */}
              <div className="report-metrics-grid">
                <div className="metric-card metric-expense">
                  <p>Total Outflow</p>
                  <strong>{formatInr(totalExpense)}</strong>
                </div>
                <div className="metric-card metric-balance">
                  <p>Daily Average</p>
                  <strong>{formatInr(velocity.dailyAverage)}</strong>
                </div>
                <div className="metric-card metric-savings">
                  <p>Top Category</p>
                  <strong>{categoryItems[0]?.category || '—'}</strong>
                </div>
                {velocity.highestSpendDay ? (
                  <div className="metric-card metric-peak">
                    <p>Peak Day ({velocity.highestSpendDay})</p>
                    <strong>{formatInr(velocity.highestSpendAmount)}</strong>
                  </div>
                ) : (
                  <div className="metric-card metric-neutral">
                    <p>Transactions</p>
                    <strong>{transactions.length}</strong>
                  </div>
                )}
              </div>

              <div className="feature-grid" style={{ marginTop: 0 }}>
                {/* Visual Donut Chart + Category Breakdown */}
                <section className="feature-card report-card-wide">
                  <h2>Spend Distribution</h2>
                  <SpendDonutChart items={categoryItems} />
                  <div className="report-category-breakdown-wrap">
                    <h3 className="report-subheading">Category Breakdown</h3>
                    <CategoryBreakdown items={categoryItems} />
                  </div>
                </section>

                {/* Payment Mode (Digital vs Cash) */}
                <section className="feature-card report-payment-card">
                  <h2>Payment Mode (Digital vs Cash)</h2>
                  <div className="payment-mode-stats">
                    <div className="payment-mode-item">
                      <div className="payment-mode-header">
                        <span>Bank / UPI / Card</span>
                        <span>{formatInr(paymentMode.bank)} ({paymentMode.bankPercentage}%)</span>
                      </div>
                      <div className="breakdown-track">
                        <span className="payment-bar-bank" style={{ width: `${paymentMode.bankPercentage}%` }} />
                      </div>
                    </div>

                    <div className="payment-mode-item">
                      <div className="payment-mode-header">
                        <span>Liquid Cash in Hand</span>
                        <span>{formatInr(paymentMode.cash)} ({paymentMode.cashPercentage}%)</span>
                      </div>
                      <div className="breakdown-track">
                        <span className="payment-bar-cash" style={{ width: `${paymentMode.cashPercentage}%` }} />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="feature-card">
                  <h2>Monthly trend</h2>
                  <TrendChart points={trendPoints} />
                </section>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}

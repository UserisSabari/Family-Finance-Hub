import { useEffect, useState } from 'react';

import { useWorkspace } from '../../hooks/useWorkspace';
import { calculateSummary } from '../../lib/finance/calculations';
import { formatInr } from '../../lib/format/currency';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { MetricCard } from '../../components/finance/MetricCard';
import { ProgressBar } from '../../components/finance/ProgressBar';
import { TransactionPreview } from '../../components/finance/TransactionPreview';
import { IconPlus } from '../../components/icons/Icons';
import { getDashboardRecords } from './dashboardRepository';
import './dashboard.css';

export function DashboardPage() {
  const { workspace, loading: workspaceLoading, error: workspaceError } = useWorkspace();
  const [records, setRecords] = useState(null);
  const [error, setError] = useState(workspaceError);

  useEffect(() => {
    let active = true;
    if (!workspace?.id) return () => { active = false; };
    setRecords(null);
    setError(null);
    getDashboardRecords(workspace.id)
      .then((result) => { if (active) setRecords(result); })
      .catch((reason) => {
        console.error('getDashboardRecords failed:', reason);
        if (active) setError(reason);
      });
    return () => { active = false; };
  }, [workspace?.id]);

  const workspaceLabel = workspace?.kind === 'family' ? (workspace.name || 'Family workspace') : 'Personal workspace';

  const header = (
    <header className="dashboard-header">
      <div className="dashboard-title-group">
        <p className="eyebrow">{workspaceLabel}</p>
        <h1>Overview</h1>
        <p className="muted">Here is your financial picture at a glance.</p>
      </div>
      <div className="dashboard-actions">
        <a href="/app/transactions" className="btn btn-primary btn-sm">
          <IconPlus size={16} />
          <span>Add transaction</span>
        </a>
      </div>
    </header>
  );

  if (workspaceLoading || (!records && !error)) {
    return (
      <main className="page-content dashboard-page">
        {header}
        <LoadingState label="Loading your overview…" />
      </main>
    );
  }

  const activeError = error || workspaceError;
  if (activeError) {
    console.error('Dashboard active error:', activeError);
    return (
      <main className="page-content dashboard-page">
        {header}
        <ErrorState message={`Could not load your overview. ${activeError.message ? `(${activeError.message})` : 'Please try again.'}`} />
      </main>
    );
  }

  const summary = calculateSummary(records.transactions, records.contributions);
  const recent = [...records.transactions, ...records.contributions]
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
    .slice(0, 5);
  const hasActivity = recent.length > 0;

  // Daily spend pace calculation for current month
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = Math.max(1, now.getDate());
  const remainingDays = Math.max(1, daysInMonth - dayOfMonth + 1);

  // Filter current month expenses
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthExpenses = records.transactions
    .filter((tx) => tx.type === 'expense' && String(tx.date || '').startsWith(monthPrefix))
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const dailyAverageSpend = thisMonthExpenses > 0 ? thisMonthExpenses / dayOfMonth : 0;
  const projectedMonthSpend = dailyAverageSpend * daysInMonth;

  // Monthly budget total
  const totalBudget = records.budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const remainingBudget = Math.max(0, totalBudget - thisMonthExpenses);
  const dailyBudgetAllowance = totalBudget > 0 ? remainingBudget / remainingDays : 0;

  return (
    <main className="page-content dashboard-page">
      {header}

      {/* Daily Pulse Banner */}
      <section className="daily-pulse-card" aria-label="Daily financial pulse">
        <div className="daily-pulse-item">
          <span className="daily-pulse-label">Daily Average Spend</span>
          <span className="daily-pulse-value">{formatInr(dailyAverageSpend)}</span>
          <span className="daily-pulse-sub">Based on day {dayOfMonth} of {daysInMonth}</span>
        </div>

        <div className="daily-pulse-item">
          <span className="daily-pulse-label">Projected Month Spend</span>
          <span className="daily-pulse-value">{formatInr(projectedMonthSpend)}</span>
          <span className="daily-pulse-sub">At current daily spending pace</span>
        </div>

        {totalBudget > 0 ? (
          <div className="daily-pulse-item">
            <span className="daily-pulse-label">Daily Budget Allowance</span>
            <span className="daily-pulse-value" style={{ color: dailyBudgetAllowance > 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
              {formatInr(dailyBudgetAllowance)} / day
            </span>
            <span className="daily-pulse-sub">{remainingDays} days remaining in month</span>
          </div>
        ) : (
          <div className="daily-pulse-item">
            <span className="daily-pulse-label">Month Progress</span>
            <span className="daily-pulse-value">{Math.round((dayOfMonth / daysInMonth) * 100)}%</span>
            <span className="daily-pulse-sub">{remainingDays} days left this month</span>
          </div>
        )}
      </section>

      {/* Top 4 Metrics */}
      <section className="metric-grid" aria-label="Financial summary">
        <MetricCard label="Income" value={summary.income} tone="metric-income" />
        <MetricCard label="Expenses" value={summary.expenses} tone="metric-expense" />
        <MetricCard label="Balance" value={summary.balance} tone="metric-balance" />
        <MetricCard label="Savings" value={summary.savings} tone="metric-savings" />
      </section>

      {/* Dashboard Progress & Recent Activity */}
      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Progress</h2>
            <a href="/app/goals" className="muted" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>View all →</a>
          </div>
          {records.goals.length === 0 && records.budgets.length === 0 ? (
            <p className="muted">No budgets or goals yet.</p>
          ) : (
            <>
              {records.goals.map((goal) => (
                <ProgressBar
                  key={goal.id}
                  label={goal.name || 'Savings goal'}
                  value={goal.current ?? goal.saved ?? 0}
                  max={goal.target || 0}
                />
              ))}
              {records.budgets.map((budget) => (
                <ProgressBar
                  key={budget.id}
                  label={budget.name || budget.category || 'Budget'}
                  value={budget.spent || 0}
                  max={budget.amount || 0}
                />
              ))}
            </>
          )}
        </article>

        <article className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Recent activity</h2>
            <a href="/app/transactions" className="muted" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>View all →</a>
          </div>
          {hasActivity ? (
            <ul className="transaction-list">
              {recent.map((item) => (
                <TransactionPreview key={item.id} transaction={item} />
              ))}
            </ul>
          ) : (
            <p className="muted">No activity yet. Add your first transaction to get started.</p>
          )}
        </article>
      </section>

      <p className="dashboard-footnote">
        Current balance: {formatInr(summary.balance)} · Savings rate: {summary.savingsRate}%
      </p>
    </main>
  );
}

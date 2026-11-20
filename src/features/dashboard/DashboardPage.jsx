import { useEffect, useState } from 'react';

import { useWorkspace } from '../../hooks/useWorkspace';
import { calculateAccountBalances, calculateSummary } from '../../lib/finance/calculations';
import { formatInr } from '../../lib/format/currency';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { MetricCard } from '../../components/finance/MetricCard';
import { ProgressBar } from '../../components/finance/ProgressBar';
import { TransactionPreview } from '../../components/finance/TransactionPreview';
import { TransactionForm } from '../../components/transactions/TransactionForm';
import { createTransaction } from '../transactions/transactionRepository';
import {
  IconPlus,
  IconSplit,
  IconTransfer,
  IconPassthrough,
} from '../../components/icons/Icons';
import { getDashboardRecords } from './dashboardRepository';
import './dashboard.css';

const CATEGORY_COLORS = [
  '#10b981', // Emerald / Mint
  '#06b6d4', // Cyan
  '#818cf8', // Indigo / Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#3b82f6', // Blue
];

export function DashboardPage() {
  const { workspace, loading: workspaceLoading, error: workspaceError } = useWorkspace();
  const [records, setRecords] = useState(null);
  const [error, setError] = useState(workspaceError);

  // Quick Action Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [initialFormValues, setInitialFormValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const loadDashboard = (activeRef) => {
    if (!workspace?.id) return;
    getDashboardRecords(workspace.id)
      .then((result) => { if (activeRef ? activeRef.active : true) setRecords(result); })
      .catch((reason) => {
        console.error('getDashboardRecords failed:', reason);
        if (activeRef ? activeRef.active : true) setError(reason);
      });
  };

  useEffect(() => {
    const activeRef = { active: true };
    if (!workspace?.id) return () => { activeRef.active = false; };
    setRecords(null);
    setError(null);
    loadDashboard(activeRef);

    const onTxSaved = () => loadDashboard(activeRef);
    window.addEventListener('ffh:transaction-saved', onTxSaved);

    return () => {
      activeRef.active = false;
      window.removeEventListener('ffh:transaction-saved', onTxSaved);
    };
  }, [workspace?.id]);

  const openQuickAction = (actionType) => {
    setFeedback('');
    if (actionType === 'add') {
      setInitialFormValues({ type: 'expense' });
    } else if (actionType === 'split') {
      setInitialFormValues({
        type: 'expense',
        splitNote: {
          isGroup: true,
          splitMode: 'equal',
          totalBill: 0,
          myShare: 0,
          members: [
            { name: 'Self', share: 0, settled: true },
            { name: 'Friend 1', share: 0, settled: false },
          ],
        },
      });
    } else if (actionType === 'transfer') {
      setInitialFormValues({ type: 'transfer', fromAccount: 'bank', toAccount: 'cash' });
    } else if (actionType === 'pass_through') {
      setInitialFormValues({ type: 'pass_through' });
    }
    setModalOpen(true);
  };

  const handleModalSave = async (input) => {
    if (!workspace?.id || submitting) return;
    setSubmitting(true);
    setFeedback('');
    try {
      await createTransaction(workspace.id, input);
      setFeedback('Transaction recorded.');
      setTimeout(() => {
        setModalOpen(false);
        setFeedback('');
        loadDashboard(null);
      }, 400);
    } catch (err) {
      setFeedback(err.message || 'Could not save transaction.');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const workspaceLabel = workspace?.kind === 'family' ? (workspace.name || 'Family workspace') : 'Personal workspace';

  const header = (
    <header className="dashboard-header">
      <div className="dashboard-title-group">
        <p className="eyebrow">{workspaceLabel}</p>
        <h1>Overview</h1>
        <p className="muted">Here is your financial picture at a glance.</p>
      </div>
      <div className="dashboard-actions">
        <button
          type="button"
          onClick={() => openQuickAction('add')}
          className="btn btn-primary btn-sm"
        >
          <IconPlus size={16} />
          <span>Add transaction</span>
        </button>
      </div>
    </header>
  );

  if (workspaceLoading || (!records && !error)) {
    return (
      <main className="page-content dashboard-page">
        {header}
        <LoadingState label="Loading your overview…" type="bento" />
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
  const accountBalances = calculateAccountBalances(records.transactions);
  const recent = [...records.transactions, ...records.contributions]
    .sort((a, b) => {
      const dateCmp = String(b.date || '').localeCompare(String(a.date || ''));
      if (dateCmp !== 0) return dateCmp;
      return String(b.time || '00:00').localeCompare(String(a.time || '00:00'));
    })
    .slice(0, 5);
  const hasActivity = recent.length > 0;

  // Daily spend pace calculation for current month
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = Math.max(1, now.getDate());
  const remainingDays = Math.max(1, daysInMonth - dayOfMonth + 1);

  // Filter current month expenses accounting for friend splits and refunds
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthExpenses = Math.max(0, records.transactions
    .filter((tx) => (tx.type === 'expense' || tx.type === 'refund') && String(tx.date || '').startsWith(monthPrefix))
    .reduce((sum, tx) => {
      let val = Number(tx.amount || 0);
      if (tx.type === 'expense') {
        if (tx.splitNote?.myShare !== undefined && Number.isFinite(Number(tx.splitNote.myShare))) {
          val = Number(tx.splitNote.myShare);
        }
        return sum + val;
      }
      if (tx.type === 'refund') {
        return sum - val;
      }
      return sum;
    }, 0));

  const dailyAverageSpend = thisMonthExpenses > 0 ? thisMonthExpenses / dayOfMonth : 0;
  const projectedMonthSpend = dailyAverageSpend * daysInMonth;

  // Monthly budget total
  const totalBudget = records.budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const remainingBudget = Math.max(0, totalBudget - thisMonthExpenses);
  const dailyBudgetAllowance = totalBudget > 0 ? remainingBudget / remainingDays : 0;

  // Spend pace meter width percentage
  let paceProgressPercent = 0;
  if (totalBudget > 0) {
    paceProgressPercent = Math.min(100, Math.round((thisMonthExpenses / totalBudget) * 100));
  } else {
    paceProgressPercent = Math.min(100, Math.round((dayOfMonth / daysInMonth) * 100));
  }

  // Category breakdown for Spend Donut
  const categoryTotals = {};
  records.transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      const cat = tx.category || 'Other';
      const amt = Number(tx.splitNote?.myShare ?? tx.amount ?? 0);
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    }
  });

  const totalExpenseSum = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const sortedCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenseSum > 0 ? Math.round((amount / totalExpenseSum) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  // Donut SVG circumference calculation
  const donutRadius = 38;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let donutAccumulated = 0;
  const donutSegments = sortedCategories.map((cat, idx) => {
    const fraction = totalExpenseSum > 0 ? cat.amount / totalExpenseSum : 0;
    const strokeDash = `${fraction * donutCircumference} ${donutCircumference}`;
    const offset = -donutAccumulated;
    donutAccumulated += fraction * donutCircumference;
    return {
      ...cat,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      strokeDash,
      offset,
    };
  });

  return (
    <main className="page-content dashboard-page">
      {header}

      {/* Hero Liquidity Bento Card (Asymmetrical Split Layout) */}
      <section className="dashboard-hero-bento" aria-label="Net liquidity and accounts">
        <div className="hero-split-container">
          <div className="hero-balance-block">
            <span className="hero-balance-label">Current Balance</span>
            <div className="hero-balance-amount">
              <span className="hero-currency-symbol">₹</span>
              <span className="hero-balance-number">
                {formatInr(summary.balance).replace('₹', '')}
              </span>
            </div>
          </div>

          <div className="hero-accounts-stack">
            <div className="hero-account-chip chip-bank">
              <span className="hero-chip-dot dot-bank" />
              <span>Bank & UPI:</span>
              <strong>{formatInr(accountBalances.bank)}</strong>
            </div>
            <div className="hero-account-chip chip-cash">
              <span className="hero-chip-dot dot-cash" />
              <span>Cash in Hand:</span>
              <strong>{formatInr(accountBalances.cash)}</strong>
            </div>
            {accountBalances.pendingReceivables > 0 && (
              <div className="hero-account-chip chip-pending">
                <span className="hero-chip-dot dot-pending" />
                <span>Receivables:</span>
                <strong>{formatInr(accountBalances.pendingReceivables)}</strong>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Daily Spend Pace Bento Card with Neon Glow Bar */}
      <section className="daily-pace-card" aria-label="Daily spending pace">
        <div className="daily-pace-header">
          <span className="daily-pace-title">
            Daily Spend Pace: <strong>{formatInr(dailyAverageSpend)}/day</strong>
          </span>
          <span className="daily-pace-sub">
            {totalBudget > 0
              ? `Budget: ${formatInr(dailyBudgetAllowance)}/day allowance (${remainingDays}d left)`
              : `Day ${dayOfMonth} of ${daysInMonth} · Projected: ${formatInr(projectedMonthSpend)}`}
          </span>
        </div>
        <div className="daily-pace-track" role="progressbar" aria-valuenow={paceProgressPercent} aria-valuemin="0" aria-valuemax="100">
          <div
            className="daily-pace-bar"
            style={{ width: `${Math.max(4, paceProgressPercent)}%` }}
          />
        </div>
      </section>

      {/* Quick Action Circular Buttons Row */}
      <nav className="quick-actions-row" aria-label="Quick financial actions">
        <button
          type="button"
          className="quick-action-btn-item"
          onClick={() => openQuickAction('add')}
          aria-label="Add transaction"
        >
          <div className="quick-action-circle">
            <IconPlus size={20} />
          </div>
          <span className="quick-action-label">Add</span>
        </button>

        <button
          type="button"
          className="quick-action-btn-item"
          onClick={() => openQuickAction('split')}
          aria-label="Split bill with friends"
        >
          <div className="quick-action-circle">
            <IconSplit size={20} />
          </div>
          <span className="quick-action-label">Split Bill</span>
        </button>

        <button
          type="button"
          className="quick-action-btn-item"
          onClick={() => openQuickAction('transfer')}
          aria-label="Transfer between accounts"
        >
          <div className="quick-action-circle">
            <IconTransfer size={20} />
          </div>
          <span className="quick-action-label">Transfer</span>
        </button>

        <button
          type="button"
          className="quick-action-btn-item"
          onClick={() => openQuickAction('pass_through')}
          aria-label="Pass-through expense"
        >
          <div className="quick-action-circle">
            <IconPassthrough size={20} />
          </div>
          <span className="quick-action-label">Pass-through</span>
        </button>
      </nav>

      {/* Spend Breakdown Donut Bento Card */}
      {sortedCategories.length > 0 && (
        <section className="dashboard-breakdown-card" aria-label="Expense breakdown">
          <div className="breakdown-card-header">
            <h2>Expense Breakdown</h2>
            <a href="/app/reports" className="muted" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              Full report →
            </a>
          </div>

          <div className="breakdown-split-grid">
            <div className="breakdown-donut-visual">
              <svg viewBox="0 0 100 100" width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="50"
                  cy="50"
                  r={donutRadius}
                  fill="none"
                  stroke="var(--color-surface-subtle)"
                  strokeWidth="11"
                />
                {donutSegments.map((segment) => (
                  <circle
                    key={segment.category}
                    cx="50"
                    cy="50"
                    r={donutRadius}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="11"
                    strokeDasharray={segment.strokeDash}
                    strokeDashoffset={segment.offset}
                    strokeLinecap="round"
                    className="donut-arc-segment"
                  />
                ))}
              </svg>
              <div className="breakdown-donut-center">
                <span className="donut-center-label">Outflow</span>
                <strong className="donut-center-amount">{formatInr(totalExpenseSum)}</strong>
              </div>
            </div>

            <div className="breakdown-legend-list">
              {donutSegments.map((item) => (
                <div key={item.category} className="breakdown-legend-item">
                  <div className="legend-item-left">
                    <span className="legend-color-dot" style={{ backgroundColor: item.color }} />
                    <span className="legend-category-name">{item.category}</span>
                  </div>
                  <span className="legend-percent-pill">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top 4 Metric Cards */}
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

      {/* Modal Dialog for Quick Actions */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => !submitting && setModalOpen(false)}>
          <div
            className="transaction-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-quick-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 id="dashboard-quick-dialog-title" style={{ margin: 0 }}>
                {initialFormValues.type === 'transfer'
                  ? 'Transfer Money'
                  : initialFormValues.type === 'pass_through'
                  ? 'Record Pass-through'
                  : initialFormValues.splitNote?.isGroup
                  ? 'Split Bill with Group'
                  : 'Add Transaction'}
              </h2>
              <button
                type="button"
                className="action-btn"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.2rem 0.5rem' }}
                onClick={() => !submitting && setModalOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {feedback && (
              <p role="status" className="feedback feedback-success" style={{ marginTop: 'var(--space-3)' }}>
                {feedback}
              </p>
            )}

            <TransactionForm
              initialValues={initialFormValues}
              onSubmit={handleModalSave}
              onCancel={() => setModalOpen(false)}
              submitting={submitting}
            />
          </div>
        </div>
      )}
    </main>
  );
}

import { useCallback, useEffect, useState } from 'react';

import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { formatInr } from '../../lib/format/currency';
import { useWorkspace } from '../../hooks/useWorkspace';
import { IconBudgets, IconPlus, IconSparkles } from '../../components/icons/Icons';
import { listTransactions } from '../transactions/transactionRepository';
import { calculateBudget } from './budgetCalculations';
import { createBudget, listBudgets } from './budgetRepository';
import '../budgets-goals-reports/features.css';

const commonBudgetCategories = [
  'Groceries',
  'Food & Dining',
  'Utilities',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Medical',
];

const categoryColors = {
  Groceries: 'var(--color-emerald, #10b981)',
  'Food & Dining': 'var(--color-amber, #f59e0b)',
  Utilities: 'var(--color-indigo, #6366f1)',
  Transportation: 'var(--color-cyan, #06b6d4)',
  Shopping: 'var(--color-purple, #a855f7)',
  Entertainment: 'var(--color-pink, #ec4899)',
  Medical: 'var(--color-rose, #f43f5e)',
};

export function BudgetsPage() {
  const { workspace, loading: workspaceLoading, error: workspaceError } = useWorkspace();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    category: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const load = useCallback(async () => {
    if (!workspace?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [nextBudgets, nextTransactions] = await Promise.all([
        listBudgets(workspace.id),
        listTransactions(workspace.id),
      ]);
      setBudgets(nextBudgets);
      setTransactions(nextTransactions);
    } catch (reason) {
      setError(reason);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  useEffect(() => { load(); }, [load]);

  const save = async (event) => {
    event.preventDefault();
    try {
      await createBudget(workspace.id, {
        ...form,
        amount: Number(form.amount),
        year: Number(form.year),
        month: Number(form.month),
      });
      setForm((current) => ({ ...current, amount: '' }));
      setShowAddForm(false);
      await load();
    } catch (reason) {
      setError(reason);
    }
  };

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = Math.max(1, daysInMonth - now.getDate() + 1);

  // Compute aggregate stats across all budgets
  const budgetResults = budgets.map((b) => calculateBudget(b, transactions));
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);
  const totalActual = budgetResults.reduce((sum, r) => sum + r.actual, 0);
  const totalRemaining = totalBudget - totalActual;
  const overallUsedPct = totalBudget > 0 ? Math.min(100, Math.round((totalActual / totalBudget) * 100)) : 0;
  const totalDailySafe = Math.max(0, totalRemaining / remainingDays);

  return (
    <main className="page-content budgets-page">
      <header className="feature-header">
        <div className="feature-header-row">
          <div>
            <p className="eyebrow">Plan ahead</p>
            <h1>Budgets</h1>
            <p className="muted">Set monthly spending limits and see actuals from your source transactions.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm feature-create-toggle"
            onClick={() => setShowAddForm((v) => !v)}
            aria-expanded={showAddForm}
          >
            <IconPlus size={16} />
            <span>{showAddForm ? 'Close form' : 'New budget'}</span>
          </button>
        </div>
      </header>

      {workspaceLoading && <LoadingState label="Loading your workspace…" />}
      {workspaceError && <ErrorState message="Could not load your workspace." />}
      {error && <ErrorState message="Could not load budgets. Please try again." />}

      {!workspaceLoading && !workspaceError && (
        <>
          {/* Aggregate Budget Hero Bento */}
          {budgets.length > 0 && (
            <section className="budget-hero-bento" aria-label="Monthly budget summary">
              <div className="budget-hero-main">
                <div className="budget-hero-label-wrap">
                  <span className="budget-hero-icon-pill">
                    <IconBudgets size={18} />
                  </span>
                  <div>
                    <span className="budget-hero-eyebrow">Monthly Spending Cap</span>
                    <h2 className="budget-hero-total">{formatInr(totalBudget)}</h2>
                  </div>
                </div>
                <div className="budget-hero-progress-group">
                  <div className="budget-hero-progress-labels">
                    <span className="muted" style={{ fontSize: '0.8125rem' }}>
                      Spent: <strong style={{ color: 'var(--color-text)' }}>{formatInr(totalActual)}</strong> ({overallUsedPct}%)
                    </span>
                    <span className="muted" style={{ fontSize: '0.8125rem' }}>
                      Remaining: <strong style={{ color: totalRemaining >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>{formatInr(totalRemaining)}</strong>
                    </span>
                  </div>
                  <div className="feature-progress-track" aria-hidden="true" style={{ height: '0.65rem' }}>
                    <div
                      className={`feature-progress-fill ${totalRemaining < 0 ? 'budget-health-bar-overspent' : overallUsedPct > 80 ? 'budget-health-bar-warning' : 'budget-health-bar-healthy'}`}
                      style={{ width: `${Math.min(100, overallUsedPct)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="budget-hero-side">
                <div className="budget-hero-stat-card">
                  <span className="stat-label">Daily Safe Spend</span>
                  <strong className="stat-value">{formatInr(totalDailySafe)}</strong>
                  <span className="stat-subtext">for next {remainingDays} days</span>
                </div>
                <div className="budget-hero-stat-card">
                  <span className="stat-label">Active Categories</span>
                  <strong className="stat-value">{budgets.length}</strong>
                  <span className="stat-subtext">{budgets.length === 1 ? '1 budget tracked' : `${budgets.length} budgets tracked`}</span>
                </div>
              </div>
            </section>
          )}

          {/* Collapsible / Clean Creation Card */}
          {(showAddForm || budgets.length === 0) && (
            <div className="feature-form-card">
              <div className="feature-form-header">
                <h2>Create a monthly budget</h2>
                {budgets.length > 0 && (
                  <button
                    type="button"
                    className="feature-form-close-btn"
                    onClick={() => setShowAddForm(false)}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                )}
              </div>
              <form className="feature-form" onSubmit={save}>
                <label>
                  Monthly amount
                  <div className="input-with-adornment">
                    <span className="input-adornment-prefix">₹</span>
                    <input
                      required
                      min="1"
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="e.g. 15000"
                    />
                  </div>
                </label>

                <label>
                  Category (optional)
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Groceries (or leave blank for overall spend)"
                  />
                </label>

                <div className="quick-chip-container" style={{ margin: '0 0 var(--space-2)' }}>
                  {commonBudgetCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`quick-chip-btn ${form.category === cat ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, category: cat })}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button type="submit" className="btn btn-primary">Add budget</button>
              </form>
            </div>
          )}

          {loading ? (
            <LoadingState label="Loading budgets…" type="bento" />
          ) : budgets.length === 0 ? (
            <div className="feature-empty-state">
              <div className="feature-empty-icon">
                <IconBudgets size={32} />
              </div>
              <h3>No budgets yet</h3>
              <p className="muted">Add a monthly budget to cap your spending and track category health.</p>
            </div>
          ) : (
            <div className="feature-grid">
              {budgets.map((budget) => {
                const result = calculateBudget(budget, transactions);
                const dailyRemaining = Math.max(0, result.remaining / remainingDays);
                const progressWidth = Math.min(100, Math.max(0, result.percentageUsed));
                const catColor = categoryColors[budget.category] || 'var(--color-accent)';

                return (
                  <article className="feature-card budget-card" key={budget.id}>
                    <div className="feature-card-header">
                      <div className="budget-card-title-group">
                        <span
                          className="budget-category-squircle"
                          style={{
                            background: `linear-gradient(135deg, ${catColor}22 0%, ${catColor}11 100%)`,
                            borderColor: `${catColor}44`,
                            color: catColor,
                          }}
                        >
                          <IconSparkles size={16} />
                        </span>
                        <div>
                          <h2>{budget.category || 'Overall spending'}</h2>
                          <p className="muted" style={{ fontSize: '0.8125rem' }}>
                            {budget.year}-{String(budget.month).padStart(2, '0')}
                          </p>
                        </div>
                      </div>
                      {result.threshold === 'overspent' ? (
                        <span className="badge-alert">Overspent</span>
                      ) : result.threshold === 'warning' ? (
                        <span className="badge-warning">80%+ Used</span>
                      ) : (
                        <span className="badge-healthy">On Track</span>
                      )}
                    </div>

                    <div className="budget-amount-row">
                      <strong className="budget-actual-spend">
                        {formatInr(result.actual)}
                      </strong>
                      <span className="muted budget-target-spend">
                        of {formatInr(result.budget)}
                      </span>
                    </div>

                    <div className="feature-progress-track" aria-hidden="true">
                      <div
                        className={`feature-progress-fill budget-health-bar-${result.threshold}`}
                        style={{ width: `${progressWidth}%` }}
                      />
                    </div>

                    <p className={`status-${result.threshold} budget-status-line`}>
                      <span>{result.percentageUsed}% used</span>
                      <span>·</span>
                      <span>{formatInr(result.remaining)} remaining</span>
                    </p>

                    {result.remaining > 0 && (
                      <div className="budget-safe-spend-pill">
                        <span className="muted">Safe pace:</span>
                        <strong>{formatInr(dailyRemaining)} / day</strong>
                        <span className="muted">({remainingDays}d)</span>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}

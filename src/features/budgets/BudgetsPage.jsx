import { useCallback, useEffect, useState } from 'react';

import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { formatInr } from '../../lib/format/currency';
import { useWorkspace } from '../../hooks/useWorkspace';
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

export function BudgetsPage() {
  const { workspace, loading: workspaceLoading, error: workspaceError } = useWorkspace();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      await load();
    } catch (reason) {
      setError(reason);
    }
  };

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = Math.max(1, daysInMonth - now.getDate() + 1);

  return (
    <main className="page-content budgets-page">
      <header className="feature-header">
        <p className="eyebrow">Plan ahead</p>
        <h1>Budgets</h1>
        <p className="muted">Set monthly spending limits and see actuals from your source transactions.</p>
      </header>

      {workspaceLoading && <LoadingState label="Loading your workspace…" />}
      {workspaceError && <ErrorState message="Could not load your workspace." />}
      {error && <ErrorState message="Could not load budgets. Please try again." />}

      {!workspaceLoading && !workspaceError && (
        <>
          <div className="feature-form-card">
            <h2>Create a monthly budget</h2>
            <form className="feature-form" onSubmit={save}>
              <label>
                Monthly amount
                <input
                  required
                  min="1"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="e.g. 15000"
                />
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

          {loading ? (
            <LoadingState label="Loading budgets…" />
          ) : budgets.length === 0 ? (
            <p className="muted">No budgets yet. Add a monthly budget to get started.</p>
          ) : (
            <div className="feature-grid">
              {budgets.map((budget) => {
                const result = calculateBudget(budget, transactions);
                const dailyRemaining = Math.max(0, result.remaining / remainingDays);
                const progressWidth = Math.min(100, Math.max(0, result.percentageUsed));

                return (
                  <article className="feature-card" key={budget.id}>
                    <div className="feature-card-header">
                      <div>
                        <h2>{budget.category || 'Overall spending'}</h2>
                        <p className="muted" style={{ fontSize: '0.8125rem' }}>
                          {budget.year}-{String(budget.month).padStart(2, '0')}
                        </p>
                      </div>
                      {result.threshold === 'overspent' && (
                        <span className="badge-alert">Overspent</span>
                      )}
                    </div>

                    <strong>
                      {formatInr(result.actual)} of {formatInr(result.budget)}
                    </strong>

                    <div className="feature-progress-track" aria-hidden="true">
                      <div
                        className={`feature-progress-fill budget-health-bar-${result.threshold}`}
                        style={{ width: `${progressWidth}%` }}
                      />
                    </div>

                    <p className={`status-${result.threshold}`}>
                      {result.percentageUsed}% used · {formatInr(result.remaining)} remaining
                    </p>

                    {result.remaining > 0 && (
                      <p className="muted" style={{ fontSize: '0.8125rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                        💡 <strong>{formatInr(dailyRemaining)} / day</strong> safe spending for next {remainingDays} days
                      </p>
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

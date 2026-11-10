import { useCallback, useEffect, useState } from 'react';

import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { formatInr } from '../../lib/format/currency';
import { useWorkspace } from '../../hooks/useWorkspace';
import { addContribution, createGoal, listContributions, listGoals } from './goalRepository';
import { calculateGoalProgress, validateGoal } from './goalCalculations';
import '../budgets-goals-reports/features.css';

export function GoalsPage() {
  const { workspace, loading: workspaceLoading, error: workspaceError } = useWorkspace();
  const [goals, setGoals] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '' });
  const [contribution, setContribution] = useState({ goalId: '', amount: '' });

  const load = useCallback(async () => {
    if (!workspace?.id) return;
    setLoading(true);
    setError(null);
    try {
      const nextGoals = await listGoals(workspace.id);
      setGoals(nextGoals);
      setContributions(await listContributions(workspace.id));
    } catch (reason) {
      setError(reason);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  useEffect(() => { load(); }, [load]);

  const saveGoal = async (event) => {
    event.preventDefault();
    const input = { ...form, targetAmount: Number(form.targetAmount) };
    const result = validateGoal(input);
    if (!result.valid) {
      setError(new Error(Object.values(result.errors).join(' ')));
      return;
    }
    try {
      await createGoal(workspace.id, input);
      setForm({ name: '', targetAmount: '', deadline: '' });
      await load();
    } catch (reason) {
      setError(reason);
    }
  };

  const saveContribution = async (event) => {
    event.preventDefault();
    if (!contribution.goalId || Number(contribution.amount) <= 0) return;
    try {
      await addContribution(workspace.id, contribution.goalId, {
        amount: Number(contribution.amount),
        date: new Date().toISOString().slice(0, 10),
      });
      setContribution({ goalId: '', amount: '' });
      await load();
    } catch (reason) {
      setError(reason);
    }
  };

  const quickContribute = async (goalId, amount) => {
    try {
      await addContribution(workspace.id, goalId, {
        amount,
        date: new Date().toISOString().slice(0, 10),
      });
      await load();
    } catch (reason) {
      setError(reason);
    }
  };

  return (
    <main className="page-content goals-page">
      <header className="feature-header">
        <p className="eyebrow">Build your future</p>
        <h1>Savings goals</h1>
        <p className="muted">Track meaningful targets with explicit contribution records.</p>
      </header>

      {workspaceLoading && <LoadingState label="Loading your workspace…" />}
      {workspaceError && <ErrorState message="Could not load your workspace." />}
      {error && <ErrorState message={error.message || 'Could not load goals.'} />}

      {!workspaceLoading && !workspaceError && (
        <>
          <div className="feature-form-card">
            <h2>Create a new goal</h2>
            <form className="feature-form" onSubmit={saveGoal}>
              <label>
                Goal name
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Emergency Fund, New Laptop, Vacation"
                />
              </label>

              <label>
                Target amount
                <input
                  required
                  min="1"
                  type="number"
                  value={form.targetAmount}
                  onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                  placeholder="e.g. 50000"
                />
              </label>

              <label>
                Deadline
                <input
                  required
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </label>

              <button type="submit" className="btn btn-primary">Create goal</button>
            </form>
          </div>

          {loading ? (
            <LoadingState label="Loading goals…" />
          ) : goals.length === 0 ? (
            <p className="muted">No savings goals yet.</p>
          ) : (
            <div className="feature-grid">
              {goals.map((goal) => {
                const progress = calculateGoalProgress(
                  goal,
                  contributions.filter((item) => item.goalId === goal.id),
                );

                // Calculate months / days to deadline
                const deadlineDate = goal.deadline ? new Date(goal.deadline) : null;
                const daysToDeadline = deadlineDate
                  ? Math.max(1, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                  : null;
                const monthsToDeadline = daysToDeadline ? Math.max(1, Math.round(daysToDeadline / 30)) : 1;
                const monthlyRequired = progress.remaining > 0 ? progress.remaining / monthsToDeadline : 0;

                return (
                  <article className="feature-card" key={goal.id}>
                    <div className="feature-card-header">
                      <div>
                        <h2>{goal.name}</h2>
                        {goal.deadline && (
                          <p className="muted" style={{ fontSize: '0.8125rem' }}>
                            Target: {goal.deadline} ({daysToDeadline} days left)
                          </p>
                        )}
                      </div>
                      {progress.completed && (
                        <span className="badge-income" style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                          Achieved! 🎉
                        </span>
                      )}
                    </div>

                    <p>
                      {formatInr(progress.contributed)} of {formatInr(goal.targetAmount)} · {progress.percentage}%
                    </p>

                    <progress
                      max="100"
                      value={progress.percentage}
                      aria-label={`${goal.name} progress`}
                    />

                    <p style={{ fontWeight: 600 }}>
                      {progress.completed ? 'Goal complete' : `${formatInr(progress.remaining)} remaining`}
                    </p>

                    {!progress.completed && monthlyRequired > 0 && (
                      <p className="muted" style={{ fontSize: '0.8125rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem' }}>
                        💡 Save <strong>{formatInr(monthlyRequired)}/month</strong> to reach goal on time
                      </p>
                    )}

                    {!progress.completed && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => quickContribute(goal.id, 500)}
                        >
                          +₹500
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => quickContribute(goal.id, 1000)}
                        >
                          +₹1,000
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setContribution({ goalId: goal.id, amount: '' })}
                        >
                          Custom
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {goals.length > 0 && (
            <div className="feature-form-card" style={{ marginTop: '2rem' }}>
              <form className="feature-form" onSubmit={saveContribution}>
                <h2>Add contribution</h2>
                <label>
                  Goal
                  <select
                    required
                    value={contribution.goalId}
                    onChange={(e) => setContribution({ ...contribution, goalId: e.target.value })}
                  >
                    <option value="">Select a goal</option>
                    {goals.map((goal) => (
                      <option value={goal.id} key={goal.id}>
                        {goal.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Amount
                  <input
                    required
                    min="1"
                    type="number"
                    value={contribution.amount}
                    onChange={(e) => setContribution({ ...contribution, amount: e.target.value })}
                    placeholder="e.g. 2500"
                  />
                </label>

                <button type="submit" className="btn btn-primary">Record contribution</button>
              </form>
            </div>
          )}
        </>
      )}
    </main>
  );
}

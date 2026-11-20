import { useCallback, useEffect, useState } from 'react';

import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { formatInr } from '../../lib/format/currency';
import { useWorkspace } from '../../hooks/useWorkspace';
import { IconCheckCircle, IconPlus, IconSparkles, IconTarget } from '../../components/icons/Icons';
import { addContribution, createGoal, listContributions, listGoals } from './goalRepository';
import { calculateGoalProgress, validateGoal } from './goalCalculations';
import '../budgets-goals-reports/features.css';

export function GoalsPage() {
  const { workspace, loading: workspaceLoading, error: workspaceError } = useWorkspace();
  const [goals, setGoals] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
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
      setShowAddForm(false);
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

  // Compute aggregate stats across all goals
  const goalProgresses = goals.map((goal) => ({
    goal,
    progress: calculateGoalProgress(
      goal,
      contributions.filter((item) => item.goalId === goal.id),
    ),
  }));
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount || 0), 0);
  const totalContributed = goalProgresses.reduce((sum, item) => sum + item.progress.contributed, 0);
  const totalRemaining = Math.max(0, totalTarget - totalContributed);
  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalContributed / totalTarget) * 100)) : 0;
  const completedCount = goalProgresses.filter((item) => item.progress.completed).length;

  return (
    <main className="page-content goals-page">
      <header className="feature-header">
        <div className="feature-header-row">
          <div>
            <p className="eyebrow">Build your future</p>
            <h1>Savings goals</h1>
            <p className="muted">Track meaningful targets with explicit contribution records.</p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm feature-create-toggle"
            onClick={() => setShowAddForm((v) => !v)}
            aria-expanded={showAddForm}
          >
            <IconPlus size={16} />
            <span>{showAddForm ? 'Close form' : 'New goal'}</span>
          </button>
        </div>
      </header>

      {workspaceLoading && <LoadingState label="Loading your workspace…" />}
      {workspaceError && <ErrorState message="Could not load your workspace." />}
      {error && <ErrorState message={error.message || 'Could not load goals.'} />}

      {!workspaceLoading && !workspaceError && (
        <>
          {/* Aggregate Goals Hero Bento */}
          {goals.length > 0 && (
            <section className="budget-hero-bento goal-hero-bento" aria-label="Savings goals summary">
              <div className="budget-hero-main">
                <div className="budget-hero-label-wrap">
                  <span className="budget-hero-icon-pill goal-icon-pill">
                    <IconTarget size={18} />
                  </span>
                  <div>
                    <span className="budget-hero-eyebrow">Total Target Capital</span>
                    <h2 className="budget-hero-total">{formatInr(totalTarget)}</h2>
                  </div>
                </div>
                <div className="budget-hero-progress-group">
                  <div className="budget-hero-progress-labels">
                    <span className="muted" style={{ fontSize: '0.8125rem' }}>
                      Accumulated: <strong style={{ color: 'var(--color-income)' }}>{formatInr(totalContributed)}</strong> ({overallPct}%)
                    </span>
                    <span className="muted" style={{ fontSize: '0.8125rem' }}>
                      To Go: <strong style={{ color: 'var(--color-text)' }}>{formatInr(totalRemaining)}</strong>
                    </span>
                  </div>
                  <div className="feature-progress-track" aria-hidden="true" style={{ height: '0.65rem' }}>
                    <div
                      className="feature-progress-fill budget-health-bar-healthy"
                      style={{ width: `${overallPct}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="budget-hero-side">
                <div className="budget-hero-stat-card">
                  <span className="stat-label">Milestones Reached</span>
                  <strong className="stat-value" style={{ color: 'var(--color-income)' }}>{completedCount} / {goals.length}</strong>
                  <span className="stat-subtext">{completedCount === goals.length && goals.length > 0 ? 'All goals completed!' : `${goals.length - completedCount} in progress`}</span>
                </div>
                <div className="budget-hero-stat-card">
                  <span className="stat-label">Average Progress</span>
                  <strong className="stat-value">{overallPct}%</strong>
                  <span className="stat-subtext">across active plans</span>
                </div>
              </div>
            </section>
          )}

          {/* Collapsible / Clean Creation Card */}
          {(showAddForm || goals.length === 0) && (
            <div className="feature-form-card">
              <div className="feature-form-header">
                <h2>Create a new goal</h2>
                {goals.length > 0 && (
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
                  <div className="input-with-adornment">
                    <span className="input-adornment-prefix">₹</span>
                    <input
                      required
                      min="1"
                      type="number"
                      value={form.targetAmount}
                      onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                      placeholder="e.g. 50000"
                    />
                  </div>
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
          )}

          {loading ? (
            <LoadingState label="Loading goals…" type="bento" />
          ) : goals.length === 0 ? (
            <div className="feature-empty-state">
              <div className="feature-empty-icon goal-empty-icon">
                <IconTarget size={32} />
              </div>
              <h3>No savings goals yet</h3>
              <p className="muted">Create targets for emergency funds, vacations, or gear to track dedicated savings.</p>
            </div>
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
                  <article className={`feature-card goal-card ${progress.completed ? 'goal-card-achieved' : ''}`} key={goal.id}>
                    <div className="feature-card-header">
                      <div className="budget-card-title-group">
                        <span className={`budget-category-squircle ${progress.completed ? 'goal-squircle-done' : 'goal-squircle-active'}`}>
                          {progress.completed ? <IconCheckCircle size={18} /> : <IconTarget size={18} />}
                        </span>
                        <div>
                          <h2>{goal.name}</h2>
                          {goal.deadline && (
                            <p className="muted" style={{ fontSize: '0.8125rem' }}>
                              Target: {goal.deadline} ({daysToDeadline} days left)
                            </p>
                          )}
                        </div>
                      </div>
                      {progress.completed && (
                        <span className="badge-income" style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                          Achieved
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
                        Required pace: <strong>{formatInr(monthlyRequired)}/month</strong> to reach target
                      </p>
                    )}

                    {!progress.completed && (
                      <div className="goal-quick-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm goal-chip-btn"
                          onClick={() => quickContribute(goal.id, 500)}
                        >
                          +₹500
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm goal-chip-btn"
                          onClick={() => quickContribute(goal.id, 1000)}
                        >
                          +₹1,000
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm goal-chip-btn"
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
            <div className="feature-form-card goal-contribution-card" style={{ marginTop: '2rem' }}>
              <div className="feature-form-header">
                <h2>Add contribution</h2>
                <span className="muted" style={{ fontSize: '0.8125rem' }}>Direct deposit towards goal</span>
              </div>
              <form className="feature-form" onSubmit={saveContribution}>
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
                        {goal.name} ({goal.targetAmount ? formatInr(goal.targetAmount) : ''})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Amount
                  <div className="input-with-adornment">
                    <span className="input-adornment-prefix">₹</span>
                    <input
                      required
                      min="1"
                      type="number"
                      value={contribution.amount}
                      onChange={(e) => setContribution({ ...contribution, amount: e.target.value })}
                      placeholder="e.g. 2500"
                    />
                  </div>
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

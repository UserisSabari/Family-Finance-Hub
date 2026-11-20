import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { IconCheckCircle, IconShield } from '../../components/icons/Icons';
import './auth.css';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!form.email.trim() || !form.password || !form.confirm) {
      setError('Email and password are required.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords must match.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await register(form.email.trim(), form.password);
      navigate('/app');
    } catch (reason) {
      setError(reason?.code === 'auth/email-already-in-use'
        ? 'An account already exists for this email.'
        : 'Unable to create your account. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-split-wrapper">
        {/* Left Visual Brand Panel (Visible on Desktop) */}
        <section className="auth-brand-panel" aria-hidden="true">
          <div className="auth-brand-badge">
            <IconShield size={16} />
            <span>Join Family Finance Hub</span>
          </div>

          <h2 className="auth-brand-heading">
            Take total control of your household capital today.
          </h2>

          <p className="auth-brand-subheading">
            Join thousands of individuals and families tracking daily liquidity, planning budgets, and smashing savings goals.
          </p>

          <div className="auth-brand-perks">
            <div className="auth-perk-item">
              <IconCheckCircle size={18} className="auth-perk-icon" />
              <span>Real-time category spending limits & daily burn pace</span>
            </div>
            <div className="auth-perk-item">
              <IconCheckCircle size={18} className="auth-perk-icon" />
              <span>Multi-member family workspaces with role delegation</span>
            </div>
            <div className="auth-perk-item">
              <IconCheckCircle size={18} className="auth-perk-icon" />
              <span>Interactive visual cashflow analytics and monthly reports</span>
            </div>
          </div>
        </section>

        {/* Right Auth Card */}
        <section className="auth-card" aria-labelledby="register-title">
          <div className="auth-card-header">
            <p className="eyebrow">Family Finance Hub</p>
            <h1 id="register-title">Create your account</h1>
            <p className="muted" style={{ margin: 0 }}>Start fresh with a secure personal ledger.</p>
          </div>

          <form className="auth-form" onSubmit={submit} noValidate>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="name@example.com"
            />
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="At least 6 characters"
            />
            <label htmlFor="register-confirm">Confirm password</label>
            <input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={(event) => setForm({ ...form, confirm: event.target.value })}
              placeholder="Repeat your password"
            />
            <button type="submit" disabled={busy}>
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="auth-footer-links">
            <p>Already registered? <Link to="/login">Sign in</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}

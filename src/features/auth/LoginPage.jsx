import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { IconCheckCircle, IconGoogle, IconShield, IconSparkles } from '../../components/icons/Icons';
import './auth.css';

const messages = {
  'auth/invalid-credential': 'Your email or password is incorrect.',
  'auth/user-not-found': 'Your email or password is incorrect.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
};

function readableError(error) {
  return messages[error?.code] || 'Unable to sign in. Please try again.';
}

export function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await signIn(form.email.trim(), form.password);
      navigate('/app');
    } catch (reason) {
      setError(readableError(reason));
    } finally {
      setBusy(false);
    }
  }

  async function googleSignIn() {
    setError('');
    try {
      await signInWithGoogle();
      navigate('/app');
    } catch (reason) {
      setError(readableError(reason));
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-split-wrapper">
        {/* Left Visual Brand Panel (Visible on Desktop) */}
        <section className="auth-brand-panel" aria-hidden="true">
          <div className="auth-brand-badge">
            <IconShield size={16} />
            <span>Bank-Grade Private Ledger</span>
          </div>

          <h2 className="auth-brand-heading">
            Your family’s entire financial life, in one private space.
          </h2>

          <p className="auth-brand-subheading">
            Manage personal wealth, family expenses, and group splits seamlessly with real-time liquidity and cash tracking.
          </p>

          <div className="auth-brand-perks">
            <div className="auth-perk-item">
              <IconCheckCircle size={18} className="auth-perk-icon" />
              <span>Multi-workspace isolation: private & family ledgers</span>
            </div>
            <div className="auth-perk-item">
              <IconCheckCircle size={18} className="auth-perk-icon" />
              <span>Split bills, pass-throughs, and daily spend pace</span>
            </div>
            <div className="auth-perk-item">
              <IconCheckCircle size={18} className="auth-perk-icon" />
              <span>Strict INR currency & local timezone precision</span>
            </div>
          </div>

          {/* Mini Interactive Preview Card */}
          <div className="auth-preview-bento">
            <div className="auth-preview-header">
              <span className="auth-preview-dot" />
              <span>Total Liquid Capital</span>
            </div>
            <div className="auth-preview-amount">₹1,45,280</div>
            <div className="auth-preview-pills">
              <span className="auth-pill-bank">Bank: ₹1,12,450</span>
              <span className="auth-pill-cash">Cash: ₹32,830</span>
            </div>
          </div>
        </section>

        {/* Right Auth Card */}
        <section className="auth-card" aria-labelledby="login-title">
          <div className="auth-card-header">
            <p className="eyebrow">Family Finance Hub</p>
            <h1 id="login-title">Sign in</h1>
            <p className="muted" style={{ margin: 0 }}>Access your personal finance workspace.</p>
          </div>

          <form className="auth-form" onSubmit={submit} noValidate>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="name@example.com"
            />
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="••••••••"
            />
            <button type="submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button className="auth-secondary" type="button" onClick={googleSignIn}>
            <IconGoogle size={18} />
            <span>Continue with Google</span>
          </button>

          <div className="auth-footer-links">
            <p><Link to="/forgot-password">Forgot password?</Link></p>
            <p>New here? <Link to="/register">Create an account</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}

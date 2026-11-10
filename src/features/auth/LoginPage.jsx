import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
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
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow">Family Finance Hub</p>
        <h1 id="login-title">Sign in</h1>
        <p>Access your personal finance workspace.</p>
        <form className="auth-form" onSubmit={submit} noValidate>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" autoComplete="email" value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" autoComplete="current-password" value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <button className="auth-secondary" type="button" onClick={googleSignIn}>Continue with Google</button>
        <p><Link to="/forgot-password">Forgot password?</Link></p>
        <p>New here? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  );
}

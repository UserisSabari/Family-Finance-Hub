import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
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
      <section className="auth-card" aria-labelledby="register-title">
        <p className="eyebrow">Family Finance Hub</p>
        <h1 id="register-title">Create your account</h1>
        <form className="auth-form" onSubmit={submit} noValidate>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <label htmlFor="register-email">Email</label>
          <input id="register-email" type="email" autoComplete="email" value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <label htmlFor="register-password">Password</label>
          <input id="register-password" type="password" autoComplete="new-password" value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })} />
          <label htmlFor="register-confirm">Confirm password</label>
          <input id="register-confirm" type="password" autoComplete="new-password" value={form.confirm}
            onChange={(event) => setForm({ ...form, confirm: event.target.value })} />
          <button type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p>Already registered? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import './auth.css';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    setError('');
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      setError('Unable to send a reset link. Check the email and try again.');
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="forgot-title">
        <p className="eyebrow">Family Finance Hub</p>
        <h1 id="forgot-title">Reset your password</h1>
        {sent ? <p role="status">Check your email for a password reset link.</p> : (
          <form className="auth-form" onSubmit={submit} noValidate>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <label htmlFor="reset-email">Email</label>
            <input id="reset-email" type="email" autoComplete="email" value={email}
              onChange={(event) => setEmail(event.target.value)} />
            <button type="submit">Send reset link</button>
          </form>
        )}
        <p><Link to="/login">Back to sign in</Link></p>
      </section>
    </main>
  );
}

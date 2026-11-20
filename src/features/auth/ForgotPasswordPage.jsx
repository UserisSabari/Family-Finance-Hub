import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { IconMail } from '../../components/icons/Icons';
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
      <div className="auth-split-wrapper" style={{ maxWidth: '32rem' }}>
        <section className="auth-card" aria-labelledby="forgot-title" style={{ width: '100%' }}>
          <div className="auth-card-header">
            <p className="eyebrow">Family Finance Hub</p>
            <h1 id="forgot-title">Reset your password</h1>
            <p className="muted" style={{ margin: 0 }}>Enter your registered email and we’ll send a secure password reset link.</p>
          </div>

          {sent ? (
            <div className="auth-success-bento" style={{ marginTop: 'var(--space-5)' }}>
              <div className="auth-success-icon">
                <IconMail size={24} />
              </div>
              <p role="status" style={{ fontWeight: 600, margin: '0 0 var(--space-2)' }}>
                Check your email for a password reset link.
              </p>
              <p className="muted" style={{ fontSize: '0.8125rem', margin: 0 }}>
                If an account exists for {email}, instructions to reset your password have been dispatched.
              </p>
            </div>
          ) : (
            <form className="auth-form" onSubmit={submit} noValidate>
              {error && <div className="auth-error" role="alert">{error}</div>}
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
              <button type="submit">Send reset link</button>
            </form>
          )}

          <div className="auth-footer-links">
            <p><Link to="/login">Back to sign in</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}

import { useState } from 'react';
import { IconMail } from '../../components/icons/Icons';

export function InviteMemberDialog({ onSubmit, onCancel, submitting = false }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    setError('');
    try {
      await onSubmit({ email: email.trim(), role });
    } catch (reason) {
      setError(reason.message || 'Could not send invitation.');
    }
  }

  return (
    <div className="family-dialog-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="family-dialog bottom-sheet-drawer" role="dialog" aria-modal="true" aria-labelledby="invite-title">
        <div className="drawer-handle-bar" aria-hidden="true" />
        <div className="dialog-header-row">
          <div className="dialog-title-group">
            <span className="dialog-icon-pill">
              <IconMail size={18} />
            </span>
            <div>
              <h2 id="invite-title" style={{ margin: 0 }}>Invite a member</h2>
              <p className="muted" style={{ margin: 0, fontSize: '0.8125rem' }}>Send an invite link to collaborate.</p>
            </div>
          </div>
          <button type="button" className="dialog-close-btn" onClick={onCancel} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="auth-form" style={{ marginTop: 'var(--space-4)' }}>
          <label htmlFor="invite-email">
            Email address
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="e.g. partner@example.com"
              required
            />
          </label>

          <label htmlFor="invite-role">
            Assigned role
            <select id="invite-role" value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="member">Member — View & add transactions</option>
              <option value="admin">Admin — Manage members & categories</option>
            </select>
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <div className="dialog-action-buttons">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send invitation'}
            </button>
            <button type="button" className="btn btn-secondary auth-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';

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
    <div className="family-dialog" role="dialog" aria-modal="true" aria-labelledby="invite-title">
      <h2 id="invite-title">Invite a member</h2>
      <form onSubmit={submit} className="auth-form">
        <label htmlFor="invite-email">Email</label>
        <input id="invite-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label htmlFor="invite-role">Role</label>
        <select id="invite-role" value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send invitation'}</button>
        <button type="button" className="auth-secondary" onClick={onCancel}>Cancel</button>
      </form>
    </div>
  );
}

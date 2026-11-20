import { useCallback, useEffect, useState } from 'react';

import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useWorkspace } from '../../hooks/useWorkspace';
import { IconCrown, IconFamily, IconMail, IconPlus, IconShield, IconUser } from '../../components/icons/Icons';
import {
  changeMemberRole,
  createFamilyWorkspace,
  createInvitation,
  listMembers,
  listPendingInvitations,
  resendInvitation,
  revokeInvitation,
} from './familyRepository';
import { InviteMemberDialog } from './InviteMemberDialog';
import './family.css';

export function FamilyPage() {
  const { workspace, workspaces = [], selectWorkspace, loading: workspaceLoading, error: workspaceError, refresh } = useWorkspace();
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [notice, setNotice] = useState('');
  const [newWorkspace, setNewWorkspace] = useState('');

  const load = useCallback(async () => {
    if (!workspace?.id || workspace.kind !== 'family') return;
    setLoading(true);
    setError(null);
    try {
      const [nextMembers, nextInvitations] = await Promise.all([
        listMembers(workspace.id),
        listPendingInvitations(workspace.id),
      ]);
      setMembers(nextMembers);
      setInvitations(nextInvitations);
    } catch (reason) {
      setError(reason);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id, workspace?.kind]);

  useEffect(() => { load(); }, [load]);

  async function invite(input) {
    await createInvitation({ workspaceId: workspace.id, ...input });
    setShowInvite(false);
    setNotice('Invitation sent.');
    await load();
  }

  async function createWorkspace(event) {
    event.preventDefault();
    try {
      const created = await createFamilyWorkspace(newWorkspace);
      setNewWorkspace('');
      await refresh?.();
      selectWorkspace?.(created.id);
      setNotice('Family workspace created.');
    } catch (reason) {
      setError(reason);
    }
  }

  async function updateRole(uid, role) {
    await changeMemberRole({ workspaceId: workspace.id, uid, role });
    await load();
  }

  const canInvite = workspace?.role === 'owner' || workspace?.role === 'admin';

  return (
    <main className="page-content family-page">
      <header className="family-header">
        <div>
          <p className="eyebrow">Shared workspace</p>
          <h1>Family workspace</h1>
          <p className="muted">Share records with clear, role-based access.</p>
        </div>
        {canInvite && (
          <button
            type="button"
            className="btn btn-primary btn-sm feature-create-toggle"
            onClick={() => setShowInvite(true)}
          >
            <IconPlus size={16} />
            <span>Invite member</span>
          </button>
        )}
      </header>

      {workspaceLoading && <LoadingState label="Loading family workspaces…" type="bento" />}
      {workspaceError && <ErrorState message="Could not load your workspaces." />}
      {notice && <p role="status" className="feedback feedback-success">{notice}</p>}

      {/* Workspace Switcher */}
      {workspaces.length > 0 && (
        <div className="family-workspace-bar">
          <label className="workspace-picker">
            <span className="picker-label">Active workspace</span>
            <div className="picker-select-wrap">
              <IconFamily size={16} className="picker-icon" />
              <select
                value={workspace?.id || ''}
                onChange={(event) => selectWorkspace?.(event.target.value)}
              >
                {workspaces.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.kind === 'family' ? 'Family' : 'Personal'})
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>
      )}

      {/* When not in a family workspace */}
      {workspace?.kind !== 'family' && (
        <section className="family-card family-create-card">
          <div className="family-create-hero">
            <div className="family-create-icon-pill">
              <IconFamily size={24} />
            </div>
            <div>
              <h2>Create a family workspace</h2>
              <p className="muted">Bring partners or household members into one collaborative ledger with custom roles.</p>
            </div>
          </div>
          <form onSubmit={createWorkspace} className="auth-form" style={{ maxWidth: '28rem', marginTop: 'var(--space-4)' }}>
            <label>
              Workspace name
              <input
                aria-label="Family workspace name"
                value={newWorkspace}
                onChange={(event) => setNewWorkspace(event.target.value)}
                placeholder="e.g. Smith family"
                required
              />
            </label>
            <button type="submit" className="btn btn-primary">Create workspace</button>
          </form>
        </section>
      )}

      {/* When in a family workspace */}
      {workspace?.kind === 'family' && (
        <section className="family-card">
          <div className="family-workspace-hero">
            <div className="family-hero-info">
              <span className="family-hero-icon-pill">
                <IconFamily size={22} />
              </span>
              <div>
                <h2>{workspace.name}</h2>
                <div className="family-role-badge-row">
                  <span className="muted" style={{ fontSize: '0.8125rem' }}>Your role:</span>
                  <span className={`family-role-pill role-${workspace.role}`}>
                    {workspace.role === 'owner' && <IconCrown size={12} />}
                    <span>{workspace.role}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="family-hero-meta">
              <div className="family-meta-stat">
                <span className="stat-num">{members.length}</span>
                <span className="stat-desc">Members</span>
              </div>
              <div className="family-meta-stat">
                <span className="stat-num">{invitations.length}</span>
                <span className="stat-desc">Pending</span>
              </div>
            </div>
          </div>

          {loading && <LoadingState label="Loading members…" type="bento" />}
          {error && <ErrorState message="Could not load family members." />}

          {!loading && !error && (
            <>
              <div className="family-section-divider">
                <h3>Members</h3>
                <span className="muted" style={{ fontSize: '0.75rem' }}>{members.length} active</span>
              </div>

              <ul className="family-list">
                {members.map((member) => (
                  <li key={member.id} className="family-member-item">
                    <div className="family-member-info">
                      <div className="family-avatar-circle">
                        {member.role === 'owner' ? <IconCrown size={16} /> : <IconUser size={16} />}
                      </div>
                      <div className="family-member-text">
                        <span className="family-member-name">{member.user}</span>
                        <span className="family-status-dot-wrap">
                          <span className="family-pulse-dot" />
                          <span className="family-status-text">Active</span>
                        </span>
                      </div>
                    </div>
                    <div className="family-member-controls">
                      <select
                        aria-label={`Role for ${member.user}`}
                        value={member.role}
                        disabled={workspace.role !== 'owner' || member.role === 'owner'}
                        onChange={(event) => updateRole(member.user, event.target.value)}
                        className="family-role-select"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="family-section-divider" style={{ marginTop: 'var(--space-6)' }}>
                <h3>Pending invitations</h3>
                <span className="muted" style={{ fontSize: '0.75rem' }}>{invitations.length} pending</span>
              </div>

              {invitations.length === 0 ? (
                <div className="family-empty-invites">
                  <p className="muted">No pending invitations.</p>
                </div>
              ) : (
                <ul className="family-list">
                  {invitations.map((invitation) => (
                    <li key={invitation.id} className="family-invite-item">
                      <div className="family-invite-info">
                        <div className="family-invite-icon">
                          <IconMail size={16} />
                        </div>
                        <div>
                          <span className="family-invite-email">{invitation.email}</span>
                          <span className="family-invite-role">Role: {invitation.role}</span>
                        </div>
                      </div>
                      {canInvite && (
                        <div className="family-invite-actions">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => resendInvitation(invitation.id)}
                          >
                            Resend
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger-subtle btn-sm"
                            onClick={() => revokeInvitation(invitation.id)}
                          >
                            Revoke
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      )}

      {showInvite && <InviteMemberDialog onSubmit={invite} onCancel={() => setShowInvite(false)} />}
    </main>
  );
}

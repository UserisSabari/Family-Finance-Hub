import { useCallback, useEffect, useState } from 'react';

import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useWorkspace } from '../../hooks/useWorkspace';
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
        <div><p className="eyebrow">Shared workspace</p><h1>Family workspace</h1><p>Share records with clear, role-based access.</p></div>
        {canInvite && <button type="button" onClick={() => setShowInvite(true)}>Invite member</button>}
      </header>
      {workspaceLoading && <LoadingState label="Loading family workspaces…" />}
      {workspaceError && <ErrorState message="Could not load your workspaces." />}
      {notice && <p role="status" className="feedback feedback-success">{notice}</p>}
      {workspaces.length > 0 && <label className="workspace-picker">Active workspace<select value={workspace?.id || ''} onChange={(event) => selectWorkspace?.(event.target.value)}>{workspaces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
      {workspace?.kind !== 'family' && <section className="family-card"><h2>Create a family workspace</h2><form onSubmit={createWorkspace} className="auth-form"><input aria-label="Family workspace name" value={newWorkspace} onChange={(event) => setNewWorkspace(event.target.value)} placeholder="e.g. Smith family" required /><button type="submit">Create workspace</button></form></section>}
      {workspace?.kind === 'family' && <section className="family-card"><h2>{workspace.name}</h2><p className="muted">Your role: {workspace.role}</p>{loading && <LoadingState label="Loading members…" />}{error && <ErrorState message="Could not load family members." />}{!loading && !error && <><h3>Members</h3><ul className="family-list">{members.map((member) => <li key={member.id}><span>{member.user}</span><select aria-label={`Role for ${member.user}`} value={member.role} disabled={workspace.role !== 'owner' || member.role === 'owner'} onChange={(event) => updateRole(member.user, event.target.value)}><option value="owner">Owner</option><option value="admin">Admin</option><option value="member">Member</option></select></li>)}</ul><h3>Pending invitations</h3>{invitations.length === 0 ? <p className="muted">No pending invitations.</p> : <ul className="family-list">{invitations.map((invitation) => <li key={invitation.id}><span>{invitation.email} ({invitation.role})</span>{canInvite && <span><button type="button" onClick={() => resendInvitation(invitation.id)}>Resend</button><button type="button" onClick={() => revokeInvitation(invitation.id)}>Revoke</button></span>}</li>)}</ul>}</>}</section>}
      {showInvite && <InviteMemberDialog onSubmit={invite} onCancel={() => setShowInvite(false)} />}
    </main>
  );
}

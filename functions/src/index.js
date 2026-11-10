import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

import {
  canManageInvitations,
  canManageMembership,
  getInvitationExpiry,
  isInvitationEmailMatch,
  isInvitationExpired,
} from './invitations.js';

initializeApp();
const db = getFirestore();

const memberRef = (workspaceId, uid) => db.collection('workspaceMembers').doc(`${workspaceId}_${uid}`);

async function requireUser(request) {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Authentication is required.');
  return request.auth;
}

async function getMembership(workspaceId, uid) {
  const snapshot = await memberRef(workspaceId, uid).get();
  return snapshot.exists ? snapshot.data() : null;
}

async function requireRole(workspaceId, uid, predicate, message) {
  const membership = await getMembership(workspaceId, uid);
  if (!membership || membership.status !== 'active' || !predicate(membership.role)) {
    throw new HttpsError('permission-denied', message);
  }
  return membership;
}

function requireWorkspaceId(data) {
  if (!data?.workspaceId || typeof data.workspaceId !== 'string') {
    throw new HttpsError('invalid-argument', 'A workspace is required.');
  }
  return data.workspaceId;
}

function requireEmail(email) {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new HttpsError('invalid-argument', 'A valid invitation email is required.');
  }
  return email.trim().toLowerCase();
}

export const createInvitation = onCall(async (request) => {
  const auth = await requireUser(request);
  const workspaceId = requireWorkspaceId(request.data);
  await requireRole(workspaceId, auth.uid, canManageInvitations, 'Only owners and admins can invite members.');
  const email = requireEmail(request.data.email);
  const role = request.data.role || 'member';
  if (!['admin', 'member'].includes(role)) {
    throw new HttpsError('invalid-argument', 'Invitations may only grant admin or member roles.');
  }

  const existing = await db.collection('invitations')
    .where('workspace', '==', workspaceId)
    .where('email', '==', email)
    .where('status', '==', 'pending')
    .limit(1)
    .get();
  if (!existing.empty) return { invitationId: existing.docs[0].id, reused: true };

  const now = new Date();
  const invitation = await db.collection('invitations').add({
    workspace: workspaceId,
    email,
    role,
    status: 'pending',
    invitedBy: auth.uid,
    createdAt: Timestamp.fromDate(now),
    expiresAt: Timestamp.fromDate(getInvitationExpiry(now)),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { invitationId: invitation.id };
});

export const resendInvitation = onCall(async (request) => {
  const auth = await requireUser(request);
  const invitationId = request.data?.invitationId;
  if (!invitationId) throw new HttpsError('invalid-argument', 'An invitation is required.');
  const invitationRef = db.collection('invitations').doc(invitationId);
  const snapshot = await invitationRef.get();
  if (!snapshot.exists) throw new HttpsError('not-found', 'Invitation not found.');
  const invitation = snapshot.data();
  await requireRole(invitation.workspace, auth.uid, canManageInvitations, 'Only owners and admins can resend invitations.');
  if (invitation.status !== 'pending') throw new HttpsError('failed-precondition', 'Only pending invitations can be resent.');
  const now = new Date();
  await invitationRef.update({
    expiresAt: Timestamp.fromDate(getInvitationExpiry(now)),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { invitationId };
});

export const revokeInvitation = onCall(async (request) => {
  const auth = await requireUser(request);
  const invitationId = request.data?.invitationId;
  if (!invitationId) throw new HttpsError('invalid-argument', 'An invitation is required.');
  const invitationRef = db.collection('invitations').doc(invitationId);
  const snapshot = await invitationRef.get();
  if (!snapshot.exists) throw new HttpsError('not-found', 'Invitation not found.');
  const invitation = snapshot.data();
  await requireRole(invitation.workspace, auth.uid, canManageInvitations, 'Only owners and admins can revoke invitations.');
  await invitationRef.update({ status: 'revoked', updatedAt: FieldValue.serverTimestamp() });
  return { invitationId };
});

export const acceptInvitation = onCall(async (request) => {
  const auth = await requireUser(request);
  const invitationId = request.data?.invitationId;
  if (!invitationId) throw new HttpsError('invalid-argument', 'An invitation is required.');
  const invitationRef = db.collection('invitations').doc(invitationId);
  const snapshot = await invitationRef.get();
  if (!snapshot.exists) throw new HttpsError('not-found', 'Invitation not found.');
  const invitation = snapshot.data();
  if (!isInvitationEmailMatch(invitation.email, auth.token.email)) {
    throw new HttpsError('permission-denied', 'The signed-in email does not match this invitation.');
  }
  if (invitation.status !== 'pending' || isInvitationExpired(invitation)) {
    throw new HttpsError('failed-precondition', 'This invitation is no longer active.');
  }
  const membership = memberRef(invitation.workspace, auth.uid);
  const batch = db.batch();
  batch.set(membership, {
    workspace: invitation.workspace,
    user: auth.uid,
    role: invitation.role,
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  batch.update(invitationRef, { status: 'accepted', acceptedBy: auth.uid, updatedAt: FieldValue.serverTimestamp() });
  await batch.commit();
  return { workspaceId: invitation.workspace };
});

export const changeMemberRole = onCall(async (request) => {
  const auth = await requireUser(request);
  const workspaceId = requireWorkspaceId(request.data);
  await requireRole(workspaceId, auth.uid, canManageMembership, 'Only the workspace owner can change roles.');
  const uid = request.data?.uid;
  const role = request.data?.role;
  if (!uid || !['admin', 'member'].includes(role)) {
    throw new HttpsError('invalid-argument', 'A member and valid role are required.');
  }
  const target = await memberRef(workspaceId, uid).get();
  if (!target.exists || target.data().role === 'owner') {
    throw new HttpsError('failed-precondition', 'The owner role cannot be changed.');
  }
  await memberRef(workspaceId, uid).update({ role, updatedAt: FieldValue.serverTimestamp() });
  return { workspaceId, uid, role };
});


import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

import { auth, db, functions } from '../../lib/firebase';

const call = (name, data) => {
  if (!functions) throw new Error('Firebase Functions are not configured.');
  return httpsCallable(functions, name)(data);
};

const fromDoc = (item) => ({ id: item.id, ...item.data() });

export async function listUserWorkspaces(uid) {
  if (!uid || !db) return [];
  try {
    const members = await getDocs(query(collection(db, 'workspaceMembers'), where('user', '==', uid)));
    const activeMembers = members.docs.filter((d) => d.data()?.status === 'active');
    const workspaces = await Promise.all(activeMembers.map(async (member) => {
      try {
        const workspaceId = member.data().workspace;
        const workspace = await getDoc(doc(db, 'workspaces', workspaceId));
        return workspace.exists() ? { id: workspace.id, ...workspace.data(), role: member.data().role } : null;
      } catch {
        return null;
      }
    }));
    return workspaces.filter(Boolean);
  } catch (err) {
    console.warn('Could not list family workspaces:', err);
    return [];
  }
}

export async function createFamilyWorkspace(name, uid = auth?.currentUser?.uid) {
  if (!name?.trim() || !uid) throw new Error('A workspace name is required.');
  const workspace = await addDoc(collection(db, 'workspaces'), {
    kind: 'family',
    name: name.trim(),
    owner: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await setDoc(doc(db, 'workspaceMembers', `${workspace.id}_${uid}`), {
    workspace: workspace.id,
    user: uid,
    role: 'owner',
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: workspace.id, kind: 'family', name: name.trim(), owner: uid, role: 'owner' };
}

export async function listMembers(workspaceId) {
  if (!workspaceId || !db) return [];
  const snapshot = await getDocs(query(collection(db, 'workspaceMembers'), where('workspace', '==', workspaceId), where('status', '==', 'active')));
  return snapshot.docs.map(fromDoc);
}

export async function listPendingInvitations(workspaceId) {
  if (!workspaceId || !db) return [];
  const snapshot = await getDocs(query(collection(db, 'invitations'), where('workspace', '==', workspaceId), where('status', '==', 'pending')));
  return snapshot.docs.map(fromDoc);
}

export const createInvitation = (data) => call('createInvitation', data);
export const resendInvitation = (invitationId) => call('resendInvitation', { invitationId });
export const revokeInvitation = (invitationId) => call('revokeInvitation', { invitationId });
export const acceptInvitation = (invitationId) => call('acceptInvitation', { invitationId });
export const changeMemberRole = (data) => call('changeMemberRole', data);

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  where,
} from 'firebase/firestore';

import { db } from '../firebase';
import { listUserWorkspaces as listFamilyWorkspaces } from '../../features/family/familyRepository';

export async function ensurePersonalWorkspace(uid) {
  if (!uid) throw new Error('A signed-in user is required.');

  const workspaceId = `personal_${uid}`;
  const defaultWorkspace = {
    id: workspaceId,
    kind: 'personal',
    name: 'Personal workspace',
    owner: uid,
    role: 'owner',
  };

  if (!db) return defaultWorkspace;

  try {
    const reference = doc(db, 'workspaces', workspaceId);
    const memberReference = doc(db, 'workspaceMembers', `${workspaceId}_${uid}`);

    let snapshot = null;
    let memberSnapshot = null;
    try {
      snapshot = await getDoc(reference);
      memberSnapshot = await getDoc(memberReference);
    } catch (readErr) {
      console.warn('Initial personal workspace read notice:', readErr);
    }

    if (!snapshot || !snapshot.exists()) {
      try {
        const batch = writeBatch(db);
        batch.set(reference, {
          kind: 'personal',
          name: 'Personal workspace',
          owner: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        batch.set(memberReference, {
          workspace: workspaceId,
          user: uid,
          role: 'owner',
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
      } catch (batchErr) {
        console.warn('Workspace batch creation notice:', batchErr);
      }
      return defaultWorkspace;
    } else if (!memberSnapshot || !memberSnapshot.exists()) {
      try {
        const batch = writeBatch(db);
        batch.set(memberReference, {
          workspace: workspaceId,
          user: uid,
          role: 'owner',
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
      } catch (memberErr) {
        console.warn('Member batch creation notice:', memberErr);
      }
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
      kind: 'personal',
      name: snapshot.data()?.name || 'Personal workspace',
      role: 'owner',
    };
  } catch (err) {
    console.error('ensurePersonalWorkspace fallback:', err);
    return defaultWorkspace;
  }
}

export async function listUserWorkspaces(uid) {
  if (!uid) return [];
  return listFamilyWorkspaces(uid);
}

async function getWorkspaceCollection(workspaceId, name) {
  if (!workspaceId || !db) return [];
  try {
    const result = await getDocs(
      query(collection(db, name), where('workspace', '==', workspaceId)),
    );
    return result.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch (err) {
    console.warn(`Could not load ${name} for ${workspaceId}:`, err);
    return [];
  }
}

export const getWorkspaceTransactions = (workspaceId) =>
  getWorkspaceCollection(workspaceId, 'transactions');

export const getWorkspaceContributions = (workspaceId) =>
  getWorkspaceCollection(workspaceId, 'goalContributions');

export const getWorkspaceBudgets = (workspaceId) =>
  getWorkspaceCollection(workspaceId, 'budgets');

export const getWorkspaceGoals = (workspaceId) =>
  getWorkspaceCollection(workspaceId, 'goals');

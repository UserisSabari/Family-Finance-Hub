import { doc, getDoc, setDoc } from 'firebase/firestore';

import { db } from '../../lib/firebase';
import { getUserProfile } from '../../lib/users/userRepository';

function requireDatabase() {
  if (!db) throw new Error('Firebase is not configured.');
  return db;
}

function normalizeCategory(category) {
  const value = String(category ?? '').trim();
  if (!value) throw new Error('Category name is required.');
  if (value.length > 40) throw new Error('Category name must be 40 characters or fewer.');
  return value;
}

export async function updateProfile(uid, updates) {
  if (!uid) throw new Error('A signed-in user is required.');
  const values = {};
  if (updates?.displayName !== undefined) {
    const trimmed = String(updates.displayName ?? '').trim();
    if (!trimmed) throw new Error('Display name is required.');
    values.displayName = trimmed;
  }
  if (updates?.financialProfile !== undefined) {
    values.financialProfile = String(updates.financialProfile).trim();
  }
  if (Object.keys(values).length === 0) {
    throw new Error('No profile updates provided.');
  }
  await setDoc(doc(requireDatabase(), 'users', uid), { ...values, updatedAt: new Date() }, { merge: true });
  return getUserProfile(uid);
}

export async function getCategories(workspaceId) {
  if (!workspaceId) return [];
  const snapshot = await getDoc(doc(requireDatabase(), 'workspaces', workspaceId));
  const categories = snapshot.exists() ? snapshot.data().categories : [];
  return Array.isArray(categories) ? categories.filter(Boolean) : [];
}

export async function addCategory(workspaceId, category) {
  const value = normalizeCategory(category);
  const categories = await getCategories(workspaceId);
  if (categories.some((item) => item.toLowerCase() === value.toLowerCase())) {
    throw new Error('That category already exists.');
  }
  const next = [...categories, value];
  await setDoc(doc(requireDatabase(), 'workspaces', workspaceId), { categories: next }, { merge: true });
  return next;
}

export async function removeCategory(workspaceId, category) {
  const value = normalizeCategory(category);
  const categories = (await getCategories(workspaceId))
    .filter((item) => item.toLowerCase() !== value.toLowerCase());
  await setDoc(doc(requireDatabase(), 'workspaces', workspaceId), { categories }, { merge: true });
  return categories;
}

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '../firebase';

export async function getUserProfile(uid) {
  if (!uid) return null;
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function ensureUserProfile(user) {
  if (!user?.uid) throw new Error('A signed-in user is required.');

  const reference = doc(db, 'users', user.uid);
  const snapshot = await getDoc(reference);
  if (!snapshot.exists()) {
    await setDoc(reference, {
      displayName: user.displayName ?? '',
      email: user.email ?? '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  return getUserProfile(user.uid);
}

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

import { auth } from '../firebase';

const requireAuth = () => {
  if (!auth) throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* values to .env.local.');
  return auth;
};

export const subscribeToAuthState = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const signIn = (email, password) => signInWithEmailAndPassword(requireAuth(), email, password);
export const register = (email, password) => createUserWithEmailAndPassword(requireAuth(), email, password);
export const signInWithGoogle = () => signInWithPopup(requireAuth(), new GoogleAuthProvider());
export const resetPassword = (email) => sendPasswordResetEmail(requireAuth(), email);
export const signOutUser = () => signOut(requireAuth());

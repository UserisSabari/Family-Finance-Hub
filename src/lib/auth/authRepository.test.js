import { beforeEach, describe, expect, it, vi } from 'vitest';

const firebaseAuth = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: firebaseAuth.onAuthStateChanged,
  GoogleAuthProvider: class {},
  createUserWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../firebase', () => ({ auth: null }));

import { subscribeToAuthState } from './authRepository';

describe('auth repository without Firebase configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports an anonymous session without calling Firebase Auth', () => {
    const callback = vi.fn();

    const unsubscribe = subscribeToAuthState(callback);

    expect(callback).toHaveBeenCalledWith(null);
    expect(firebaseAuth.onAuthStateChanged).not.toHaveBeenCalled();
    expect(unsubscribe).toEqual(expect.any(Function));
  });
});

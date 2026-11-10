import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AuthProvider, useAuth } from './AuthProvider';

vi.mock('../../lib/auth/authRepository', () => ({
  signIn: vi.fn(),
  register: vi.fn(),
  signInWithGoogle: vi.fn(),
  resetPassword: vi.fn(),
  signOutUser: vi.fn(),
  subscribeToAuthState: (callback) => {
    callback({ uid: 'user-1' });
    return () => {};
  },
}));

function AuthConsumer() {
  return <div>{JSON.stringify(useAuth())}</div>;
}

describe('AuthProvider', () => {
  it('exposes the Firebase user after auth state loads', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(await screen.findByText(/"uid":"user-1"/)).toBeInTheDocument();
    expect(screen.getByText(/"loading":false/)).toBeInTheDocument();
  });
});

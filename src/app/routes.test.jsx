import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AppRoutes } from './routes';

vi.mock('../features/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../features/auth/AuthProvider';

describe('application route shell', () => {
  it('redirects anonymous users from protected routes and renders the app shell for authenticated users', () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    const { unmount } = render(
      <MemoryRouter initialEntries={['/app']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();

    unmount();
    useAuth.mockReturnValue({ user: { uid: 'user-1' }, loading: false });

    render(
      <MemoryRouter initialEntries={['/app']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
  });
});

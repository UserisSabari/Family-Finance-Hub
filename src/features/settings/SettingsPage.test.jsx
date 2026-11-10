import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SettingsPage } from './SettingsPage';

const mocks = vi.hoisted(() => ({
  updateProfile: vi.fn(),
  addCategory: vi.fn(),
  removeCategory: vi.fn(),
  getCategories: vi.fn(),
  signOut: vi.fn(),
  setTheme: vi.fn(),
}));

vi.mock('./settingsRepository', () => ({
  updateProfile: mocks.updateProfile,
  addCategory: mocks.addCategory,
  removeCategory: mocks.removeCategory,
  getCategories: mocks.getCategories,
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user-1', email: 'person@example.com' }, signOut: mocks.signOut }),
}));

vi.mock('../../hooks/useWorkspace', () => ({
  useWorkspace: () => ({
    profile: { displayName: 'Person', email: 'person@example.com', categories: ['Food'] },
    workspace: { id: 'personal-user-1', kind: 'personal', role: 'owner' },
    refresh: vi.fn(),
  }),
}));

vi.mock('../../app/AppProviders', () => ({
  useTheme: () => ({ theme: 'light', setTheme: mocks.setTheme }),
}));

describe('settings page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCategories.mockResolvedValue(['Food']);
  });

  it('loads categories from the active workspace', async () => {
    render(<MemoryRouter><SettingsPage /></MemoryRouter>);

    await waitFor(() => expect(mocks.getCategories).toHaveBeenCalledWith('personal-user-1'));
    expect(await screen.findByText('Food')).toBeInTheDocument();
  });

  it('persists profile changes and keeps currency INR-only', async () => {
    render(<MemoryRouter><SettingsPage /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: 'New Name' } });
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => expect(mocks.updateProfile).toHaveBeenCalledWith('user-1', { displayName: 'New Name' }));
    expect(screen.getByText(/indian rupee \(inr\)/i)).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /currency/i })).not.toBeInTheDocument();
  });

  it('persists theme preference and validates category names', async () => {
    render(<MemoryRouter><SettingsPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('radio', { name: /dark/i }));
    expect(mocks.setTheme).toHaveBeenCalledWith('dark');

    fireEvent.click(screen.getByRole('button', { name: /add category/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/category name is required/i);

    fireEvent.change(screen.getByLabelText(/new category/i), { target: { value: 'Travel' } });
    fireEvent.click(screen.getByRole('button', { name: /add category/i }));
    await waitFor(() => expect(mocks.addCategory).toHaveBeenCalledWith('personal-user-1', 'Travel'));
  });

  it('signs out from the settings page', async () => {
    render(<MemoryRouter><SettingsPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));

    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1));
  });
});

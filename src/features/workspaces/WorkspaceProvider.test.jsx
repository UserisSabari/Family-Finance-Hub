import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WorkspaceProvider } from './WorkspaceProvider';

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ user: { uid: 'user-1' }, loading: false }),
}));

vi.mock('../../lib/users/userRepository', () => ({
  getUserProfile: vi.fn().mockResolvedValue({ id: 'user-1', displayName: 'Asha' }),
}));

vi.mock('../../lib/workspaces/workspaceRepository', () => ({
  ensurePersonalWorkspace: vi.fn().mockResolvedValue({
    id: 'personal_user-1',
    kind: 'personal',
  }),
  listUserWorkspaces: vi.fn().mockResolvedValue([]),
}));

import { useWorkspace } from './WorkspaceProvider';

function WorkspaceConsumer() {
  const { workspace, profile, loading } = useWorkspace();
  return <div>{JSON.stringify({ workspace, profile, loading })}</div>;
}

describe('WorkspaceProvider', () => {
  it('loads the signed-in user profile and personal workspace', async () => {
    render(
      <WorkspaceProvider>
        <WorkspaceConsumer />
      </WorkspaceProvider>,
    );

    expect(await screen.findByText(/personal_user-1/)).toBeInTheDocument();
    expect(screen.getByText(/"displayName":"Asha"/)).toBeInTheDocument();
    expect(screen.getByText(/"loading":false/)).toBeInTheDocument();
  });
});

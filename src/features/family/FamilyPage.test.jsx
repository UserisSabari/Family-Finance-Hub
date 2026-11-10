import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FamilyPage } from './FamilyPage';

vi.mock('../../hooks/useWorkspace', () => ({
  useWorkspace: () => ({
    workspace: { id: 'family-1', kind: 'family', name: 'Smith family', role: 'owner' },
    loading: false,
    error: null,
  }),
}));

vi.mock('./familyRepository', () => ({
  listMembers: vi.fn().mockResolvedValue([
    { id: 'family-1_user-1', user: 'user-1', role: 'owner', status: 'active' },
  ]),
  listPendingInvitations: vi.fn().mockResolvedValue([]),
  createInvitation: vi.fn(),
  resendInvitation: vi.fn(),
  revokeInvitation: vi.fn(),
  changeMemberRole: vi.fn(),
  createFamilyWorkspace: vi.fn(),
}));

describe('FamilyPage', () => {
  it('shows workspace members and owner membership controls', async () => {
    render(<FamilyPage />);
    expect(await screen.findByRole('heading', { name: /family workspace/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /invite member/i })).toBeInTheDocument();
  });
});

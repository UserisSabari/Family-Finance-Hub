import { describe, expect, it } from 'vitest';

import {
  canManageMembership,
  getInvitationExpiry,
  isInvitationEmailMatch,
  isInvitationExpired,
  canMutateRecord,
} from './invitations.js';

describe('invitation and role policy', () => {
  it('allows only owners to manage membership and owners/admins to invite', () => {
    expect(canManageMembership('owner')).toBe(true);
    expect(canManageMembership('admin')).toBe(false);
    expect(canMutateRecord('admin', 'other-user', 'user-1', 'update')).toBe(true);
    expect(canMutateRecord('member', 'other-user', 'user-1', 'delete')).toBe(false);
    expect(canMutateRecord('member', 'user-1', 'user-1', 'update')).toBe(true);
  });

  it('expires invitations seven days after creation', () => {
    const createdAt = new Date('2026-01-01T12:00:00.000Z');
    expect(getInvitationExpiry(createdAt).toISOString()).toBe('2026-01-08T12:00:00.000Z');
    expect(isInvitationExpired({ createdAt, expiresAt: getInvitationExpiry(createdAt) }, new Date('2026-01-08T12:00:01.000Z'))).toBe(true);
  });

  it('requires an authenticated email to match the invitation target', () => {
    expect(isInvitationEmailMatch('Person@Example.com', 'person@example.com')).toBe(true);
    expect(isInvitationEmailMatch('person@example.com', 'other@example.com')).toBe(false);
  });
});

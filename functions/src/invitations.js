export const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function getInvitationExpiry(createdAt = new Date()) {
  return new Date(new Date(createdAt).getTime() + INVITATION_TTL_MS);
}

export function isInvitationExpired(invitation, now = new Date()) {
  const rawExpiry = invitation?.expiresAt;
  const expiresAt = rawExpiry?.toDate
    ? rawExpiry.toDate()
    : rawExpiry instanceof Date ? rawExpiry : new Date(rawExpiry);
  return !Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= new Date(now).getTime();
}

export function isInvitationEmailMatch(targetEmail, authenticatedEmail) {
  return Boolean(targetEmail && authenticatedEmail)
    && targetEmail.trim().toLowerCase() === authenticatedEmail.trim().toLowerCase();
}

export function canManageMembership(role) {
  return role === 'owner';
}

export function canManageInvitations(role) {
  return role === 'owner' || role === 'admin';
}

export function canMutateRecord(role, recordOwner, uid, operation) {
  if (role === 'owner' || role === 'admin') return true;
  if (role !== 'member') return false;
  return recordOwner === uid && operation !== 'delete-other';
}

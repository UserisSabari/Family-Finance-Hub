import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Firestore authorization rules', () => {
  it('defines workspace membership and record ownership checks', () => {
    const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');
    expect(rules).toMatch(/workspaceMembers/);
    expect(rules).toMatch(/isWorkspaceMember/);
    expect(rules).toMatch(/resource\.data\.createdBy/);
    expect(rules).toMatch(/request\.auth\.uid/);
  });

  it('scopes record deletion to the supported record collections', () => {
    const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');
    expect(rules).toMatch(/allow delete: if \(recordCollection in \['transactions', 'budgets', 'goals', 'goalContributions'\]\)/);
  });
});

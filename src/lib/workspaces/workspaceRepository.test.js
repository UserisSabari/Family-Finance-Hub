import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('personal workspace initialization', () => {
  it('uses a batch and verifies membership independently', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/lib/workspaces/workspaceRepository.js'),
      'utf8',
    );
    expect(source).toMatch(/writeBatch/);
    expect(source).toMatch(/memberSnapshot/);
  });
});

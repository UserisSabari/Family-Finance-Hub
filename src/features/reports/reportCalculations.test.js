import { describe, expect, it } from 'vitest';

import { buildCategoryBreakdown, buildTrend } from './reportCalculations';

describe('report calculations', () => {
  it('builds category totals and period trends from transactions', () => {
    const transactions = [
      { type: 'expense', amount: 200, category: 'Food', date: '2026-01-02' },
      { type: 'refund', amount: 50, category: 'Food', date: '2026-01-05' },
      { type: 'expense', amount: 300, category: 'Travel', date: '2026-02-01' },
      { type: 'transfer', amount: 1000, category: 'Move', date: '2026-02-02' },
    ];
    expect(buildCategoryBreakdown(transactions)).toEqual([
      { category: 'Travel', amount: 300 },
      { category: 'Food', amount: 150 },
    ]);
    expect(buildTrend(transactions, { start: '2026-01-01', end: '2026-02-28' })).toEqual([
      { period: '2026-01', amount: 150 },
      { period: '2026-02', amount: 300 },
    ]);
  });

  it('returns no-data-safe results', () => {
    expect(buildCategoryBreakdown([])).toEqual([]);
    expect(buildTrend([], { start: '2026-01-01', end: '2026-01-31' })).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';

import {
  buildCategoryBreakdown,
  buildPaymentModeBreakdown,
  buildTrend,
  calculateSpendVelocity,
} from './reportCalculations';

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

  it('calculates payment mode breakdown (UPI/Bank vs Cash)', () => {
    const transactions = [
      { type: 'expense', amount: 800, category: 'Groceries', date: '2026-01-10', account: 'bank' },
      { type: 'expense', amount: 200, category: 'Chai', date: '2026-01-11', account: 'cash' },
    ];
    const mode = buildPaymentModeBreakdown(transactions);
    expect(mode).toEqual({
      bank: 800,
      cash: 200,
      total: 1000,
      bankPercentage: 80,
      cashPercentage: 20,
    });
  });

  it('calculates spend velocity and highest spending day', () => {
    const transactions = [
      { type: 'expense', amount: 300, date: '2026-01-10' },
      { type: 'expense', amount: 700, date: '2026-01-10' },
      { type: 'expense', amount: 500, date: '2026-01-12' },
    ];
    const velocity = calculateSpendVelocity(transactions);
    expect(velocity).toEqual({
      totalSpend: 1500,
      transactionCount: 3,
      dailyAverage: 750, // 1500 / 2 active days
      highestSpendDay: '2026-01-10',
      highestSpendAmount: 1000,
    });
  });
});

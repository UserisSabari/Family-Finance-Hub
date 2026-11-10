import { describe, expect, it } from 'vitest';

import { calculateBudget } from './budgetCalculations';

describe('calculateBudget', () => {
  it('calculates calendar-month spend, remaining amount, and threshold state', () => {
    const result = calculateBudget(
      { amount: 10000, category: 'Food', year: 2026, month: 1 },
      [
        { type: 'expense', category: 'Food', amount: 2500, date: '2026-01-03' },
        { type: 'refund', category: 'Food', amount: 500, date: '2026-01-20' },
        { type: 'expense', category: 'Food', amount: 9000, date: '2026-02-01' },
      ],
    );

    expect(result).toEqual({
      budget: 10000,
      actual: 2000,
      remaining: 8000,
      percentageUsed: 20,
      threshold: 'healthy',
    });
  });

  it('marks budgets as overspent without producing invalid numbers', () => {
    expect(calculateBudget({ amount: 100, year: 2026, month: 1 }, [
      { type: 'expense', amount: 150, date: '2026-01-01' },
    ])).toMatchObject({ actual: 150, remaining: -50, percentageUsed: 150, threshold: 'overspent' });
  });
});

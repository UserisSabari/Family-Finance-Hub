import { describe, expect, it } from 'vitest';

import { calculateSummary } from './calculations';

describe('calculateSummary', () => {
  it('calculates signed income, expenses, refunds, savings rate, and ignores transfers', () => {
    const summary = calculateSummary(
      [
        { type: 'income', amount: 10000 },
        { type: 'expense', amount: 2500 },
        { type: 'refund', amount: 500 },
        { type: 'transfer', amount: 3000 },
      ],
      [{ amount: 1500 }, { amount: 500 }],
    );

    expect(summary).toEqual({
      income: 10000,
      expenses: 2000,
      balance: 8000,
      savings: 2000,
      savingsRate: 20,
    });
  });

  it('ignores malformed records without producing NaN', () => {
    const summary = calculateSummary(
      [
        null,
        {},
        { type: 'income', amount: 'bad' },
        { type: 'expense', amount: -20 },
      ],
      [{ amount: 'bad' }, {}],
    );

    expect(summary).toEqual({
      income: 0,
      expenses: 0,
      balance: 0,
      savings: 0,
      savingsRate: 0,
    });
  });
});

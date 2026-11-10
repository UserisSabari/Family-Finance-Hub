import { describe, expect, it } from 'vitest';

import { validateContribution, validateTransaction } from './validation';

describe('validateTransaction', () => {
  it('accepts a positive transaction with an allowed type and valid date', () => {
    expect(
      validateTransaction({
        type: 'expense',
        amount: 1250,
        category: 'Food',
        date: '2026-01-15',
      }),
    ).toEqual({ valid: true, errors: {} });
  });

  it('rejects zero, negative, malformed, and unsupported transaction values', () => {
    const result = validateTransaction({
      type: 'expense',
      amount: 0,
      category: '',
      date: 'not-a-date',
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual({
      amount: 'Amount must be greater than zero.',
      category: 'Category is required.',
      date: 'Date must be valid.',
    });
  });
});

describe('validateContribution', () => {
  it('requires a goal, positive amount, and valid date', () => {
    expect(
      validateContribution({
        goalId: '',
        amount: -10,
        date: '2026-02-30',
      }),
    ).toEqual({
      valid: false,
      errors: {
        goalId: 'Goal is required.',
        amount: 'Amount must be greater than zero.',
        date: 'Date must be valid.',
      },
    });
  });
});

import { describe, expect, it } from 'vitest';

import { calculateGoalProgress, validateGoal } from './goalCalculations';

describe('goal calculations', () => {
  it('derives progress from explicit contribution records', () => {
    expect(calculateGoalProgress(
      { targetAmount: 10000 },
      [{ amount: 2500 }, { amount: 1500 }, { amount: -10 }, { amount: 'bad' }],
    )).toEqual({ contributed: 4000, remaining: 6000, percentage: 40, completed: false });
  });

  it('requires a positive target and a valid deadline', () => {
    expect(validateGoal({ name: '', targetAmount: 0, deadline: '2026-02-30' })).toEqual({
      valid: false,
      errors: { name: 'Name is required.', targetAmount: 'Target must be greater than zero.', deadline: 'Deadline must be valid.' },
    });
  });
});

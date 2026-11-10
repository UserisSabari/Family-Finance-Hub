import { describe, expect, it } from 'vitest';

import { getMonthRange } from './dates';

describe('getMonthRange', () => {
  it('returns Asia/Kolkata month boundaries as an exclusive end range', () => {
    const { start, end } = getMonthRange(2026, 1);

    expect(start.toISOString()).toBe('2025-12-31T18:30:00.000Z');
    expect(end.toISOString()).toBe('2026-01-31T18:30:00.000Z');
  });

  it('handles a month boundary around midnight in Asia/Kolkata', () => {
    const { start, end } = getMonthRange(2026, 2);

    expect(new Date('2026-01-31T18:29:59.999Z') < start).toBe(true);
    expect(new Date('2026-02-28T18:30:00.000Z') >= end).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';

import { formatInr } from './currency';

describe('formatInr', () => {
  it('formats positive and negative amounts using Indian Rupees', () => {
    expect(formatInr(1234567.89)).toBe('₹12,34,567.89');
    expect(formatInr(-2500)).toBe('-₹2,500.00');
  });

  it('does not produce NaN for malformed amounts', () => {
    expect(formatInr('not-a-number')).toBe('₹0.00');
  });
});

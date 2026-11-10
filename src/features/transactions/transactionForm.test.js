import { describe, expect, it } from 'vitest';

import {
  getInitialTransactionValues,
  normalizeTransactionInput,
} from './transactionForm';

describe('transaction form', () => {
  it('normalizes a valid expense with a positive stored amount', () => {
    expect(normalizeTransactionInput({
      type: 'expense',
      amount: '1250.50',
      category: '  Rent ',
      date: '2026-11-09',
      note: ' November rent ',
    })).toEqual({
      type: 'expense',
      amount: 1250.5,
      category: 'Rent',
      date: '2026-11-09',
      note: 'November rent',
    });
  });

  it('preserves explicit refund and transfer fields', () => {
    expect(normalizeTransactionInput({
      type: 'refund',
      amount: '250',
      category: 'Returns',
      date: '2026-11-09',
      transferId: 'transfer-1',
    })).toMatchObject({
      type: 'refund',
      amount: 250,
      transferId: 'transfer-1',
    });
  });

  it('rejects zero, negative, unsupported, and invalid-date values', () => {
    expect(() => normalizeTransactionInput({
      type: 'expense',
      amount: '-1',
      category: 'Food',
      date: '2026-02-30',
    })).toThrow(/amount|date/i);
    expect(() => normalizeTransactionInput({
      type: 'other',
      amount: '10',
      category: 'Food',
      date: '2026-11-09',
    })).toThrow(/type/i);
  });

  it('returns stable blank values for a new transaction', () => {
    expect(getInitialTransactionValues(new Date('2026-11-09T00:00:00'))).toEqual({
      type: 'expense',
      amount: '',
      category: '',
      date: '2026-11-09',
      note: '',
      transferId: '',
    });
  });
});

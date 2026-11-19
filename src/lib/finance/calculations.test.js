import { describe, expect, it } from 'vitest';

import { calculateAccountBalances, calculateSummary } from './calculations';

describe('calculateSummary', () => {
  it('calculates signed income, expenses, refunds, savings rate, and ignores transfers', () => {
    const summary = calculateSummary(
      [
        { type: 'income', amount: 10000 },
        { type: 'expense', amount: 2500 },
        { type: 'refund', amount: 500 },
        { type: 'transfer', amount: 3000 },
        { type: 'pass_through', amount: 1200 }, // bill paid for friend — neutral
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

describe('calculateAccountBalances', () => {
  it('correctly tracks bank vs cash balances including transfers and cash swaps', () => {
    const transactions = [
      { type: 'income', amount: 20000, account: 'bank' },
      { type: 'expense', amount: 3000, account: 'bank' },
      { type: 'expense', amount: 500, account: 'cash' },
      // Cash swap / ATM withdrawal: Give 2000 from bank, get 2000 cash in hand
      { type: 'transfer', amount: 2000, fromAccount: 'bank', toAccount: 'cash' },
      // Pass-through: Pay 800 electricity bill for friend from bank (unsettled)
      { type: 'pass_through', amount: 800, account: 'bank', isSettled: false },
      // Pass-through: Pay 300 recharge for friend from bank, friend reimbursed in cash
      { type: 'pass_through', amount: 300, account: 'bank', isSettled: true, settledAccount: 'cash' },
    ];

    const balances = calculateAccountBalances(transactions);
    // Bank: 20000 (inc) - 3000 (exp) - 2000 (transfer to cash) - 800 (pass_through) - 300 (pass_through) = 13900
    // Cash: - 500 (exp) + 2000 (transfer from bank) + 300 (reimbursed) = 1800
    // Total: 15700
    // Pending receivables: 800
    expect(balances).toEqual({
      bank: 13900,
      cash: 1800,
      total: 15700,
      pendingReceivables: 800,
    });
  });

  it('handles defaults to bank when account is missing', () => {
    const transactions = [
      { type: 'income', amount: 5000 },
      { type: 'expense', amount: 1000 },
    ];
    const balances = calculateAccountBalances(transactions);
    expect(balances).toEqual({
      bank: 4000,
      cash: 0,
      total: 4000,
      pendingReceivables: 0,
    });
  });

  it('adjusts personal expense and tracks friend receivables for group split notes', () => {
    const transactions = [
      {
        type: 'expense',
        amount: 1500,
        account: 'bank',
        splitNote: {
          isGroup: true,
          totalBill: 1500,
          myShare: 500,
          members: [
            { name: 'Self', share: 500, settled: true },
            { name: 'Rahul', share: 500, settled: false },
            { name: 'Sneha', share: 500, settled: true },
          ],
        },
      },
    ];

    // Summary: Personal expense is only myShare (500), not full 1500!
    const summary = calculateSummary(transactions);
    expect(summary.expenses).toBe(500);

    // Account Balances:
    // Outflow: 1500 from bank.
    // Sneha settled 500 into bank.
    // Rahul unsettled 500.
    // Bank = -1500 + 500 = -1000.
    // Pending receivables = 500.
    const balances = calculateAccountBalances(transactions);
    expect(balances.bank).toBe(-1000);
    expect(balances.pendingReceivables).toBe(500);
  });
});

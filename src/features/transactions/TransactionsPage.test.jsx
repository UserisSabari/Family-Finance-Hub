import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TransactionsPage } from './TransactionsPage';

const workspaceState = { workspace: { id: 'workspace-1' }, loading: false, error: null };
vi.mock('../../hooks/useWorkspace', () => ({ useWorkspace: () => workspaceState }));
vi.mock('./transactionRepository', () => ({
  listTransactions: vi.fn(),
  createTransaction: vi.fn(),
  updateTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
}));

import {
  createTransaction,
  deleteTransaction,
  listTransactions,
} from './transactionRepository';

describe('TransactionsPage', () => {
  it('shows loading, empty, and error states for workspace reads', async () => {
    listTransactions.mockReturnValueOnce(new Promise(() => {}));
    render(<TransactionsPage />);
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i);

    listTransactions.mockResolvedValueOnce([]);
    render(<TransactionsPage />);
    expect(await screen.findByText(/no transactions yet/i)).toBeInTheDocument();

    listTransactions.mockRejectedValueOnce(new Error('offline'));
    render(<TransactionsPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load transactions/i);
  });

  it('filters visible transactions and protects against duplicate submits', async () => {
    listTransactions.mockResolvedValue({
      id: 'tx-1',
      type: 'expense',
      amount: 100,
      category: 'Food',
      date: '2026-11-09',
      note: 'Lunch',
    });
    listTransactions.mockResolvedValueOnce([{
      id: 'tx-1',
      type: 'expense',
      amount: 100,
      category: 'Food',
      date: '2026-11-09',
      note: 'Lunch',
    }]);
    createTransaction.mockResolvedValueOnce({ id: 'tx-2' });

    render(<TransactionsPage />);
    expect(await screen.findByText('Lunch')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/search/i), { target: { value: 'missing' } });
    expect(screen.queryByText('Lunch')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/search/i), { target: { value: 'Lunch' } });
    fireEvent.click(screen.getByRole('button', { name: /add transaction/i }));
    fireEvent.change(screen.getByLabelText(/amount/i), { target: { value: '50' } });
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText(/^Category$/), { target: { value: 'Food' } });
    fireEvent.change(within(dialog).getByLabelText(/date/i), { target: { value: '2026-11-09' } });
    const submitButton = within(dialog).getByRole('button', { name: /save transaction/i });
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    await waitFor(() => expect(createTransaction).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole('status')).toHaveTextContent(/saved/i);
  });

  it('supports delete confirmation and success feedback', async () => {
    listTransactions.mockResolvedValueOnce([{
      id: 'tx-1',
      type: 'transfer',
      amount: 100,
      category: 'Savings',
      date: '2026-11-09',
      note: 'Move money',
    }]);
    deleteTransaction.mockResolvedValueOnce();

    render(<TransactionsPage />);
    expect(await screen.findByText('Move money')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /delete move money/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm delete/i }));

    await waitFor(() => expect(deleteTransaction).toHaveBeenCalledWith('tx-1'));
    expect(await screen.findByRole('status')).toHaveTextContent(/deleted/i);
  });
});

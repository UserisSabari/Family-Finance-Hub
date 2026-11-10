import { beforeEach, describe, expect, it, vi } from 'vitest';

const firestore = vi.hoisted(() => ({
  collection: vi.fn((db, name) => ({ db, name })),
  doc: vi.fn((db, name, id) => ({ db, name, id })),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn((...args) => ({ args })),
  where: vi.fn((...args) => ({ args })),
  orderBy: vi.fn((...args) => ({ args })),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  Timestamp: { fromDate: vi.fn((date) => date) },
}));

vi.mock('firebase/firestore', () => firestore);
vi.mock('../../lib/firebase', () => ({ db: { name: 'test-db' }, auth: { currentUser: { uid: 'user-1' } } }));

import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from './transactionRepository';

describe('transaction repository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists workspace transactions with type, category, and search filters', async () => {
    firestore.getDocs.mockResolvedValueOnce({
      docs: [{ id: 'tx-1', data: () => ({ workspace: 'workspace-1', type: 'expense', category: 'Food', note: 'Lunch' }) }],
    });

    await expect(listTransactions('workspace-1', {
      type: 'expense',
      category: 'Food',
      search: 'lunch',
    })).resolves.toEqual([
      expect.objectContaining({ id: 'tx-1', workspace: 'workspace-1', type: 'expense' }),
    ]);

    expect(firestore.where).toHaveBeenCalledWith('workspace', '==', 'workspace-1');
    expect(firestore.where).toHaveBeenCalledWith('type', '==', 'expense');
    expect(firestore.where).toHaveBeenCalledWith('category', '==', 'Food');
  });

  it('creates positive normalized records with explicit timestamps', async () => {
    firestore.addDoc.mockResolvedValueOnce({ id: 'tx-1' });

    await expect(createTransaction('workspace-1', {
      type: 'income',
      amount: '5000',
      category: 'Salary',
      date: '2026-11-09',
      note: 'Pay day',
    })).resolves.toEqual({ id: 'tx-1' });

    expect(firestore.addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        workspace: 'workspace-1',
        type: 'income',
        amount: 5000,
        createdAt: 'SERVER_TIMESTAMP',
        updatedAt: 'SERVER_TIMESTAMP',
      }),
    );
  });

  it('updates and deletes by document id', async () => {
    await updateTransaction('tx-1', { type: 'refund', amount: 25, category: 'Returns', date: '2026-11-09' });
    await deleteTransaction('tx-1');

    expect(firestore.updateDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'transactions', id: 'tx-1' }),
      expect.objectContaining({ type: 'refund', amount: 25, updatedAt: 'SERVER_TIMESTAMP' }),
    );
    expect(firestore.deleteDoc).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'transactions', id: 'tx-1' }),
    );
  });
});

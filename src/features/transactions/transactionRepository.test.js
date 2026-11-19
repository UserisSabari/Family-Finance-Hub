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

  it('sorts same-day transactions by time descending, older dates last', async () => {
    firestore.getDocs.mockResolvedValueOnce({
      docs: [
        { id: 'tx-morning', data: () => ({ workspace: 'w', type: 'expense', category: 'Food', date: '2026-11-19', time: '09:00' }) },
        { id: 'tx-evening', data: () => ({ workspace: 'w', type: 'expense', category: 'Food', date: '2026-11-19', time: '18:30' }) },
        { id: 'tx-older',   data: () => ({ workspace: 'w', type: 'expense', category: 'Food', date: '2026-11-18', time: '12:00' }) },
      ],
    });
    const result = await listTransactions('w');
    expect(result[0].id).toBe('tx-evening');  // 18:30 same day → first
    expect(result[1].id).toBe('tx-morning');  // 09:00 same day → second
    expect(result[2].id).toBe('tx-older');    // previous day → last
  });

  it('filters by fromDate, toDate, and applies limit slice', async () => {
    firestore.getDocs.mockResolvedValueOnce({
      docs: [
        { id: 'tx-1', data: () => ({ workspace: 'w', type: 'expense', category: 'Food', date: '2026-11-01' }) },
        { id: 'tx-2', data: () => ({ workspace: 'w', type: 'expense', category: 'Food', date: '2026-11-15' }) },
        { id: 'tx-3', data: () => ({ workspace: 'w', type: 'expense', category: 'Food', date: '2026-11-20' }) },
        { id: 'tx-4', data: () => ({ workspace: 'w', type: 'expense', category: 'Food', date: '2026-11-25' }) },
      ],
    });
    const result = await listTransactions('w', {
      fromDate: '2026-11-10',
      toDate: '2026-11-22',
      limit: 1,
    });
    // Range includes tx-3 (Nov 20) and tx-2 (Nov 15). With limit: 1, newest is returned
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('tx-3');
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

import { useCallback, useEffect, useState } from 'react';

import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { TransactionFilters } from '../../components/transactions/TransactionFilters';
import { TransactionForm } from '../../components/transactions/TransactionForm';
import { TransactionTable } from '../../components/transactions/TransactionTable';
import { IconDownload, IconPlus } from '../../components/icons/Icons';
import { useWorkspace } from '../../hooks/useWorkspace';
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from './transactionRepository';
import './transactions.css';

const blankFilters = { search: '', type: '', category: '' };

export function TransactionsPage() {
  const { workspace, loading: workspaceLoading, error: workspaceError } = useWorkspace();
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState(blankFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(workspaceError);
  const [notice, setNotice] = useState('');
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    if (!workspace?.id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await listTransactions(workspace.id, filters);
      setTransactions(Array.isArray(result) ? result : []);
    } catch (reason) {
      setError(reason);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id, filters]);

  useEffect(() => { load(); }, [load]);

  const save = async (input) => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (editing?.id) {
        await updateTransaction(editing.id, input);
        setNotice('Transaction updated.');
      } else {
        await createTransaction(workspace.id, input);
        setNotice('Transaction saved.');
      }
      setEditing(null);
      await load();
    } catch (reason) {
      setError(reason);
      throw reason;
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setSubmitting(true);
    try {
      await deleteTransaction(deleting.id);
      setDeleting(null);
      setNotice('Transaction deleted.');
      await load();
    } catch (reason) {
      setError(reason);
    } finally {
      setSubmitting(false);
    }
  };

  const exportCsv = () => {
    if (!transactions.length) return;
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Note', 'TransferId'];
    const rows = transactions.map((tx) => [
      tx.date || '',
      tx.type || '',
      `"${(tx.category || '').replace(/"/g, '""')}"`,
      tx.amount || 0,
      `"${(tx.note || '').replace(/"/g, '""')}"`,
      tx.transferId || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finance_hub_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="page-content transactions-page">
      <header className="transactions-header">
        <div>
          <p className="eyebrow">Workspace records</p>
          <h1>Transactions</h1>
          <p className="muted">Track every income, expense, refund, and transfer with speed.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {transactions.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={exportCsv}
              title="Download transactions CSV"
            >
              <IconDownload size={16} />
              <span>Export CSV</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => { setNotice(''); setEditing({}); }}
          >
            <IconPlus size={16} />
            <span>Add transaction</span>
          </button>
        </div>
      </header>

      {notice && <p role="status" className="feedback feedback-success">{notice}</p>}
      {workspaceLoading && <LoadingState label="Loading your workspace…" />}
      {workspaceError && <ErrorState message="Could not load your workspace." />}

      {!workspaceLoading && !workspaceError && (
        <TransactionFilters
          filters={filters}
          onChange={(next) => setFilters((current) => ({ ...current, ...next }))}
        />
      )}

      {loading && !workspaceLoading && <LoadingState label="Loading transactions…" />}
      {error && !workspaceError && <ErrorState message="Could not load transactions. Please try again." />}

      {!loading && !error && !workspaceError && transactions.length === 0 && (
        <p className="muted">No transactions yet. Add your first transaction to get started.</p>
      )}

      {!loading && !error && !workspaceError && transactions.length > 0 && (
        <TransactionTable
          transactions={transactions}
          onEdit={setEditing}
          onDelete={setDeleting}
        />
      )}

      {editing && (
        <div className="modal-overlay">
          <div
            className="transaction-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-dialog-title"
          >
            <h2 id="transaction-dialog-title">{editing.id ? 'Edit transaction' : 'Add transaction'}</h2>
            <TransactionForm
              initialValues={editing.id ? editing : undefined}
              onSubmit={save}
              onCancel={() => setEditing(null)}
              submitting={submitting}
            />
          </div>
        </div>
      )}

      {deleting && (
        <div className="modal-overlay">
          <div
            className="transaction-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <h2 id="delete-dialog-title">Delete transaction?</h2>
            <p className="muted">This cannot be undone. Are you sure you want to remove this record?</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={remove}
                disabled={submitting}
              >
                Confirm delete
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleting(null)}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

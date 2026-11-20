import { useCallback, useEffect, useState } from 'react';

import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { TransactionFilters } from '../../components/transactions/TransactionFilters';
import { TransactionForm } from '../../components/transactions/TransactionForm';
import { TransactionTable } from '../../components/transactions/TransactionTable';
import { IconDownload, IconPlus } from '../../components/icons/Icons';
import { calculateAccountBalances } from '../../lib/finance/calculations';
import { formatInr } from '../../lib/format/currency';
import { useWorkspace } from '../../hooks/useWorkspace';
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from './transactionRepository';
import './transactions.css';

const blankFilters = { search: '', type: '', category: '', limit: null, fromDate: '', toDate: '', scope: 'all' };

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

  useEffect(() => {
    let active = true;
    if (!workspace?.id) return () => { active = false; };
    setLoading(true);
    setError(null);
    listTransactions(workspace.id, filters)
      .then((result) => {
        if (active) setTransactions(Array.isArray(result) ? result : []);
      })
      .catch((reason) => {
        if (active) setError(reason);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [workspace?.id, filters]);

  const accountBalances = calculateAccountBalances(transactions);

  const handleFilterChange = useCallback((next) => {
    setFilters((current) => ({ ...current, ...next }));
  }, []);

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
    } catch (reason) {
      setError(reason);
      throw reason;
    } finally {
      setSubmitting(false);
    }

    try {
      await load();
    } catch (loadErr) {
      console.warn('Post-save reload note:', loadErr);
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
    const sanitizeCsvCell = (val) => {
      const str = String(val ?? '');
      const escaped = str.replace(/"/g, '""');
      return /^[=+\-@]/.test(str) ? `"'${escaped}"` : `"${escaped}"`;
    };

    const headers = ['Date', 'Type', 'Category', 'Amount', 'Account', 'Note', 'TransferId'];
    const rows = transactions.map((tx) => [
      sanitizeCsvCell(tx.date || ''),
      sanitizeCsvCell(tx.type || ''),
      sanitizeCsvCell(tx.category || ''),
      tx.amount || 0,
      sanitizeCsvCell(tx.account || 'bank'),
      sanitizeCsvCell(tx.note || ''),
      sanitizeCsvCell(tx.transferId || ''),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance_hub_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          onChange={handleFilterChange}
        />
      )}

      {loading && !workspaceLoading && <LoadingState label="Loading transactions…" type="table" />}
      {error && !workspaceError && <ErrorState message="Could not load transactions. Please try again." />}

      {!loading && !error && !workspaceError && transactions.length === 0 && (
        <p className="muted">No transactions yet. Add your first transaction to get started.</p>
      )}

      {!loading && !error && !workspaceError && transactions.length > 0 && (
        <>
          <section className="accounts-summary-bar" aria-label="Accounts and wallet balances">
            <div className="account-pill">
              <span className="account-pill-label">Bank & UPI</span>
              <strong>{formatInr(accountBalances.bank)}</strong>
            </div>
            <div className="account-pill">
              <span className="account-pill-label">Cash in Hand</span>
              <strong>{formatInr(accountBalances.cash)}</strong>
            </div>
            {accountBalances.pendingReceivables > 0 && (
              <div className="account-pill account-pill-pending">
                <span className="account-pill-label">Pending Receivables</span>
                <strong>{formatInr(accountBalances.pendingReceivables)}</strong>
              </div>
            )}
          </section>

          <TransactionTable
            transactions={transactions}
            onEdit={setEditing}
            onDelete={setDeleting}
          />
        </>
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

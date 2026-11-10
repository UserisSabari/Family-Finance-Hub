import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { TransactionForm } from '../transactions/TransactionForm';
import { createTransaction } from '../../features/transactions/transactionRepository';
import { useWorkspace } from '../../hooks/useWorkspace';
import { IconPlus } from '../icons/Icons';
import './quickAddFab.css';

export function QuickAddFab() {
  const { workspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // If already on the transactions page, the page header already has the standard Add Transaction button
  // But on mobile, having the floating action button accessible everywhere is huge
  const handleSave = async (input) => {
    if (!workspace?.id || submitting) return;
    setSubmitting(true);
    setFeedback('');
    try {
      await createTransaction(workspace.id, input);
      setFeedback('Transaction saved.');
      setTimeout(() => {
        setOpen(false);
        setFeedback('');
        // If on transactions or overview, trigger refresh via navigation or reload
        if (location.pathname === '/app/transactions' || location.pathname === '/app') {
          window.dispatchEvent(new CustomEvent('ffh:transaction-saved'));
        }
      }, 500);
    } catch (err) {
      setFeedback(err.message || 'Could not save transaction.');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="quick-fab-btn"
        aria-label="Add transaction"
        title="Add transaction (+)"
        onClick={() => {
          setFeedback('');
          setOpen(true);
        }}
      >
        <IconPlus size={22} />
        <span className="fab-text">Add</span>
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => !submitting && setOpen(false)}>
          <div
            className="transaction-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-add-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 id="quick-add-dialog-title" style={{ margin: 0 }}>Add Transaction</h2>
              <button
                type="button"
                className="action-btn"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.2rem 0.5rem' }}
                onClick={() => !submitting && setOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            {feedback && (
              <p role="status" className="feedback feedback-success" style={{ marginTop: 'var(--space-3)' }}>
                {feedback}
              </p>
            )}

            <TransactionForm
              onSubmit={handleSave}
              onCancel={() => setOpen(false)}
              submitting={submitting}
            />
          </div>
        </div>
      )}
    </>
  );
}

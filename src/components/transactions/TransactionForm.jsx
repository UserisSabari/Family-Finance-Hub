import { useState } from 'react';

import { useFinancialProfile } from '../../hooks/useFinancialProfile';
import { getInitialTransactionValues, normalizeTransactionInput } from '../../features/transactions/transactionForm';

export function TransactionForm({ initialValues, onSubmit, onCancel, submitting }) {
  const profileConfig = useFinancialProfile();
  const [values, setValues] = useState({ ...getInitialTransactionValues(), ...initialValues });
  const [error, setError] = useState('');

  const quickAmounts = profileConfig?.quickAmounts || [10, 20, 50, 100, 200, 500];
  const activeCategories = values.type === 'income'
    ? (profileConfig?.incomeCategories || ['Income', 'Pocket Money', 'Salary', 'Gift'])
    : (profileConfig?.expenseCategories || ['Groceries', 'Food', 'Transport', 'Shopping']);

  const update = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  const setCategoryValue = (cat) => {
    setValues((current) => ({ ...current, category: cat }));
  };

  const addAmountValue = (amt) => {
    setValues((current) => {
      const currentAmt = Number(current.amount) || 0;
      return { ...current, amount: String(currentAmt + amt) };
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await onSubmit(normalizeTransactionInput(values));
    } catch (reason) {
      setError(reason.message || 'Could not save this transaction.');
    }
  };

  return (
    <form className="transaction-form" onSubmit={submit} aria-label="Transaction form">
      <label>
        Type
        <select aria-label="Type" value={values.type} onChange={update('type')} disabled={submitting}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="refund">Refund</option>
          <option value="transfer">Transfer</option>
        </select>
      </label>

      <label>
        Amount
        <input
          aria-label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          value={values.amount}
          onChange={update('amount')}
          placeholder="0.00"
          disabled={submitting}
        />
      </label>

      {/* Quick Amount Pills */}
      <div className="quick-pill-container" aria-label="Quick presets">
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            className="quick-pill-btn"
            onClick={() => addAmountValue(amt)}
            disabled={submitting}
          >
            +₹{amt}
          </button>
        ))}
      </div>

      <label>
        Category
        <input
          aria-label="Category"
          value={values.category}
          onChange={update('category')}
          placeholder="e.g. Groceries, Fuel, Chai"
          disabled={submitting}
        />
      </label>

      {/* Quick Category Chips based on active financial profile */}
      <div className="quick-chip-container" aria-label="Suggested categories">
        {activeCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`quick-chip-btn ${values.category === cat ? 'active' : ''}`}
            onClick={() => setCategoryValue(cat)}
            disabled={submitting}
          >
            {cat}
          </button>
        ))}
      </div>

      <label>
        Date
        <input
          aria-label="Date"
          type="date"
          value={values.date}
          onChange={update('date')}
          disabled={submitting}
        />
      </label>

      <label>
        Note / Description
        <input
          aria-label="Note"
          value={values.note}
          onChange={update('note')}
          placeholder="e.g. Paid via UPI to Sharma Store"
          disabled={submitting}
        />
      </label>

      {values.type === 'transfer' && (
        <label>
          Transfer ID
          <input
            aria-label="Transfer ID"
            value={values.transferId}
            onChange={update('transferId')}
            disabled={submitting}
          />
        </label>
      )}

      {error && <p role="alert" className="feedback feedback-error">{error}</p>}

      <div className="transaction-form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save transaction'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}

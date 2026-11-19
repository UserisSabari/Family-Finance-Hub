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
          <option value="pass_through">Pass-through (paid for someone)</option>
          <option value="transfer">Transfer / Cash Swap</option>
        </select>
      </label>

      {values.type !== 'transfer' ? (
        <label>
          Payment Mode / Account
          <select aria-label="Payment account" value={values.account || 'bank'} onChange={update('account')} disabled={submitting}>
            <option value="bank">Bank / UPI / Card</option>
            <option value="cash">Cash in hand</option>
          </select>
        </label>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <label>
            From
            <select aria-label="From account" value={values.fromAccount || 'bank'} onChange={update('fromAccount')} disabled={submitting}>
              <option value="bank">Bank / UPI</option>
              <option value="cash">Cash in hand</option>
            </select>
          </label>
          <label>
            To
            <select aria-label="To account" value={values.toAccount || 'cash'} onChange={update('toAccount')} disabled={submitting}>
              <option value="cash">Cash in hand</option>
              <option value="bank">Bank / UPI</option>
            </select>
          </label>
        </div>
      )}

      {values.type === 'pass_through' && (
        <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-subtle)', marginBottom: 'var(--space-3)' }}>
          <label style={{ marginBottom: '0.5rem' }}>
            Paid For (Friend / Relative)
            <input
              aria-label="Paid for"
              value={values.passThroughFor || ''}
              onChange={update('passThroughFor')}
              placeholder="e.g. Rahul, Current bill, Mobile recharge"
              disabled={submitting}
            />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
            <input
              type="checkbox"
              aria-label="Reimbursed"
              checked={Boolean(values.isSettled)}
              onChange={(e) => setValues((curr) => ({ ...curr, isSettled: e.target.checked }))}
              disabled={submitting}
            />
            <span style={{ fontSize: '0.85rem' }}>Already reimbursed back to me</span>
          </label>
        </div>
      )}

      <label>
        Amount
        <div className="amount-input-hero">
          <span className="amount-hero-currency">₹</span>
          <input
            aria-label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            value={values.amount}
            onChange={update('amount')}
            placeholder="0.00"
            disabled={submitting}
            className="amount-hero-field"
          />
        </div>
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
        Time
        <input
          aria-label="Time"
          type="time"
          value={values.time || ''}
          onChange={update('time')}
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

      {values.type === 'expense' && (
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.85rem', marginBottom: 'var(--space-4)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
            <input
              type="checkbox"
              aria-label="Split with group"
              checked={Boolean(values.splitNote?.isGroup)}
              onChange={(e) => {
                const isGroup = e.target.checked;
                if (!isGroup) {
                  setValues((curr) => {
                    const next = { ...curr };
                    delete next.splitNote;
                    return next;
                  });
                } else {
                  const total = Number(values.amount) || 0;
                  setValues((curr) => ({
                    ...curr,
                    splitNote: {
                      isGroup: true,
                      splitMode: 'equal',
                      totalBill: total,
                      myShare: total > 0 ? Math.round((total / 2) * 100) / 100 : 0,
                      members: [
                        { name: 'Self', share: total > 0 ? Math.round((total / 2) * 100) / 100 : 0, settled: true },
                        { name: 'Friend 1', share: total > 0 ? Math.round((total / 2) * 100) / 100 : 0, settled: false },
                      ],
                    },
                  }));
                }
              }}
              disabled={submitting}
            />
            <span>👥 Split with friends / group</span>
          </label>

          {values.splitNote?.isGroup && (
            <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.6rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${values.splitNote.splitMode === 'equal' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    const total = Number(values.amount) || 0;
                    const membersCount = values.splitNote.members.length || 1;
                    const perShare = Math.round((total / membersCount) * 100) / 100;
                    setValues((curr) => ({
                      ...curr,
                      splitNote: {
                        ...curr.splitNote,
                        splitMode: 'equal',
                        myShare: perShare,
                        members: curr.splitNote.members.map((m) => ({ ...m, share: perShare })),
                      },
                    }));
                  }}
                >
                  Equal Split
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${values.splitNote.splitMode === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setValues((curr) => ({
                    ...curr,
                    splitNote: { ...curr.splitNote, splitMode: 'custom' },
                  }))}
                >
                  Custom Amounts
                </button>
              </div>

              <div style={{ display: 'grid', gap: '0.4rem', marginTop: '0.4rem' }}>
                {values.splitNote.members.map((member, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      style={{ flex: 1, minWidth: '6rem' }}
                      value={member.name}
                      placeholder="Name"
                      disabled={submitting || idx === 0}
                      onChange={(e) => {
                        const val = e.target.value;
                        setValues((curr) => {
                          const members = [...curr.splitNote.members];
                          members[idx] = { ...members[idx], name: val };
                          return { ...curr, splitNote: { ...curr.splitNote, members } };
                        });
                      }}
                    />
                    <input
                      style={{ width: '5.5rem' }}
                      type="number"
                      step="0.01"
                      value={member.share}
                      placeholder="₹"
                      disabled={submitting || values.splitNote.splitMode === 'equal'}
                      onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setValues((curr) => {
                          const members = [...curr.splitNote.members];
                          members[idx] = { ...members[idx], share: val };
                          return {
                            ...curr,
                            splitNote: {
                              ...curr.splitNote,
                              myShare: idx === 0 ? val : curr.splitNote.myShare,
                              members,
                            },
                          };
                        });
                      }}
                    />
                    {idx > 0 && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', margin: 0 }}>
                        <input
                          type="checkbox"
                          checked={member.settled}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setValues((curr) => {
                              const members = [...curr.splitNote.members];
                              members[idx] = { ...members[idx], settled: checked };
                              return { ...curr, splitNote: { ...curr.splitNote, members } };
                            });
                          }}
                          disabled={submitting}
                        />
                        Settled
                      </label>
                    )}
                    {idx > 1 && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => {
                          setValues((curr) => {
                            const members = curr.splitNote.members.filter((_, i) => i !== idx);
                            const total = Number(curr.amount) || 0;
                            const perShare = Math.round((total / (members.length || 1)) * 100) / 100;
                            return {
                              ...curr,
                              splitNote: {
                                ...curr.splitNote,
                                myShare: perShare,
                                members: curr.splitNote.splitMode === 'equal'
                                  ? members.map((m) => ({ ...m, share: perShare }))
                                  : members,
                              },
                            };
                          });
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ justifySelf: 'start', marginTop: '0.25rem' }}
                  onClick={() => {
                    setValues((curr) => {
                      const total = Number(curr.amount) || 0;
                      const newMembers = [...curr.splitNote.members, { name: `Friend ${curr.splitNote.members.length}`, share: 0, settled: false }];
                      const perShare = Math.round((total / newMembers.length) * 100) / 100;
                      return {
                        ...curr,
                        splitNote: {
                          ...curr.splitNote,
                          myShare: curr.splitNote.splitMode === 'equal' ? perShare : curr.splitNote.myShare,
                          members: curr.splitNote.splitMode === 'equal'
                            ? newMembers.map((m) => ({ ...m, share: perShare }))
                            : newMembers,
                        },
                      };
                    });
                  }}
                  disabled={submitting}
                >
                  + Add friend
                </button>

                {values.splitNote.splitMode === 'custom' && (
                  <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {(() => {
                      const totalBill = Number(values.amount) || 0;
                      const allocated = values.splitNote.members.reduce((sum, m) => sum + Number(m.share || 0), 0);
                      const diff = Math.round((totalBill - allocated) * 100) / 100;
                      if (diff === 0) return <span style={{ color: 'var(--color-income)', fontWeight: 600 }}>✓ Fully allocated (₹{totalBill})</span>;
                      if (diff > 0) return <span style={{ color: '#d97706', fontWeight: 600 }}>⚠️ ₹{diff} unallocated (Total: ₹{totalBill})</span>;
                      return <span style={{ color: 'var(--color-expense)', fontWeight: 600 }}>⚠️ Over-allocated by ₹{Math.abs(diff)}</span>;
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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

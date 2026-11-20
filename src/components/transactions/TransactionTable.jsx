import { formatInr } from '../../lib/format/currency';
import { normalizeDateString } from '../../lib/format/dates';
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconEdit,
  IconPassthrough,
  IconTransfer,
  IconTrash,
} from '../icons/Icons';

export function TransactionTable({ transactions, onEdit, onDelete }) {
  return (
    <div className="transaction-table-wrap">
      {/* Mobile Card List (Mobile Banking Feed Style) */}
      <div className="transaction-mobile-list" role="feed" aria-label="Transactions mobile list">
        {transactions.map((transaction) => {
          const isIncome = transaction.type === 'income';
          const isExpense = transaction.type === 'expense';
          const isTransfer = transaction.type === 'transfer';
          const isPassThrough = transaction.type === 'pass_through';
          const displayDate = typeof transaction.date === 'string' ? transaction.date : normalizeDateString(transaction.date);

          return (
            <article key={transaction.id} className={`transaction-mobile-card tx-feed-${transaction.type}`}>
              <div className="tx-mobile-header-row">
                <div className="tx-mobile-left-col">
                  <div className={`tx-feed-squircle tx-squircle-${transaction.type}`} aria-hidden="true">
                    {isIncome ? (
                      <IconArrowUpRight size={18} />
                    ) : isTransfer ? (
                      <IconTransfer size={18} />
                    ) : isPassThrough ? (
                      <IconPassthrough size={18} />
                    ) : (
                      <IconArrowDownLeft size={18} />
                    )}
                  </div>
                  <div className="tx-mobile-title-block">
                    <span className="tx-mobile-category">
                      {transaction.note || transaction.category || 'Transaction'}
                    </span>
                    <div className="tx-mobile-meta-tags">
                      <span className="tx-meta-date">{displayDate}</span>
                      {transaction.category && transaction.note && (
                        <span className="tx-meta-badge">{transaction.category}</span>
                      )}
                      {transaction.account === 'cash' && (
                        <span className="badge-account">Cash</span>
                      )}
                      {isTransfer && (transaction.fromAccount || transaction.toAccount) && (
                        <span className="badge-account">{transaction.fromAccount || 'Bank'} → {transaction.toAccount || 'Cash'}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="tx-mobile-right-col">
                  <span className={`tx-mobile-amount ${isIncome ? 'amount-income' : isExpense ? 'amount-expense' : ''}`}>
                    {isIncome ? '+' : isExpense ? '-' : ''}
                    {formatInr(transaction.amount)}
                  </span>
                  <small className="tx-feed-type-sub">
                    {isIncome ? 'Credit' : isTransfer ? 'Transfer' : isPassThrough ? 'Pass-through' : 'Debit'}
                  </small>
                </div>
              </div>

              {isPassThrough && (
                <div className="tx-mobile-detail-pill">
                  {transaction.passThroughFor && <span>For: {transaction.passThroughFor}</span>}
                  <span className={`badge-account ${transaction.isSettled ? 'badge-settled' : 'badge-pending'}`}>
                    {transaction.isSettled ? '✓ Reimbursed' : '⏳ Pending return'}
                  </span>
                </div>
              )}

              {transaction.splitNote?.isGroup && (
                <div className="tx-mobile-detail-pill">
                  <span>👥 Split: {formatInr(transaction.splitNote.myShare)} (my share) of {formatInr(transaction.amount)}</span>
                </div>
              )}

              <div className="tx-mobile-actions-bar">
                <div className="tx-mobile-time">
                  {transaction.time && <span>{transaction.time}</span>}
                </div>
                <div className="transaction-actions">
                  <button
                    type="button"
                    className="action-btn edit-btn"
                    title="Edit transaction"
                    onClick={() => onEdit(transaction)}
                  >
                    <IconEdit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="action-btn delete-btn"
                    aria-label={`Delete ${transaction.note || transaction.category}`}
                    title="Delete transaction"
                    onClick={() => onDelete(transaction)}
                  >
                    <IconTrash size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Desktop Table (shown on tablets & desktops) */}
      <table className="transaction-table transaction-desktop-table">
        <caption className="sr-only">Transactions</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>Note</th>
            <th>Amount</th>
            <th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const isIncome = transaction.type === 'income';
            const isExpense = transaction.type === 'expense';
            const displayDate = typeof transaction.date === 'string' ? transaction.date : normalizeDateString(transaction.date);

            return (
              <tr key={transaction.id}>
                <td style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
                  {displayDate}{transaction.time ? <><br/><small>{transaction.time}</small></> : ''}
                </td>
                <td>
                  <span className={`transaction-type-badge badge-${transaction.type}`}>
                    {transaction.type === 'pass_through' ? 'Pass-through' : transaction.type}
                  </span>
                  {transaction.account === 'cash' && (
                    <span className="badge-account" style={{ marginLeft: '0.35rem' }}>Cash</span>
                  )}
                  {transaction.type === 'transfer' && (transaction.fromAccount || transaction.toAccount) && (
                    <span className="badge-account" style={{ marginLeft: '0.35rem' }}>
                      {transaction.fromAccount || 'Bank'} → {transaction.toAccount || 'Cash'}
                    </span>
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>
                  {transaction.category || 'General'}
                  {transaction.type === 'pass_through' && (
                    <div style={{ marginTop: '0.2rem' }}>
                      <span className={`badge-account ${transaction.isSettled ? 'badge-settled' : 'badge-pending'}`} style={{ fontSize: '0.7rem' }}>
                        {transaction.isSettled ? '✓ Reimbursed' : '⏳ Pending'}
                      </span>
                    </div>
                  )}
                  {transaction.splitNote?.isGroup && (
                    <div style={{ marginTop: '0.2rem', fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 400 }}>
                      👥 Split: {formatInr(transaction.splitNote.myShare)} (my share)
                    </div>
                  )}
                </td>
                <td style={{ color: 'var(--color-muted)' }}>
                  {transaction.note || (transaction.passThroughFor ? `For: ${transaction.passThroughFor}` : '—')}
                </td>
                <td style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                  <span className={isIncome ? 'amount-income' : isExpense ? 'amount-expense' : ''}>
                    {isIncome ? '+' : isExpense ? '-' : ''}
                    {formatInr(transaction.amount)}
                  </span>
                </td>
                <td className="transaction-actions">
                  <button
                    type="button"
                    className="action-btn edit-btn"
                    title="Edit transaction"
                    onClick={() => onEdit(transaction)}
                  >
                    <IconEdit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="action-btn delete-btn"
                    aria-label={`Delete ${transaction.note || transaction.category}`}
                    title="Delete transaction"
                    onClick={() => onDelete(transaction)}
                  >
                    <IconTrash size={14} />
                    <span>Delete</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

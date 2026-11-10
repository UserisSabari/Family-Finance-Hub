import { formatInr } from '../../lib/format/currency';
import { normalizeDateString } from '../../lib/format/dates';
import { IconEdit, IconTrash } from '../icons/Icons';

export function TransactionTable({ transactions, onEdit, onDelete }) {
  return (
    <div className="transaction-table-wrap">
      {/* Mobile Card List (shown on mobile screens) */}
      <div className="transaction-mobile-list" role="feed" aria-label="Transactions mobile list">
        {transactions.map((transaction) => {
          const isIncome = transaction.type === 'income';
          const isExpense = transaction.type === 'expense';
          const displayDate = typeof transaction.date === 'string' ? transaction.date : normalizeDateString(transaction.date);

          return (
            <article key={transaction.id} className="transaction-mobile-card">
              <div className="tx-mobile-top">
                <div className="tx-mobile-info">
                  <span className={`transaction-type-badge badge-${transaction.type}`}>
                    {transaction.type}
                  </span>
                  <span className="tx-mobile-category">{transaction.category || 'General'}</span>
                </div>
                <span className={`tx-mobile-amount ${isIncome ? 'amount-income' : isExpense ? 'amount-expense' : ''}`}>
                  {isIncome ? '+' : isExpense ? '-' : ''}
                  {formatInr(transaction.amount)}
                </span>
              </div>

              {transaction.note && (
                <p className="tx-mobile-note">{transaction.note}</p>
              )}

              <div className="tx-mobile-bottom">
                <span className="tx-mobile-date">{displayDate}</span>
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
                <td style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{displayDate}</td>
                <td>
                  <span className={`transaction-type-badge badge-${transaction.type}`}>
                    {transaction.type}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{transaction.category || 'General'}</td>
                <td style={{ color: 'var(--color-muted)' }}>{transaction.note || '—'}</td>
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

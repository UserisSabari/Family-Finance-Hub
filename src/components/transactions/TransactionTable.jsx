import { formatInr } from '../../lib/format/currency';
import { IconEdit, IconTrash } from '../icons/Icons';

export function TransactionTable({ transactions, onEdit, onDelete }) {
  return (
    <div className="transaction-table-wrap">
      <table className="transaction-table">
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
            const isRefund = transaction.type === 'refund';
            const isTransfer = transaction.type === 'transfer';

            return (
              <tr key={transaction.id}>
                <td style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{transaction.date}</td>
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

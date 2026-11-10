import { formatInr } from '../../lib/format/currency';
import { normalizeDateString } from '../../lib/format/dates';

export function TransactionPreview({ transaction }) {
  const sign = transaction.type === 'income' ? '+' : '-';
  const displayDate = typeof transaction.date === 'string' ? transaction.date : normalizeDateString(transaction.date);
  return (
    <li className="transaction-preview">
      <span>
        <strong>{transaction.note || transaction.category || 'Transaction'}</strong>
        <small>{displayDate || 'Date unavailable'}</small>
      </span>
      <span className={transaction.type === 'income' ? 'amount-income' : 'amount-expense'}>
        {sign}{formatInr(transaction.amount)}
      </span>
    </li>
  );
}

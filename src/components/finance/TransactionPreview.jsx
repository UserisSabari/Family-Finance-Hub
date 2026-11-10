import { formatInr } from '../../lib/format/currency';

export function TransactionPreview({ transaction }) {
  const sign = transaction.type === 'income' ? '+' : '-';
  return <li className="transaction-preview">
    <span><strong>{transaction.note || transaction.category || 'Transaction'}</strong><small>{transaction.date || 'Date unavailable'}</small></span>
    <span className={transaction.type === 'income' ? 'amount-income' : 'amount-expense'}>{sign}{formatInr(transaction.amount)}</span>
  </li>;
}

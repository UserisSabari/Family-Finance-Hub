import { formatInr } from '../../lib/format/currency';
import { normalizeDateString } from '../../lib/format/dates';
import { IconArrowDownLeft, IconArrowUpRight, IconTransfer, IconWallet } from '../icons/Icons';

export function TransactionPreview({ transaction }) {
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';
  const sign = isIncome ? '+' : (isTransfer ? '' : '-');
  const typeLabel = isIncome ? 'Credit' : (isTransfer ? 'Transfer' : 'Debit');
  const displayDate = typeof transaction.date === 'string' ? transaction.date : normalizeDateString(transaction.date);

  return (
    <li className={`transaction-preview tx-type-${transaction.type || 'expense'}`}>
      <div className="tx-preview-icon-wrap" aria-hidden="true">
        {isIncome ? (
          <IconArrowUpRight size={18} className="tx-icon-income" />
        ) : isTransfer ? (
          <IconTransfer size={18} className="tx-icon-transfer" />
        ) : (
          <IconArrowDownLeft size={18} className="tx-icon-expense" />
        )}
      </div>

      <div className="transaction-preview-details">
        <strong className="transaction-preview-title">
          {transaction.note || transaction.category || 'Transaction'}
        </strong>
        <small className="tx-preview-date">{displayDate || 'Date unavailable'}</small>
      </div>

      <div className="tx-preview-amount-block">
        <span className={isIncome ? 'amount-income' : 'amount-expense'}>
          {sign}{formatInr(transaction.amount)}
        </span>
        <small className="tx-preview-type-sub">{typeLabel}</small>
      </div>
    </li>
  );
}

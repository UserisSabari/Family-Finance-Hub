import { validateTransaction } from '../../lib/finance/validation';

export function getInitialTransactionValues(today = new Date()) {
  const date = today instanceof Date ? today : new Date(today);
  const iso = Number.isNaN(date.getTime())
    ? new Date().toLocaleDateString('en-CA')
    : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return {
    type: 'expense',
    amount: '',
    category: '',
    date: iso,
    note: '',
    transferId: '',
  };
}

export function normalizeTransactionInput(input = {}) {
  const normalized = {
    type: input.type,
    amount: typeof input.amount === 'string' && input.amount.trim() ? Number(input.amount) : input.amount,
    category: typeof input.category === 'string' ? input.category.trim() : input.category,
    date: input.date,
    note: typeof input.note === 'string' ? input.note.trim() : '',
  };
  if (input.transferId?.trim()) normalized.transferId = input.transferId.trim();
  const result = validateTransaction(normalized);
  if (!result.valid) throw new Error(Object.values(result.errors).join(' '));
  return normalized;
}

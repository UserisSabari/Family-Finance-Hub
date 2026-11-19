import { validateTransaction } from '../../lib/finance/validation';

export function getInitialTransactionValues(today = new Date()) {
  const date = today instanceof Date ? today : new Date(today);
  const iso = Number.isNaN(date.getTime())
    ? new Date().toLocaleDateString('en-CA')
    : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const src = Number.isNaN(date.getTime()) ? new Date() : date;
  const time = `${String(src.getHours()).padStart(2, '0')}:${String(src.getMinutes()).padStart(2, '0')}`;
  return {
    type: 'expense',
    account: 'bank',
    amount: '',
    category: '',
    date: iso,
    time,
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
  if (input.isPassThrough !== undefined) normalized.isPassThrough = Boolean(input.isPassThrough);
  if (input.splitWith?.trim()) {
    normalized.splitWith = input.splitWith.trim();
    if (input.splitAmount !== undefined && input.splitAmount !== '') {
      const parsedSplit = typeof input.splitAmount === 'string' ? Number(input.splitAmount) : input.splitAmount;
      if (Number.isFinite(parsedSplit) && parsedSplit > 0) {
        normalized.splitAmount = parsedSplit;
      }
    }
    if (input.splitSettled !== undefined) {
      normalized.splitSettled = Boolean(input.splitSettled);
    }
  }
  if (input.splitNote && typeof input.splitNote === 'object') {
    const raw = input.splitNote;
    const members = Array.isArray(raw.members)
      ? raw.members.map((m) => ({
          name: String(m.name || '').trim() || 'Friend',
          share: Number(m.share) > 0 ? Number(m.share) : 0,
          settled: Boolean(m.settled),
        }))
      : [];
    normalized.splitNote = {
      isGroup: Boolean(raw.isGroup !== false),
      splitMode: raw.splitMode === 'custom' ? 'custom' : 'equal',
      totalBill: Number(raw.totalBill) > 0 ? Number(raw.totalBill) : Number(normalized.amount) || 0,
      myShare: Number(raw.myShare) >= 0 ? Number(raw.myShare) : (Number(normalized.amount) || 0),
      members,
    };
  }
  // Preserve time (HH:mm) if provided; omitted when absent for backward compat
  if (typeof input.time === 'string' && /^\d{2}:\d{2}$/.test(input.time.trim())) {
    normalized.time = input.time.trim();
  }
  if (input.account) {
    normalized.account = input.account === 'cash' ? 'cash' : 'bank';
  }
  if (input.fromAccount) {
    normalized.fromAccount = input.fromAccount === 'cash' ? 'cash' : 'bank';
  }
  if (input.toAccount) {
    normalized.toAccount = input.toAccount === 'cash' ? 'cash' : 'bank';
  }
  if (typeof input.passThroughFor === 'string' && input.passThroughFor.trim()) {
    normalized.passThroughFor = input.passThroughFor.trim();
  }
  if (input.isSettled !== undefined) {
    normalized.isSettled = Boolean(input.isSettled);
  }
  if (input.settledAccount) {
    normalized.settledAccount = input.settledAccount === 'cash' ? 'cash' : 'bank';
  }
  const result = validateTransaction(normalized);
  if (!result.valid) throw new Error(Object.values(result.errors).join(' '));
  return normalized;
}

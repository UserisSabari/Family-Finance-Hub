function amount(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

function expenseValue(transaction) {
  if (transaction?.type === 'expense') return amount(transaction.amount);
  if (transaction?.type === 'refund') return -amount(transaction.amount);
  return 0;
}

function inRange(date, range) {
  return typeof date === 'string' && (!range?.start || date >= range.start) && (!range?.end || date <= range.end);
}

export function buildCategoryBreakdown(transactions = [], range) {
  const totals = new Map();
  transactions.forEach((transaction) => {
    if (!inRange(transaction?.date, range)) return;
    const value = expenseValue(transaction);
    if (!value || !transaction.category) return;
    totals.set(transaction.category, (totals.get(transaction.category) || 0) + value);
  });
  return [...totals.entries()]
    .map(([category, value]) => ({ category, amount: Math.round(Math.max(0, value) * 100) / 100 }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export function buildTrend(transactions = [], range) {
  const totals = new Map();
  transactions.forEach((transaction) => {
    if (!inRange(transaction?.date, range)) return;
    const value = expenseValue(transaction);
    if (!value || typeof transaction.date !== 'string') return;
    const period = transaction.date.slice(0, 7);
    totals.set(period, (totals.get(period) || 0) + value);
  });
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, value]) => ({ period, amount: Math.round(Math.max(0, value) * 100) / 100 }));
}

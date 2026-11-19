function amount(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

function expenseValue(transaction) {
  if (transaction?.type === 'expense') {
    if (transaction?.splitNote?.myShare !== undefined && Number.isFinite(Number(transaction.splitNote.myShare))) {
      return amount(transaction.splitNote.myShare);
    }
    return amount(transaction.amount);
  }
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

export function buildPaymentModeBreakdown(transactions = [], range) {
  let bank = 0;
  let cash = 0;
  transactions.forEach((tx) => {
    if (!inRange(tx?.date, range)) return;
    const value = expenseValue(tx);
    if (!value) return;
    if (tx.account === 'cash') cash += value;
    else bank += value;
  });
  const total = bank + cash;
  return {
    bank: Math.round(bank * 100) / 100,
    cash: Math.round(cash * 100) / 100,
    total: Math.round(total * 100) / 100,
    bankPercentage: total ? Math.round((bank / total) * 100) : 0,
    cashPercentage: total ? Math.round((cash / total) * 100) : 0,
  };
}

export function calculateSpendVelocity(transactions = [], range) {
  let total = 0;
  let count = 0;
  const dayTotals = new Map();

  transactions.forEach((tx) => {
    if (!inRange(tx?.date, range)) return;
    const value = expenseValue(tx);
    if (value > 0 && tx.date) {
      total += value;
      count += 1;
      dayTotals.set(tx.date, (dayTotals.get(tx.date) || 0) + value);
    }
  });

  const activeDays = dayTotals.size || 1;
  const dailyAverage = Math.round((total / activeDays) * 100) / 100;
  let highestSpendDay = null;
  let highestSpendAmount = 0;

  for (const [day, dayAmount] of dayTotals.entries()) {
    if (dayAmount > highestSpendAmount) {
      highestSpendAmount = dayAmount;
      highestSpendDay = day;
    }
  }

  return {
    totalSpend: Math.round(total * 100) / 100,
    transactionCount: count,
    dailyAverage,
    highestSpendDay,
    highestSpendAmount: Math.round(highestSpendAmount * 100) / 100,
  };
}

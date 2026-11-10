function amount(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

function inMonth(date, year, month) {
  if (typeof date !== 'string') return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.getUTCFullYear() === year && parsed.getUTCMonth() + 1 === month;
}

export function calculateBudget(budget = {}, transactions = []) {
  const year = Number(budget.year);
  const month = Number(budget.month);
  const actual = transactions.reduce((total, transaction) => {
    if (!transaction || !inMonth(transaction.date, year, month)) return total;
    if (budget.category && transaction.category !== budget.category) return total;
    if (transaction.type === 'expense') return total + amount(transaction.amount);
    if (transaction.type === 'refund') return total - amount(transaction.amount);
    return total;
  }, 0);
  const roundedActual = Math.round(Math.max(0, actual) * 100) / 100;
  const budgetAmount = amount(budget.amount);
  const percentageUsed = budgetAmount ? Math.round((roundedActual / budgetAmount) * 10000) / 100 : 0;
  return {
    budget: budgetAmount,
    actual: roundedActual,
    remaining: Math.round((budgetAmount - roundedActual) * 100) / 100,
    percentageUsed,
    threshold: percentageUsed > 100 ? 'overspent' : percentageUsed >= 80 ? 'warning' : 'healthy',
  };
}

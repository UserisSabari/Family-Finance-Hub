function positiveAmount(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

export function calculateSummary(transactions = [], contributions = []) {
  let income = 0;
  let expenses = 0;

  for (const transaction of transactions) {
    if (!transaction) continue;
    const amount = positiveAmount(transaction.amount);
    if (transaction.type === 'income') income += amount;
    if (transaction.type === 'expense') expenses += amount;
    if (transaction.type === 'refund') expenses -= amount;
  }

  const savings = contributions.reduce(
    (total, contribution) => total + positiveAmount(contribution?.amount),
    0,
  );
  const rounded = (value) => Math.round(value * 100) / 100;
  income = rounded(income);
  expenses = rounded(Math.max(0, expenses));
  const balance = rounded(income - expenses);
  return {
    income,
    expenses,
    balance,
    savings: rounded(savings),
    savingsRate: income ? rounded((savings / income) * 100) : 0,
  };
}

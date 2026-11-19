function positiveAmount(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

export function calculateSummary(transactions = [], contributions = []) {
  let income = 0;
  let expenses = 0;

  for (const transaction of transactions) {
    if (!transaction) continue;
    let amount = positiveAmount(transaction.amount);
    if (transaction.type === 'income') income += amount;
    if (transaction.type === 'expense') {
      if (transaction.splitNote?.myShare !== undefined && Number.isFinite(Number(transaction.splitNote.myShare))) {
        amount = positiveAmount(transaction.splitNote.myShare);
      }
      expenses += amount;
    }
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

export function calculateAccountBalances(transactions = []) {
  let bank = 0;
  let cash = 0;
  let pendingReceivables = 0;

  for (const tx of transactions) {
    if (!tx) continue;
    const amount = positiveAmount(tx.amount);
    const acc = tx.account === 'cash' ? 'cash' : 'bank';

    if (tx.type === 'income') {
      if (acc === 'cash') cash += amount;
      else bank += amount;
    } else if (tx.type === 'expense') {
      if (acc === 'cash') cash -= amount;
      else bank -= amount;

      if (tx.splitNote?.members && Array.isArray(tx.splitNote.members)) {
        for (const member of tx.splitNote.members) {
          if (member.name === 'Self') continue;
          const share = positiveAmount(member.share);
          if (member.settled) {
            const settledAcc = member.settledAccount || acc;
            if (settledAcc === 'cash') cash += share;
            else bank += share;
          } else {
            pendingReceivables += share;
          }
        }
      }
    } else if (tx.type === 'refund') {
      if (acc === 'cash') cash += amount;
      else bank += amount;
    } else if (tx.type === 'transfer') {
      const from = tx.fromAccount || (tx.account === 'cash' ? 'cash' : 'bank');
      const to = tx.toAccount || (from === 'bank' ? 'cash' : 'bank');
      if (from === 'bank') bank -= amount;
      else cash -= amount;

      if (to === 'bank') bank += amount;
      else cash += amount;
    } else if (tx.type === 'pass_through') {
      if (acc === 'cash') cash -= amount;
      else bank -= amount;

      if (tx.isSettled) {
        const settledAcc = tx.settledAccount || acc;
        if (settledAcc === 'cash') cash += amount;
        else bank += amount;
      } else {
        pendingReceivables += amount;
      }
    }
  }

  const rounded = (val) => Math.round(val * 100) / 100;
  return {
    bank: rounded(bank),
    cash: rounded(cash),
    total: rounded(bank + cash),
    pendingReceivables: rounded(pendingReceivables),
  };
}

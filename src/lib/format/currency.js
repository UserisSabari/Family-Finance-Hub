const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatInr(amount) {
  const value = Number(amount);
  return inrFormatter.format(Number.isFinite(value) ? value : 0);
}

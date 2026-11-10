const TRANSACTION_TYPES = new Set(['income', 'expense', 'refund', 'transfer']);

function isValidDate(value) {
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function positiveAmount(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function validateTransaction(input = {}) {
  const errors = {};
  if (!positiveAmount(input.amount)) errors.amount = 'Amount must be greater than zero.';
  if (!TRANSACTION_TYPES.has(input.type)) errors.type = 'Transaction type is invalid.';
  if (typeof input.category !== 'string' || !input.category.trim()) {
    errors.category = 'Category is required.';
  }
  if (!isValidDate(input.date)) errors.date = 'Date must be valid.';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateContribution(input = {}) {
  const errors = {};
  if (typeof input.goalId !== 'string' || !input.goalId.trim()) errors.goalId = 'Goal is required.';
  if (!positiveAmount(input.amount)) errors.amount = 'Amount must be greater than zero.';
  if (!isValidDate(input.date)) errors.date = 'Date must be valid.';
  return { valid: Object.keys(errors).length === 0, errors };
}

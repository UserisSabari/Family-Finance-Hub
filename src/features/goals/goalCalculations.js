function amount(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function calculateGoalProgress(goal = {}, contributions = []) {
  const target = amount(goal.targetAmount);
  const contributed = Math.round(contributions.reduce((total, item) => total + amount(item?.amount), 0) * 100) / 100;
  return {
    contributed,
    remaining: Math.max(0, Math.round((target - contributed) * 100) / 100),
    percentage: target ? Math.min(100, Math.round((contributed / target) * 10000) / 100) : 0,
    completed: target > 0 && contributed >= target,
  };
}

export function validateGoal(input = {}) {
  const errors = {};
  if (typeof input.name !== 'string' || !input.name.trim()) errors.name = 'Name is required.';
  if (!amount(input.targetAmount)) errors.targetAmount = 'Target must be greater than zero.';
  if (!isValidDate(input.deadline)) errors.deadline = 'Deadline must be valid.';
  return { valid: Object.keys(errors).length === 0, errors };
}

const KOLKATA_OFFSET_MINUTES = 330;

export function getMonthRange(year, month) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('Month must be an integer from 1 to 12.');
  }

  const start = new Date(Date.UTC(year, month - 1, 1) - KOLKATA_OFFSET_MINUTES * 60 * 1000);
  const end = new Date(Date.UTC(year, month, 1) - KOLKATA_OFFSET_MINUTES * 60 * 1000);
  return { start, end };
}

export function formatDateInKolkata(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
  }).format(date);
}

export function normalizeDateString(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value?.toDate === 'function') {
    try {
      return value.toDate().toISOString().slice(0, 10);
    } catch {
      return '';
    }
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);
  }
  if (typeof value === 'object' && typeof value.seconds === 'number') {
    try {
      return new Date(value.seconds * 1000).toISOString().slice(0, 10);
    } catch {
      return '';
    }
  }
  return '';
}

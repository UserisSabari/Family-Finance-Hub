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

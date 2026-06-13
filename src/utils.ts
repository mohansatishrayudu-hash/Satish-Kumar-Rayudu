/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Gets the current or provided date formatted as YYYY-MM-DD in Asia/Kolkata (IST) timezone.
 */
export function getISTDateString(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  return `${year}-${month}-${day}`;
}

/**
 * Calculates a date relative to today (Kolkata timezone) minus `days` and formats as YYYY-MM-DD.
 */
export function getDaysAgoIST(days: number): string {
  const date = new Date();
  // Adjust day relative to the current local date
  date.setDate(date.getDate() - days);
  return getISTDateString(date);
}

/**
 * Gets the first day of the current month formatted as YYYY-MM-DD in Asia/Kolkata (IST).
 */
export function getISTFirstDayOfMonth(): string {
  const date = new Date();
  const istStr = getISTDateString(date);
  const [year, month] = istStr.split("-");
  return `${year}-${month}-01`;
}

/**
 * Gets the last day of the current month formatted as YYYY-MM-DD in Asia/Kolkata (IST).
 */
export function getISTLastDayOfMonth(): string {
  const date = new Date();
  const istStr = getISTDateString(date);
  const [year, month] = istStr.split("-");
  const y = parseInt(year);
  const m = parseInt(month);
  // Get last day of that month
  const lastDay = new Date(y, m, 0).getDate();
  return `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
}

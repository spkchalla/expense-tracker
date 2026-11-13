/**
 * Date and Month utilities
 */

export function getCurrentMonthString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function parseMonthString(monthStr) {
  if (!monthStr || !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthStr)) {
    return getCurrentMonthString();
  }
  return monthStr;
}

export function getMonthDateRange(monthStr) {
  const [yearStr, mStr] = parseMonthString(monthStr).split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(mStr, 10) - 1; // 0-indexed

  // Start of month: Year-Month-01 00:00:00.000 UTC
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  // End of month: Last day of month 23:59:59.999 UTC
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

  return { start, end };
}

export function getPreviousMonthString(monthStr) {
  const [yearStr, mStr] = parseMonthString(monthStr).split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(mStr, 10) - 1; // 1-12 -> 0-11
  month -= 1;
  if (month < 0) {
    month = 11;
    year -= 1;
  }
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

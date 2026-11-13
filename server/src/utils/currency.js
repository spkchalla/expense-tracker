/**
 * Currency utility functions for integer minor units (paise)
 * 1 INR = 100 paise
 */

export function rupeesToPaise(rupees) {
  if (typeof rupees === 'string') {
    rupees = parseFloat(rupees.trim());
  }
  if (typeof rupees !== 'number' || isNaN(rupees)) {
    throw new Error('Invalid rupee amount');
  }
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise) {
  if (typeof paise !== 'number' || isNaN(paise)) return 0;
  return paise / 100;
}

export function formatCurrency(paise, currency = 'INR', locale = 'en-IN') {
  const amount = paiseToRupees(paise);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

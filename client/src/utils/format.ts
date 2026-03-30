/**
 * Format a number as EGP currency.
 * Arabic: uses Arabic-Indic numerals (٠–٩) with Arabic locale.
 * English: uses Latin numerals with en-EG locale.
 */
export function formatCurrency(amount: number, lang: string): string {
  const locale = lang === 'ar' ? 'ar-EG' : 'en-EG';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date string.
 * Arabic: uses Arabic-Indic numerals and Arabic month names.
 */
export function formatDate(dateStr: string, lang: string): string {
  if (!dateStr) return '—';
  try {
    const locale = lang === 'ar' ? 'ar-EG' : 'en-EG';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/**
 * Format a plain number in locale numerals (no currency symbol).
 */
export function formatNumber(value: number, lang: string): string {
  const locale = lang === 'ar' ? 'ar-EG' : 'en-EG';
  return new Intl.NumberFormat(locale).format(value);
}

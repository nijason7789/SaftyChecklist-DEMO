/**
 * Utility functions for number formatting and manipulation
 */

/**
 * Format a number with commas as thousands separators
 * @param num Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format a number as currency
 * @param amount Amount to format
 * @param currency Currency code (default: USD)
 * @param locale Locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format a number as a percentage
 * @param value Value to format as percentage
 * @param decimals Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Round a number to a specified number of decimal places
 * @param value Value to round
 * @param decimals Number of decimal places
 * @returns Rounded number
 */
export function roundToDecimals(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate the percentage of a value relative to a total
 * @param value The value
 * @param total The total
 * @returns The percentage (0-1)
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return value / total;
}

/**
 * Convert calories to kilojoules
 * @param calories Calories to convert
 * @returns Equivalent kilojoules
 */
export function caloriesToKilojoules(calories: number): number {
  return calories * 4.184;
}

/**
 * Convert kilojoules to calories
 * @param kilojoules Kilojoules to convert
 * @returns Equivalent calories
 */
export function kilojoulesToCalories(kilojoules: number): number {
  return kilojoules / 4.184;
}

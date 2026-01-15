import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts an amount from one currency to another using the given exchange rate.
 * @param amount - The amount to convert (in the source currency)
 * @param exchangeRate - The exchange rate (1 unit of source currency = X units of target currency)
 * @param decimals - Number of decimal places to round to (default: 6)
 * @returns The converted amount in the target currency
 */
export function convertCurrency(
  amount: number | string,
  exchangeRate: number,
  decimals: number = 6
): number {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount) || !isFinite(numericAmount)) {
    throw new Error('Invalid amount provided');
  }
  
  if (isNaN(exchangeRate) || !isFinite(exchangeRate) || exchangeRate <= 0) {
    throw new Error('Invalid exchange rate provided');
  }
  
  const result = numericAmount * exchangeRate;
  const factor = Math.pow(10, decimals);
  
  return Math.round(result * factor) / factor;
}

// src/utils/format.ts
// Shared currency / number formatting utilities

/**
 * Format a number as Vietnamese Dong.
 * e.g. 1500000 → "1.500.000 VND"
 */
export function formatVND(amount: number | null | undefined): string {
  if (amount == null) return "0 VND";
  return `${amount.toLocaleString("vi-VN")} VND`;
}

/**
 * Format a price for display in inputs / preview text.
 * Returns null when amount is 0 or falsy (so callers can skip rendering).
 */
export function formatVNDOrNull(amount: number | null | undefined): string | null {
  if (!amount || amount <= 0) return null;
  return formatVND(amount);
}

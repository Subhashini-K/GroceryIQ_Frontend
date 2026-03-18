import { format, differenceInDays, isBefore, startOfDay } from 'date-fns';

/**
 * Format date nicely (e.g., Oct 24, 2024)
 */
export const formatDate = (dateString, fmt = 'MMM dd, yyyy') => {
  if (!dateString) return '';
  return format(new Date(dateString), fmt);
};

/**
 * Returns number of days until the given expiry date.
 * If the date is in the past, it returns a negative number.
 */
export const daysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  return differenceInDays(startOfDay(new Date(expiryDate)), startOfDay(new Date()));
};

/**
 * Returns true if the expiry date is before today.
 */
export const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  return isBefore(startOfDay(new Date(expiryDate)), startOfDay(new Date()));
};

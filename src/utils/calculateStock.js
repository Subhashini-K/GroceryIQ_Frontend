import { isExpired, daysUntilExpiry } from './formatDate';

/**
 * Returns a standardized status object for stock quantities
 */
export const getStockStatus = (qty, threshold) => {
  if (qty <= 0) return { label: 'Out of Stock', variant: 'danger', colorClass: 'bg-red-100 text-red-800' };
  if (qty <= threshold) return { label: 'Low Stock', variant: 'warning', colorClass: 'bg-amber-100 text-amber-800' };
  return { label: 'In Stock', variant: 'success', colorClass: 'bg-green-100 text-green-800' };
};

/**
 * Returns a standardized status object for expiry dates
 */
export const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return { label: 'No Expiry', variant: 'default', colorClass: 'bg-gray-100 text-gray-800' };
  
  if (isExpired(expiryDate)) {
    return { label: 'Expired', variant: 'danger', colorClass: 'bg-red-100 text-red-800' };
  }
  
  const days = daysUntilExpiry(expiryDate);
  if (days === 0) return { label: 'Expiring Today', variant: 'danger', colorClass: 'bg-red-100 text-red-800' };
  if (days <= 3) return { label: `Expiring in ${days} days`, variant: 'warning', colorClass: 'bg-orange-100 text-orange-800' };
  if (days <= 7) return { label: `Expiring in ${days} days`, variant: 'warning', colorClass: 'bg-yellow-100 text-yellow-800' };
  
  return { label: 'Safe', variant: 'success', colorClass: 'bg-green-100 text-green-800' };
};

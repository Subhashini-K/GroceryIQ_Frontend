import api from './api';

export const reportService = {
  getStockSummary: (params) => api.get('/reports/stock-summary', { params }),
  getMovementReport: (params) => api.get('/reports/movement', { params }),
  getExpiryReport: (params) => api.get('/reports/expiry', { params }),
  getSupplierReport: (params) => api.get('/reports/supplier', { params }),
};

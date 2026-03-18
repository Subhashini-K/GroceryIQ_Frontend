import api from './api';

export const inventoryService = {
  getLogs: (params) => api.get('/inventory-logs', { params }),
  addStock: (data) => api.post('/inventory-logs/stock-in', data),
  removeStock: (data) => api.post('/inventory-logs/stock-out', data),
  adjust: (data) => api.post('/inventory-logs/adjustment', data),
};

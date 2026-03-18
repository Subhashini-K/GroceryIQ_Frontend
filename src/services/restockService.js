import api from './api';

export const restockService = {
  getAlerts: () => api.get('/restock/alerts'),
  createPO: (data) => api.post('/restock/purchase-order', data),
  getOrders: (params) => api.get('/restock/purchase-orders', { params }),
  updateOrderStatus: (id, status) => api.put(`/restock/purchase-orders/${id}/status`, { status }),
};

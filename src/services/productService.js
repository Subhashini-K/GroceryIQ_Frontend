import api from './api';

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => Object.keys(data).includes('append') 
    // This expects FormData if image, but front-end might send formData directly 
    ? api.post('/products', data, {headers: {'Content-Type': 'multipart/form-data'}}) 
    : api.post('/products', data),
  update: (id, data) => Object.keys(data).includes('append') 
    ? api.put(`/products/${id}`, data, {headers: {'Content-Type': 'multipart/form-data'}})
    : api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  getExpiring: (params) => api.get('/products/expiring', { params }),
};

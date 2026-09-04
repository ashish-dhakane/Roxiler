import api from './axios';

export const storeAPI = {
  searchStores: (params) => api.get('/stores', { params }),
  submitRating: (data) => api.post('/stores/rate', data),
  updateRating: (storeId, data) => api.put(`/stores/${storeId}/rate`, data),
  getMyRating: (storeId) => api.get(`/stores/${storeId}/my-rating`),
};

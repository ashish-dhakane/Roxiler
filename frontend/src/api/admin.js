import api from './axios';

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  createUser: (data) => api.post('/admin/users', data),
  createStore: (data) => api.post('/admin/stores', data),
  listUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  listStores: (params) => api.get('/admin/stores', { params }),
  listAvailableOwners: () => api.get('/admin/available-owners'),
};

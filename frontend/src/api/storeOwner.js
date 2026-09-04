import api from './axios';

export const storeOwnerAPI = {
  getDashboard: () => api.get('/store-owner/dashboard'),
};

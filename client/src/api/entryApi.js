import axiosClient from './axiosClient';

export const entryApi = {
  getAll: (params = {}) => axiosClient.get('/entries', { params }),
  getById: (id) => axiosClient.get(`/entries/${id}`),
  create: (data) => axiosClient.post('/entries', data),
  update: (id, data) => axiosClient.put(`/entries/${id}`, data),
  delete: (id) => axiosClient.delete(`/entries/${id}`),
  getSummary: (params = {}) => axiosClient.get('/entries/summary', { params }),
  getLeaderboard: (params = {}) => axiosClient.get('/entries/leaderboard', { params }),
  getStreak: (personId) => axiosClient.get(`/entries/streak/${personId}`),
};

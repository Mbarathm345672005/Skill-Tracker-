import axiosClient from './axiosClient';

export const personApi = {
  getAll: () => axiosClient.get('/people'),
  getById: (id) => axiosClient.get(`/people/${id}`),
  create: (data) => axiosClient.post('/people', data),
  update: (id, data) => axiosClient.put(`/people/${id}`, data),
  delete: (id) => axiosClient.delete(`/people/${id}`),
};

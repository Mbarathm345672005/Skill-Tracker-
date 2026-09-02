import axiosClient from './axiosClient';

export const subcategoryApi = {
  getAll: (categoryId) => {
    const params = categoryId ? { categoryId } : {};
    return axiosClient.get('/subcategories', { params });
  },
  getById: (id) => axiosClient.get(`/subcategories/${id}`),
  create: (data) => axiosClient.post('/subcategories', data),
  update: (id, data) => axiosClient.put(`/subcategories/${id}`, data),
  delete: (id) => axiosClient.delete(`/subcategories/${id}`),
};

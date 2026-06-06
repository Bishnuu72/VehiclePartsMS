import axiosInstance from './axiosInstance'

export const vendorsApi = {
  getAll: () => axiosInstance.get('/vendors'),
  getById: (id) => axiosInstance.get(`/vendors/${id}`),
  create: (data) => axiosInstance.post('/vendors', data),
  update: (id, data) => axiosInstance.put(`/vendors/${id}`, data),
  delete: (id) => axiosInstance.delete(`/vendors/${id}`),
}

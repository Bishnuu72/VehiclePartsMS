import axiosInstance from './axiosInstance'

export const reviewsApi = {
  getAll: () => axiosInstance.get('/reviews'),
  create: (data) => axiosInstance.post('/reviews', data),
}

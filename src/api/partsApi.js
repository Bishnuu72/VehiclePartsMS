import axiosInstance from './axiosInstance'

export const partsApi = {
  getAll: (pageNumber = 1, pageSize = 10, category = '') =>
    axiosInstance.get('/parts', { params: { pageNumber, pageSize, ...(category && { category }) } }),
  getById: (id) => axiosInstance.get(`/parts/${id}`),
  create: (data) => axiosInstance.post('/parts', data),
  update: (id, data) => axiosInstance.put(`/parts/${id}`, data),
  delete: (id) => axiosInstance.delete(`/parts/${id}`),
  uploadImage: (id, file) => {
    const formData = new FormData()
    formData.append('image', file)
    // Don't set Content-Type manually — axios must set it with the multipart boundary
    return axiosInstance.post(`/parts/${id}/image`, formData)
  },
}

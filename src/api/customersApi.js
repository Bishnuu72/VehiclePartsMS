import axiosInstance from './axiosInstance'

export const customersApi = {
  getAll: () => axiosInstance.get('/customers'),
  getMe: () => axiosInstance.get('/customers/me'),
  getById: (id) => axiosInstance.get(`/customers/${id}`),
  getDetails: (id) => axiosInstance.get(`/customers/${id}/details`),
  search: (params) => axiosInstance.get('/customers/search', { params }),
  register: (data) => axiosInstance.post('/customers/register', data),
  update: (id, data) => axiosInstance.put(`/customers/${id}`, data),
  addVehicle: (id, data) => axiosInstance.post(`/customers/${id}/vehicles`, data),
  updateVehicle: (id, vehicleId, data) => axiosInstance.put(`/customers/${id}/vehicles/${vehicleId}`, data),
  deleteVehicle: (id, vehicleId) => axiosInstance.delete(`/customers/${id}/vehicles/${vehicleId}`),
  uploadVehicleImage: (id, vehicleId, file) => {
    const formData = new FormData()
    formData.append('image', file)
    return axiosInstance.post(`/customers/${id}/vehicles/${vehicleId}/image`, formData)
  },
  getTopSpenders: (top = 10) => axiosInstance.get('/customers/reports/top-spenders', { params: { top } }),
  getRegulars: (top = 10) => axiosInstance.get('/customers/reports/regulars', { params: { top } }),
  getPendingCredits: () => axiosInstance.get('/customers/reports/pending-credits'),
}

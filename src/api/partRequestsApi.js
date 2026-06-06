import axiosInstance from './axiosInstance'

export const partRequestsApi = {
  getAll: () => axiosInstance.get('/partrequests'),
  create: (data) => axiosInstance.post('/partrequests', data),
  update: (id, data) => axiosInstance.put(`/partrequests/${id}`, data),
  // PartRequestStatus enum: Pending = 0, Available = 1, Unavailable = 2
  updateStatus: (id, status) => axiosInstance.put(`/partrequests/${id}/status`, { status }),
  delete: (id) => axiosInstance.delete(`/partrequests/${id}`),
}

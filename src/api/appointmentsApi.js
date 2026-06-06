import axiosInstance from './axiosInstance'

export const appointmentsApi = {
  getAll: () => axiosInstance.get('/appointments'),
  getMyAppointments: () => axiosInstance.get('/appointments/my'),
  create: (data) => axiosInstance.post('/appointments', data),
  update: (id, data) => axiosInstance.put(`/appointments/${id}`, data),
  delete: (id) => axiosInstance.delete(`/appointments/${id}`),
}

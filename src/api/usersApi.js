import axiosInstance from './axiosInstance'

export const usersApi = {
  getStaff: () => axiosInstance.get('/users/staff'),
  createStaff: (data) => axiosInstance.post('/users/register', data),
  deleteStaff: (id) => axiosInstance.delete(`/users/${id}`),
  getById: (id) => axiosInstance.get(`/users/${id}`),
  getMe: () => axiosInstance.get('/users/me'),
  updateMe: (data) => axiosInstance.put('/users/me', data),
  uploadProfilePicture: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return axiosInstance.post('/users/me/profile-picture', formData)
  },
  changePassword: (currentPassword, newPassword) =>
    axiosInstance.post('/users/me/password', { currentPassword, newPassword }),
}

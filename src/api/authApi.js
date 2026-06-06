import axiosInstance from './axiosInstance'

export const authApi = {
  login: (credentials) => axiosInstance.post('/users/login', credentials),
  register: (data) => axiosInstance.post('/users/register', data),
}

import axiosInstance from './axiosInstance'

export const reportsApi = {
  getDaily: (date) => axiosInstance.get('/reports/daily', { params: { date } }),
  getMonthly: (year, month) => axiosInstance.get('/reports/monthly', { params: { year, month } }),
  getYearly: (year) => axiosInstance.get('/reports/yearly', { params: { year } }),
}

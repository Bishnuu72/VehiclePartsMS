import axiosInstance from './axiosInstance'

export const purchaseInvoicesApi = {
  getAll: () => axiosInstance.get('/purchaseinvoices'),
  getById: (id) => axiosInstance.get(`/purchaseinvoices/${id}`),
  create: (data) => axiosInstance.post('/purchaseinvoices', data),
}

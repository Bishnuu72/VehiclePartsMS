import axiosInstance from './axiosInstance'

export const salesInvoicesApi = {
  getAll: () => axiosInstance.get('/salesinvoices'),
  getById: (id) => axiosInstance.get(`/salesinvoices/${id}`),
  create: (data) => axiosInstance.post('/salesinvoices', data),
  // PaymentStatus enum: Paid = 0, Credit = 1
  updatePaymentStatus: (id, paymentStatus) =>
    axiosInstance.put(`/salesinvoices/${id}/payment-status`, { paymentStatus }),
  sendEmail: (id) => axiosInstance.post(`/salesinvoices/${id}/send-email`),
}

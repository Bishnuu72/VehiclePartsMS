import axiosInstance from './axiosInstance'

export const chatApi = {
  // body: { message, history: [{ role: 'user' | 'assistant', content }] }
  send: (data) => axiosInstance.post('/chat', data),
}

import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10_000
})

apiClient.interceptors.response.use(
  response => response,
  error => {
    // oxlint-disable-next-line no-magic-numbers
    if (error.response?.status === 401) {
      // refresh aqui
      globalThis.location.href = '/auth/ingresar'
    }
    return Promise.reject(error)
  }
)

export default apiClient

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Attach token on every request if present
api.interceptors.request.use(config => {
  const stored = localStorage.getItem('portgate-auth')
  if (stored) {
    const { state } = JSON.parse(stored)
    if (state?.token) {
      config.headers.Authorization = `Bearer ${state.token}`
    }
  }
  return config
})

// Global error handling
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('portgate-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

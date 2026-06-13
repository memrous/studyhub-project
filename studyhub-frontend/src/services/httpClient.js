import axios from 'axios'

/**
 * httpClient
 *
 * Centralized HTTP client using Axios.
 *
 * All external network requests to the future Laravel backend
 * will flow through this client instance.
 */
const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:80/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// For Sanctum: uncomment below and remove the Bearer token interceptor
// httpClient.defaults.withCredentials = true
// Before login call: await httpClient.get('/sanctum/csrf-cookie')

// Request interceptor: Attach token from localStorage
httpClient.interceptors.request.use(
  (config) => {
    const authDataStr = localStorage.getItem('studyhub:auth')
    if (authDataStr) {
      try {
        const { token } = JSON.parse(authDataStr)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (err) {
        console.error('Error parsing token from storage:', err)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: Handle 401 response status by triggering logout
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Dispatch custom event to let AuthContext trigger a clean logout
      window.dispatchEvent(new Event('studyhub:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default httpClient

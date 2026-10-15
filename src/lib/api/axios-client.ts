import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * Public Axios instance:
 * Used for endpoints that do NOT require authentication
 * (e.g., send-otp, verify-otp, public resources)
 */
export const publicApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

/**
 * Protected Axios instance:
 * Automatically attaches Authorization header and handles
 * token refresh with request queueing on 401 errors.
 */
export const protectedApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor: attach bearer token
protectedApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().auth.accessToken

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Queue state for handling simultaneous requests during token refresh
interface QueueItem {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}

let isRefreshing = false
let failedQueue: QueueItem[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Response interceptor: auto refresh on 401 with request queueing
protectedApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Check if error is 401 and not already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue this request
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((newAccessToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            }
            return protectedApi(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = useAuthStore.getState().auth.refreshToken

        // Call your backend refresh endpoint
        const response = await publicApi.post<{
          accessToken: string
          refreshToken?: string
        }>('/auth/refresh-token', {
          refreshToken,
        })

        const newAccessToken = response.data.accessToken
        const newRefreshToken = response.data.refreshToken

        // Update token in store
        useAuthStore.getState().auth.setTokens(newAccessToken, newRefreshToken)

        // Process all queued requests with the new token
        processQueue(null, newAccessToken)

        // Retry the original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }

        return protectedApi(originalRequest)
      } catch (refreshError) {
        // Refresh failed: reject all queued requests and log the user out
        processQueue(refreshError, null)
        useAuthStore.getState().auth.reset()

        // Redirect to sign in page
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/sign-in')) {
          const currentPath = encodeURIComponent(window.location.pathname + window.location.search)
          window.location.href = `/sign-in?redirect=${currentPath}`
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

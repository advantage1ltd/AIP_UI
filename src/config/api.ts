import axios from 'axios'

// Base API URL that will be used across the application
// Update this to point to your real backend when ready
export const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Employee endpoints
export const EMPLOYEE_ENDPOINTS = {
  LIST: '/employee',
  DETAIL: (id: string) => `/employee/${id}`,
  CREATE: '/employee',
  UPDATE: (id: string) => `/employee/${id}`,
  DELETE: (id: string) => `/employee/${id}`,
  REGISTER: '/employee',
  STATISTICS: '/employee/statistics',
} as const

// Customer endpoints
export const CUSTOMER_ENDPOINTS = {
  LIST: '/customer',
  DETAIL: (id: string) => `/customer/${id}`,
  CREATE: '/customer',
  UPDATE: (id: string) => `/customer/${id}`,
  DELETE: (id: string) => `/customer/${id}`,
  STATISTICS: '/customer/statistics',
  PAGE_ASSIGNMENTS: (id: string) => `/customer/${id}/page-assignments`,
} as const

// User endpoints
export const USER_ENDPOINTS = {
  LIST: '/user',
  DETAIL: (id: string) => `/user/${id}`,
  CREATE: '/user',
  UPDATE: (id: string) => `/user/${id}`,
  DELETE: (id: string) => `/user/${id}`,
  ASSIGN_CUSTOMERS: (id: string) => `/user/${id}/assign-customers`,
} as const

// Site Visit endpoints
export const SITE_VISIT_ENDPOINTS = {
  LIST: '/site-visits',
  DETAIL: (id: string) => `/site-visits/${id}`,
  CREATE: '/site-visits',
  UPDATE: (id: string) => `/site-visits/${id}`,
  DELETE: (id: string) => `/site-visits/${id}`,
} as const

// Mystery Shopper endpoints
export const MYSTERY_SHOPPER_ENDPOINTS = {
  OFFICERS: '/mystery-shopper/officers',
  CUSTOMERS: '/mystery-shopper/customers',
  LOCATIONS: '/mystery-shopper/locations',
  EVALUATION_CRITERIA: '/mystery-shopper/evaluation-criteria',
  EVALUATIONS: '/mystery-shopper/evaluations'
} as const

// API Headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
} as const

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  errors?: string[]
}

// Error handling utilities
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.response?.data?.errors) {
    return error.response.data.errors.join(', ')
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
} 
import axios from 'axios'

// Base API URL that will be used across the application
export const BASE_API_URL = '/api'

export const api = axios.create({
  baseURL: BASE_API_URL,
})

// Site Visit endpoints
export const SITE_VISIT_ENDPOINTS = {
  LIST: '/site-visits',
  DETAIL: (id: string) => `/site-visits/${id}`,
  CREATE: '/site-visits',
  UPDATE: (id: string) => `/site-visits/${id}`,
  DELETE: (id: string) => `/site-visits/${id}`,
} as const;

// Mystery Shopper endpoints
export const MYSTERY_SHOPPER_ENDPOINTS = {
  OFFICERS: '/mystery-shopper/officers',
  CUSTOMERS: '/mystery-shopper/customers',
  LOCATIONS: '/mystery-shopper/locations',
  EVALUATION_CRITERIA: '/mystery-shopper/evaluation-criteria',
  EVALUATIONS: '/mystery-shopper/evaluations'
} as const;

// API Headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
} as const; 
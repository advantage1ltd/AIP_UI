/**
 * Shared axios client, base URL resolution, and auth refresh interceptors.
 * All domain services should import `api` from here rather than creating their own axios instance.
 * Flow: session token on request → 401 refresh queue → normalized `ApiResponse` errors for callers.
 */
import axios, { AxiosHeaders, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { sessionStore } from '@/state/sessionStore'
import { logger } from '@/utils/logger'

const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, '')

/**
 * API root including `/api` (e.g. `https://api.example.com/api`).
 * Local dev: defaults to `/api` (Vite proxy). Production: set `VITE_API_BASE_URL` when the API is on another host.
 */
export const BASE_API_URL = ((): string => {
	const raw = import.meta.env.VITE_API_BASE_URL
	if (typeof raw === 'string' && raw.trim().length > 0) {
		return trimTrailingSlashes(raw.trim())
	}
	return '/api'
})()

const resolveTimeoutMs = (): number => {
	const raw = import.meta.env.VITE_API_TIMEOUT_MS
	if (raw === undefined || raw === '') return 30000
	const n = Number(raw)
	return Number.isFinite(n) && n > 0 ? n : 30000
}

// === Axios instance ===
export const api = axios.create({
	baseURL: BASE_API_URL,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
	timeout: resolveTimeoutMs(),
})

// Recruitment/CBT uses the same secure backend API by design.
export const recruitmentApi = api

const debugLogsEnabled = import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true'
type ApiErrorPayload = { message?: string; errors?: string[] }
type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  skipAuthRefresh?: boolean
}
type RefreshTokenResponsePayload = {
  AccessToken?: string
  RefreshToken?: string
  ExpiresAt?: string
}
type RefreshTokenApiEnvelope = {
  Success?: boolean
  Data?: RefreshTokenResponsePayload
  data?: RefreshTokenResponsePayload
  AccessToken?: string
  accessToken?: string
  RefreshToken?: string
  refreshToken?: string
  ExpiresAt?: string
  expiresAt?: string
  Message?: string
}
type BackendConnectionDetail = {
  status: 'degraded' | 'recovered'
  message: string
}

let isRefreshingToken = false
let pendingRefreshSubscribers: Array<(token: string | null) => void> = []
let backendConnectionDegraded = false
let consecutiveBackendFailures = 0
let consecutiveBackendSuccesses = 0

const BACKEND_DEGRADED_FAILURE_THRESHOLD = 2
const BACKEND_RECOVERY_SUCCESS_THRESHOLD = 2

const emitBackendConnectionEvent = (detail: BackendConnectionDetail) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<BackendConnectionDetail>('backend-connection-status', { detail }))
}

const addRefreshSubscriber = (callback: (token: string | null) => void) => {
  pendingRefreshSubscribers.push(callback)
}

const notifyRefreshSubscribers = (token: string | null) => {
  pendingRefreshSubscribers.forEach(callback => callback(token))
  pendingRefreshSubscribers = []
}

const isRefreshFailureUnauthorized = (error: unknown) => (
  axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)
)

const isTerminalRefreshFailure = (error: unknown) => {
  if (error instanceof Error && error.message === 'Refresh did not return an access token') {
    return true
  }

  if (!axios.isAxiosError(error)) {
    return false
  }

  const status = error.response?.status
  return status === 400 || status === 401 || status === 403
}

const getRefreshPayload = (responseData: RefreshTokenApiEnvelope | RefreshTokenResponsePayload | undefined) => {
  if (!responseData) {
    return undefined
  }

  const dataEnvelope = (responseData as RefreshTokenApiEnvelope).Data
    ?? (responseData as RefreshTokenApiEnvelope).data

  const payload = dataEnvelope ?? responseData
  return payload as RefreshTokenApiEnvelope & RefreshTokenResponsePayload
}

const performTokenRefresh = async (): Promise<string> => {
  const refreshToken = sessionStore.getRefreshToken()
  const accessToken = sessionStore.getToken()

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await axios.post<RefreshTokenApiEnvelope>(
    `${BASE_API_URL}/Auth/refresh-token`,
    { refreshToken },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
      },
      timeout: resolveTimeoutMs()
    }
  )

  const payload = getRefreshPayload(response.data)
  const nextAccessToken = payload?.AccessToken ?? payload?.accessToken
  const nextRefreshToken = payload?.RefreshToken ?? payload?.refreshToken
  const nextExpiresAt = payload?.ExpiresAt ?? payload?.expiresAt

  if (!nextAccessToken) {
    throw new Error('Refresh did not return an access token')
  }

  sessionStore.setToken(nextAccessToken)
  if (nextRefreshToken) {
    sessionStore.setRefreshToken(nextRefreshToken)
  }
  if (nextExpiresAt) {
    sessionStore.setTokenExpiresAt(nextExpiresAt)
  }

  return nextAccessToken
}

const requestInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = sessionStore.getToken()
  if (debugLogsEnabled) {
    logger.debug('[API] request', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      baseURL: config.baseURL
    })
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    if (debugLogsEnabled) {
      logger.debug('[API] Authorization header set')
    }
  } else if (debugLogsEnabled) {
    logger.debug('[API] no token', config.url)
  }
  return config
}
const requestErrorInterceptor = (error: unknown) => {
  if (debugLogsEnabled) {
    logger.debug('[API] request error', error)
  }
  return Promise.reject(error)
}

// Add request interceptor to include auth token
api.interceptors.request.use(requestInterceptor, requestErrorInterceptor)
// recruitmentApi is an alias of api (single backend), so no extra interceptor needed.

const responseSuccessInterceptor = (response: AxiosResponse) => {
  if (backendConnectionDegraded) {
    consecutiveBackendSuccesses += 1
    if (consecutiveBackendSuccesses >= BACKEND_RECOVERY_SUCCESS_THRESHOLD) {
      backendConnectionDegraded = false
      consecutiveBackendFailures = 0
      consecutiveBackendSuccesses = 0
      emitBackendConnectionEvent({
        status: 'recovered',
        message: 'Backend connection restored.'
      })
    }
  } else {
    consecutiveBackendFailures = 0
  }

  if (debugLogsEnabled) {
    logger.debug('[API] response', {
      url: response.config.url,
      status: response.status
    })
  }
  return response
}

// Response pipeline: on 401, refresh access token once and retry except for auth/settings endpoints (see branch below).
// Add response interceptor for error handling
api.interceptors.response.use(
  responseSuccessInterceptor,
  async (error: unknown) => {
    const axiosError = axios.isAxiosError<ApiErrorPayload>(error) ? error : null
    const retryableConfig = (axiosError?.config as RetryableRequestConfig | undefined)
    const status = axiosError?.response?.status;
    const url = axiosError?.config?.url || '';
    const isRecruitment = url.includes('/recruitment/');

    // For expected errors (404, etc.), log less verbosely
    const isExpectedError = status === 404 || status === 403;
    // Recruitment admin get-by-id often returns 500 when backend is unavailable; avoid noisy logs
    const isRecruitmentServerError = isRecruitment && status === 500;

    const shouldLogVerbose = debugLogsEnabled && !isRecruitmentServerError;
    const shouldLogWarningOnly = !shouldLogVerbose && (isExpectedError || isRecruitmentServerError);

    if (!axiosError?.response && debugLogsEnabled) {
      logger.debug('[API] network error', {
        url,
        method: axiosError?.config?.method,
        message: axiosError?.message ?? 'Unknown network error',
      })
    } else if (shouldLogWarningOnly) {
      logger.debug(`[API] ${status} ${axiosError?.config?.method?.toUpperCase()} ${url}`)
    } else if (shouldLogVerbose) {
      const errorDetails = {
        url,
        method: axiosError?.config?.method,
        status,
        statusText: axiosError?.response?.statusText,
        message: axiosError?.message,
        responseData: axiosError?.response?.data,
        requestData: axiosError?.config?.data,
        authHeader: axiosError?.config?.headers?.Authorization ? 'present' : 'missing',
      }
      logger.error('[API] response error', errorDetails)
    }

    const isCanceledRequest = axiosError?.code === 'ERR_CANCELED'
      || axiosError?.message?.toLowerCase() === 'canceled'
      || axios.isCancel(error)

    const backendUnavailable = !isCanceledRequest
      && (!axiosError?.response || (typeof status === 'number' && status >= 500))

    if (backendUnavailable) {
      consecutiveBackendFailures += 1
      consecutiveBackendSuccesses = 0
      if (
        !backendConnectionDegraded
        && consecutiveBackendFailures >= BACKEND_DEGRADED_FAILURE_THRESHOLD
      ) {
        backendConnectionDegraded = true
        emitBackendConnectionEvent({
          status: 'degraded',
          message: 'Backend connection is unstable. Reconnecting...'
        })
      }
    } else if (!isCanceledRequest) {
      consecutiveBackendFailures = 0
    }
    
    if (status === 401 && retryableConfig) {
      const normalizedUrl = url.toLowerCase()
      const isSettingsEndpoint = normalizedUrl.includes('/pageaccess/settings')
      const isRefreshEndpoint = normalizedUrl.includes('/auth/refresh-token')
      const isLoginEndpoint = normalizedUrl.includes('/auth/login')
      const isPasswordResetEndpoint = normalizedUrl.includes('/auth/forgot-password') || normalizedUrl.includes('/auth/reset-password')
      const hasToken = Boolean(sessionStore.getToken())

      // Do not attempt refresh for public auth endpoints or when explicitly disabled.
      if (
        retryableConfig.skipAuthRefresh ||
        retryableConfig._retry ||
        isRefreshEndpoint ||
        isLoginEndpoint ||
        isPasswordResetEndpoint ||
        isSettingsEndpoint ||
        !hasToken
      ) {
        return Promise.reject(error)
      }

      if (isRefreshingToken) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((newToken) => {
            if (!newToken) {
              reject(error)
              return
            }

            const replayConfig = { ...retryableConfig }
            replayConfig.headers = AxiosHeaders.from(retryableConfig.headers ?? {})
            replayConfig.headers.set('Authorization', `Bearer ${newToken}`)
            resolve(api(replayConfig))
          })
        })
      }

      retryableConfig._retry = true
      isRefreshingToken = true

      try {
        const refreshedToken = await performTokenRefresh()
        notifyRefreshSubscribers(refreshedToken)
        retryableConfig.headers = AxiosHeaders.from(retryableConfig.headers ?? {})
        retryableConfig.headers.set('Authorization', `Bearer ${refreshedToken}`)
        return api(retryableConfig)
      } catch (refreshError) {
        notifyRefreshSubscribers(null)
        if (isRefreshFailureUnauthorized(refreshError) || isTerminalRefreshFailure(refreshError)) {
          sessionStore.clearAll()
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshingToken = false
      }
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
  ACTIVE: '/employee/active',
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

// Region endpoints
export const REGION_ENDPOINTS = {
  LIST: '/region',
  DETAIL: (id: string) => `/region/${id}`,
  CREATE: '/region',
  UPDATE: (id: string) => `/region/${id}`,
  DELETE: (id: string) => `/region/${id}`,
  BY_CUSTOMER: (customerId: string) => `/region/customer/${customerId}`,
} as const

// Site endpoints
export const SITE_ENDPOINTS = {
  LIST: '/site',
  DETAIL: (id: string) => `/site/${id}`,
  CREATE: '/site',
  UPDATE: (id: string) => `/site/${id}`,
  DELETE: (id: string) => `/site/${id}`,
  BY_CUSTOMER: (customerId: string) => `/site/customer/${customerId}`,
  BY_REGION: (regionId: string) => `/site/region/${regionId}`,
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

// Stock endpoints
export const STOCK_ENDPOINTS = {
  LIST: '/Stock',
  DETAIL: (id: string) => `/Stock/${id}`,
  CREATE: '/Stock',
  UPDATE: (id: string) => `/Stock/${id}`,
  DELETE: (id: string) => `/Stock/${id}`,
  ISSUE: (id: string) => `/Stock/${id}/issue`,
  ADD: (id: string) => `/Stock/${id}/add`,
  LOW_STOCK: '/Stock/low-stock',
  CHECK_LOW_STOCK: '/Stock/check-low-stock',
  TEST_EMAIL: '/Stock/test-email',
} as const

// Action Calendar endpoints
export const ACTION_CALENDAR_ENDPOINTS = {
  LIST: '/ActionCalendar',
  DETAIL: (id: string) => `/ActionCalendar/${id}`,
  CREATE: '/ActionCalendar',
  UPDATE: (id: string) => `/ActionCalendar/${id}`,
  DELETE: (id: string) => `/ActionCalendar/${id}`,
  STATISTICS: '/ActionCalendar/statistics',
} as const

// Contract Renewal endpoints
export const CONTRACT_RENEWAL_ENDPOINTS = {
  LIST: '/contract-renewal',
  DETAIL: (id: number) => `/contract-renewal/${id}`,
  CREATE: '/contract-renewal',
  UPDATE: (id: number) => `/contract-renewal/${id}`,
  DELETE: (id: number) => `/contract-renewal/${id}`,
} as const

// Asset Register endpoints
export const ASSET_REGISTER_ENDPOINTS = {
  LIST: '/asset-register',
  DETAIL: (id: number) => `/asset-register/${id}`,
  CREATE: '/asset-register',
  UPDATE: (id: number) => `/asset-register/${id}`,
  DELETE: (id: number) => `/asset-register/${id}`,
  CHECK_TAG: '/asset-register/check-tag',
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
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const responseData = error.response?.data
    if (responseData?.message) {
      return responseData.message
    }
    if (responseData?.errors?.length) {
      return responseData.errors.join(', ')
    }
    if (error.message) {
      return error.message
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export const isBackendUnavailableError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false
  }

  if (!error.response) {
    return true
  }

  const status = error.response.status
  return status >= 500
}
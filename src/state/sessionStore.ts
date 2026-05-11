/**
 * Browser session persistence for auth token, refresh token, expiry, and cached user.
 * Read by config/api.ts interceptors and AuthContext; not a React store.
 */
import { User } from '@/types/user'
import { logger } from '@/utils/logger'

type Listener = (user: User | null) => void

const TOKEN_KEY = 'authToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const TOKEN_EXPIRES_AT_KEY = 'authTokenExpiresAt'
const USER_KEY = 'user'

let currentUser: User | null = null
const listeners = new Set<Listener>()

export const sessionStore = {
	// === Access token ===
	getToken: (): string | null => {
		try {
			return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY)
		} catch (error) {
			logger.error('Error getting token from session storage:', error)
			return null
		}
	},

	setToken: (token: string): void => {
		try {
			sessionStorage.setItem(TOKEN_KEY, token)
			localStorage.removeItem(TOKEN_KEY)
		} catch (error) {
			logger.error('Error setting token in session storage:', error)
		}
	},

	clearToken: (): void => {
		try {
			sessionStorage.removeItem(TOKEN_KEY)
			localStorage.removeItem(TOKEN_KEY)
		} catch (error) {
			logger.error('Error clearing token from session storage:', error)
		}
	},

	// === Refresh token ===
	getRefreshToken: (): string | null => {
		try {
			return sessionStorage.getItem(REFRESH_TOKEN_KEY) ?? localStorage.getItem(REFRESH_TOKEN_KEY)
		} catch (error) {
			logger.error('Error getting refresh token from session storage:', error)
			return null
		}
	},

	setRefreshToken: (token: string): void => {
		try {
			sessionStorage.setItem(REFRESH_TOKEN_KEY, token)
			localStorage.removeItem(REFRESH_TOKEN_KEY)
		} catch (error) {
			logger.error('Error setting refresh token in session storage:', error)
		}
	},

	clearRefreshToken: (): void => {
		try {
			sessionStorage.removeItem(REFRESH_TOKEN_KEY)
			localStorage.removeItem(REFRESH_TOKEN_KEY)
		} catch (error) {
			logger.error('Error clearing refresh token from session storage:', error)
		}
	},

	// === Token expiry (for proactive refresh) ===
	getTokenExpiresAt: (): string | null => {
		try {
			return sessionStorage.getItem(TOKEN_EXPIRES_AT_KEY) ?? localStorage.getItem(TOKEN_EXPIRES_AT_KEY)
		} catch (error) {
			logger.error('Error getting token expiry from session storage:', error)
			return null
		}
	},

	setTokenExpiresAt: (expiresAt: string): void => {
		try {
			sessionStorage.setItem(TOKEN_EXPIRES_AT_KEY, expiresAt)
			localStorage.removeItem(TOKEN_EXPIRES_AT_KEY)
		} catch (error) {
			logger.error('Error setting token expiry in session storage:', error)
		}
	},

	clearTokenExpiresAt: (): void => {
		try {
			sessionStorage.removeItem(TOKEN_EXPIRES_AT_KEY)
			localStorage.removeItem(TOKEN_EXPIRES_AT_KEY)
		} catch (error) {
			logger.error('Error clearing token expiry from session storage:', error)
		}
	},

	// === Cached user profile ===
	getUser: (): User | null => {
		try {
			// First check in-memory cache
			if (currentUser) {
				return currentUser
			}
			const userStr = sessionStorage.getItem(USER_KEY)
			return userStr ? JSON.parse(userStr) : null
		} catch (error) {
			logger.error('Error getting user from session storage:', error)
			return null
		}
	},

	setUser: (user: User | null) => {
		currentUser = user
		listeners.forEach(listener => listener(user))
		try {
			if (user) {
				sessionStorage.setItem(USER_KEY, JSON.stringify(user))
			} else {
				sessionStorage.removeItem(USER_KEY)
				localStorage.removeItem(USER_KEY)
			}
		} catch (error) {
			logger.error('Error setting user in session storage:', error)
		}
	},

	clearUser: (): void => {
		currentUser = null
		listeners.forEach(listener => listener(null))
		try {
			sessionStorage.removeItem(USER_KEY)
			localStorage.removeItem(USER_KEY)
		} catch (error) {
			logger.error('Error clearing user from session storage:', error)
		}
	},

	clearAll: (): void => {
		sessionStore.clearToken()
		sessionStore.clearRefreshToken()
		sessionStore.clearTokenExpiresAt()
		sessionStore.clearUser()
	},

	// === Subscribers (non-React listeners) ===
	subscribe: (listener: Listener) => {
		listeners.add(listener)
		return () => listeners.delete(listener)
	}
}


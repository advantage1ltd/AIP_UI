/**
 * Session helpers for logout, token/user accessors, and fetch auth headers.
 * Flow: sessionStore read/write → optional window events for auth-aware UI refresh.
 */
import { sessionStore } from '@/state/sessionStore'
import { logger } from '@/utils/logger'
import { User } from '@/types/user'

export const logout = (): void => {
	try {
		sessionStore.clearAll()
		window.dispatchEvent(new Event('session-cleared'))
	} catch (error) {
		logger.error('Logout error:', error)
	}
}

export const getToken = (): string | null => {
	return sessionStore.getToken()
}

export const getUser = (): User | null => {
	return sessionStore.getUser()
}

export const isAuthenticated = (): boolean => {
	const token = getToken()
	const user = sessionStore.getUser()
	return Boolean(token && user)
}

export const getAuthHeaders = (): HeadersInit => {
	const token = getToken()
	return token
		? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
		: { 'Content-Type': 'application/json' }
}
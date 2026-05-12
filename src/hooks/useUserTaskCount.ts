/**
 * Polls action-calendar open task count for the signed-in user (header badge).
 * Flow: auth-aware polling with cooldowns on auth/backend failures.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { logger } from '@/utils/logger'
import { isAxiosError } from 'axios'
import { useAuth } from '@/contexts/AuthContext'
import { isBackendUnavailableError } from '@/config/api'
import { actionCalendarService } from '@/services/actionCalendarService'
import { sessionStore } from '@/state/sessionStore'

const TASK_COUNT_POLL_INTERVAL_MS = 30000
const AUTH_ERROR_COOLDOWN_MS = 2 * 60 * 1000
const BACKEND_OFFLINE_COOLDOWN_MS = 60 * 1000
const debugLogsEnabled = import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true'

const isAuthError = (error: unknown) => {
	if (isAxiosError(error)) {
		const status = error.response?.status
		if (status === 401 || status === 403) {
			return true
		}
	}

	if (error instanceof Error) {
		const message = error.message.toLowerCase()
		return (
			message.includes('refresh did not return an access token') ||
			message.includes('no refresh token available')
		)
	}

	return false
}

/**
 * Custom hook to fetch and count tasks assigned to the current user
 * Only counts non-completed tasks (pending, in-progress, blocked)
 */
export const useUserTaskCount = () => {
	const { user } = useAuth()
	const [taskCount, setTaskCount] = useState<number>(0)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const authErrorCooldownUntilRef = useRef<number>(0)
	const backendOfflineCooldownUntilRef = useRef<number>(0)

	const fetchTaskCount = useCallback(async (force = false) => {
		if (!user?.id) {
			setTaskCount(0)
			setIsLoading(false)
			authErrorCooldownUntilRef.current = 0
			backendOfflineCooldownUntilRef.current = 0
			return
		}

		const hasToken = Boolean(sessionStore.getToken())
		if (!hasToken) {
			setTaskCount(0)
			setIsLoading(false)
			authErrorCooldownUntilRef.current = 0
			backendOfflineCooldownUntilRef.current = 0
			return
		}

		const now = Date.now()
		const inAuthCooldown = now < authErrorCooldownUntilRef.current
		if (inAuthCooldown && !force) {
			setIsLoading(false)
			return
		}

		const inBackendOfflineCooldown = now < backendOfflineCooldownUntilRef.current
		if (inBackendOfflineCooldown && !force) {
			setIsLoading(false)
			return
		}

		try {
			setIsLoading(true)
			setError(null)

			const statuses: Array<'pending' | 'in-progress' | 'blocked'> = ['pending', 'in-progress', 'blocked']
			const responses = await Promise.all(
				statuses.map(status =>
					actionCalendarService.getTasks({
						assignee: user.id,
						status,
						page: 1,
						pageSize: 1,
					})
				)
			)

			if (responses.every(response => response.success)) {
				const total = responses.reduce(
					(sum, response) => sum + (response.pagination?.totalCount ?? response.data?.length ?? 0),
					0
				)
				setTaskCount(total)
				authErrorCooldownUntilRef.current = 0
				backendOfflineCooldownUntilRef.current = 0
			} else {
				setTaskCount(0)
				setError(responses.find((item) => !item.success)?.message || 'Failed to fetch tasks')
			}
		} catch (err) {
			const authErrorDetected = isAuthError(err)
			const backendUnavailable = isBackendUnavailableError(err)

			if (!authErrorDetected && !backendUnavailable) {
				logger.error('Error fetching user task count:', err)
			} else if (backendUnavailable && debugLogsEnabled) {
				logger.warn('⚠️ [TaskCount] Backend unavailable, temporarily pausing task count polling')
			}
			setTaskCount(0)
			setError(backendUnavailable ? null : (err instanceof Error ? err.message : 'Failed to fetch tasks'))
			if (authErrorDetected) {
				authErrorCooldownUntilRef.current = Date.now() + AUTH_ERROR_COOLDOWN_MS
			}
			if (backendUnavailable) {
				backendOfflineCooldownUntilRef.current = Date.now() + BACKEND_OFFLINE_COOLDOWN_MS
			}
		} finally {
			setIsLoading(false)
		}
	}, [user?.id])

	// Fetch task count when user changes
	useEffect(() => {
		fetchTaskCount()
	}, [fetchTaskCount])

	// Refresh task count periodically (every 30 seconds)
	useEffect(() => {
		if (!user?.id) return

		const interval = setInterval(() => {
			fetchTaskCount()
		}, TASK_COUNT_POLL_INTERVAL_MS)

		return () => clearInterval(interval)
	}, [user?.id, fetchTaskCount])

	// Listen for task-related events to refresh count
	useEffect(() => {
		const handleTaskEvent = () => {
			fetchTaskCount(true)
		}

		window.addEventListener('task-created', handleTaskEvent)
		window.addEventListener('task-updated', handleTaskEvent)
		window.addEventListener('task-deleted', handleTaskEvent)
		window.addEventListener('task-status-updated', handleTaskEvent)

		return () => {
			window.removeEventListener('task-created', handleTaskEvent)
			window.removeEventListener('task-updated', handleTaskEvent)
			window.removeEventListener('task-deleted', handleTaskEvent)
			window.removeEventListener('task-status-updated', handleTaskEvent)
		}
	}, [fetchTaskCount])

	return {
		taskCount,
		isLoading,
		error,
		refresh: fetchTaskCount
	}
}

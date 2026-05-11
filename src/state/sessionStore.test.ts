import { sessionStore } from './sessionStore'
import type { StaffUser } from '@/types/user'

describe('sessionStore', () => {
	beforeEach(() => {
		localStorage.clear()
		sessionStore.clearAll()
	})

	it('stores and retrieves auth token', () => {
		sessionStore.setToken('test-token')
		expect(sessionStore.getToken()).toBe('test-token')
	})

	it('clears token and user data', () => {
		sessionStore.setToken('test-token')
		sessionStore.clearAll()
		expect(sessionStore.getToken()).toBeNull()
		expect(sessionStore.getUser()).toBeNull()
	})

	it('notifies subscribers when user changes', () => {
		const listener = jest.fn()
		const unsubscribe = sessionStore.subscribe(listener)
		const user: StaffUser = {
			id: '1',
			username: 'tester',
			firstName: 'Test',
			lastName: 'User',
			email: 'test@example.com',
			role: 'administrator',
			pageAccessRole: 'administrator',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		sessionStore.setUser(user)

		expect(listener).toHaveBeenCalledTimes(1)
		expect(listener).toHaveBeenCalledWith(user)
		unsubscribe()
	})
})


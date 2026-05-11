import { isAlwaysAllowedPath, isPageAccessBootstrapPending, isPageAccessReadyButEmpty } from '@/utils/page-access-guards'

describe('page-access-guards', () => {
	it('marks bootstrap as pending for idle/loading states', () => {
		expect(isPageAccessBootstrapPending({ status: 'idle', pageAccessRoleCount: 0, availablePageCount: 0 })).toBe(true)
		expect(isPageAccessBootstrapPending({ status: 'loading', pageAccessRoleCount: 1, availablePageCount: 1 })).toBe(true)
		expect(isPageAccessBootstrapPending({ status: 'ready', pageAccessRoleCount: 1, availablePageCount: 1 })).toBe(false)
	})

	it('fails closed when ready state has empty settings', () => {
		expect(isPageAccessReadyButEmpty({ status: 'ready', pageAccessRoleCount: 0, availablePageCount: 1 })).toBe(true)
		expect(isPageAccessReadyButEmpty({ status: 'ready', pageAccessRoleCount: 1, availablePageCount: 0 })).toBe(true)
		expect(isPageAccessReadyButEmpty({ status: 'ready', pageAccessRoleCount: 1, availablePageCount: 2 })).toBe(false)
		expect(isPageAccessReadyButEmpty({ status: 'offline', pageAccessRoleCount: 0, availablePageCount: 0 })).toBe(false)
	})

	it('identifies always-allowed shell paths', () => {
		expect(isAlwaysAllowedPath('/')).toBe(true)
		expect(isAlwaysAllowedPath('/dashboard')).toBe(true)
		expect(isAlwaysAllowedPath('/management/officer-performance')).toBe(false)
	})
})


type PageAccessStatus = 'idle' | 'loading' | 'ready' | 'offline'

type SettingsState = {
	status: PageAccessStatus
	pageAccessRoleCount: number
	availablePageCount: number
}

export const isPageAccessBootstrapPending = (settings: SettingsState): boolean => {
	return settings.status === 'idle' || settings.status === 'loading'
}

export const isPageAccessReadyButEmpty = (settings: SettingsState): boolean => {
	return settings.status === 'ready' && (settings.pageAccessRoleCount === 0 || settings.availablePageCount === 0)
}

export const isAlwaysAllowedPath = (path: string): boolean => {
	return path === '/' || path === '/dashboard'
}


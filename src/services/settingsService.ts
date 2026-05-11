/**
 * Settings UI facade over page-access API (role toggles, admin restore).
 * Flow: pageAccessApi settings load/save → canonical role merge before persist.
 */
import { pageAccessApi, type PageAccess, type PageAccessSettings } from '@/api/pageAccess'
import { mergePageAccessByCanonicalRoles } from '@/utils/roles'

export const settingsService = {
	getPageAccessSettings: (): Promise<PageAccessSettings> => pageAccessApi.getSettings(),

	savePageAccessSettings: async (
		settingsToSave: { pageAccessByRole: Record<string, string[]> },
		availablePages: PageAccess[]
	): Promise<PageAccessSettings> => {
		const merged = mergePageAccessByCanonicalRoles(settingsToSave.pageAccessByRole)
		return pageAccessApi.saveSettings(merged, availablePages)
	},

	/** Restore administrator to every known page; keeps other roles as currently stored on the server. */
	resetAdminAccess: async (availablePages: PageAccess[]): Promise<PageAccessSettings> => {
		const current = await pageAccessApi.getSettings()
		const pages = availablePages.length > 0 ? availablePages : current.availablePages
		const allIds = pages.map((p) => p.id)
		const merged = mergePageAccessByCanonicalRoles({
			...current.pageAccessByRole,
			administrator: allIds,
		})
		return pageAccessApi.saveSettings(merged, pages)
	},
}

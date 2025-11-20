import { PageAccess, PageAccessSettings, pageAccessApi } from '@/api/pageAccess';

export const settingsService = {
	getPageAccessSettings: async (): Promise<PageAccessSettings> => {
		return pageAccessApi.getSettings();
	},

	savePageAccessSettings: async (settings: { pageAccessByRole: Record<string, string[]> }): Promise<PageAccessSettings> => {
		return pageAccessApi.saveSettings(settings.pageAccessByRole);
	},

	resetAdminAccess: async (availablePages: PageAccess[]): Promise<PageAccessSettings> => {
		const currentSettings = await settingsService.getPageAccessSettings();
		const allPageIds = availablePages.map(page => page.id);
		const updatedSettings = {
			pageAccessByRole: {
				...currentSettings.pageAccessByRole,
				Administrator: allPageIds
			}
		};
		return settingsService.savePageAccessSettings(updatedSettings);
	}
};
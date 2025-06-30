import { PageAccess } from '@/api/pageAccess';

export interface PageAccessSettings {
  pageAccessByRole: Record<string, string[]>;
  availablePages: PageAccess[];
}

const BASE_URL = '/api/settings';

export const settingsService = {
  // Get page access settings
  getPageAccessSettings: async (): Promise<PageAccessSettings> => {
    try {
      const response = await fetch(`${BASE_URL}/page-access`);
      if (!response.ok) throw new Error('Failed to fetch page access settings');
      return response.json();
    } catch (error) {
      console.error('Error fetching page access settings:', error);
      throw error;
    }
  },

  // Save page access settings
  savePageAccessSettings: async (settings: { pageAccessByRole: Record<string, string[]> }): Promise<PageAccessSettings> => {
    try {
      const response = await fetch(`${BASE_URL}/page-access`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to save page access settings');
      return response.json();
    } catch (error) {
      console.error('Error saving page access settings:', error);
      throw error;
    }
  },

  // Reset admin access
  resetAdminAccess: async (availablePages: PageAccess[]): Promise<PageAccessSettings> => {
    try {
      // Get current settings first
      const currentSettings = await settingsService.getPageAccessSettings();
      
      // Reset administrator access to all available pages
      const allPageIds = availablePages.map(page => page.id);
      const updatedSettings = {
        pageAccessByRole: {
          ...currentSettings.pageAccessByRole,
          Administrator: allPageIds
        }
      };
      
      // Save the updated settings
      return await settingsService.savePageAccessSettings(updatedSettings);
    } catch (error) {
      console.error('Error resetting admin access:', error);
      throw error;
    }
  }
}; 
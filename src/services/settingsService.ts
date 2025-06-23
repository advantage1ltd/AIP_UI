import { PageAccess } from '@/contexts/PageAccessContext';

export interface PageAccessSettings {
  pageAccessByRole: Record<string, string[]>;
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
  savePageAccessSettings: async (settings: PageAccessSettings): Promise<PageAccessSettings> => {
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
      const response = await fetch(`${BASE_URL}/reset-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ availablePages }),
      });
      if (!response.ok) throw new Error('Failed to reset admin access');
      return response.json();
    } catch (error) {
      console.error('Error resetting admin access:', error);
      throw error;
    }
  }
}; 
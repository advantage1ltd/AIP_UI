import { Site } from '@/types/customer';
import { DUMMY_SITES } from '@/data/mockSites';

class SitesService {
  private sites: Site[] = [...DUMMY_SITES];

  async getSites(): Promise<{ success: boolean; data: Site[] }> {
    try {
      return {
        success: true,
        data: this.sites
      };
    } catch (error) {
      return {
        success: false,
        data: []
      };
    }
  }

  async getSitesByCustomer(customerId: string): Promise<{ success: boolean; data: Site[] }> {
    try {
      const customerSites = this.sites.filter(site => site.customerId === customerId);
      return {
        success: true,
        data: customerSites
      };
    } catch (error) {
      return {
        success: false,
        data: []
      };
    }
  }

  async getSitesByRegion(regionId: string): Promise<{ success: boolean; data: Site[] }> {
    try {
      const regionSites = this.sites.filter(site => site.regionId === regionId);
      return {
        success: true,
        data: regionSites
      };
    } catch (error) {
      return {
        success: false,
        data: []
      };
    }
  }

  async createSite(siteData: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data?: Site; message?: string }> {
    try {
      const newSite: Site = {
        ...siteData,
        id: `s${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.sites.push(newSite);

      return {
        success: true,
        data: newSite
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create site'
      };
    }
  }

  async updateSite(id: string, updates: Partial<Omit<Site, 'id' | 'createdAt'>>): Promise<{ success: boolean; data?: Site; message?: string }> {
    try {
      const siteIndex = this.sites.findIndex(site => site.id === id);
      
      if (siteIndex === -1) {
        return {
          success: false,
          message: 'Site not found'
        };
      }

      const updatedSite: Site = {
        ...this.sites[siteIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.sites[siteIndex] = updatedSite;

      return {
        success: true,
        data: updatedSite
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update site'
      };
    }
  }

  async deleteSite(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const siteIndex = this.sites.findIndex(site => site.id === id);
      
      if (siteIndex === -1) {
        return {
          success: false,
          message: 'Site not found'
        };
      }

      this.sites.splice(siteIndex, 1);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete site'
      };
    }
  }

  // Method to get fresh data (for reactive updates)
  getSitesData(): Site[] {
    return [...this.sites];
  }
}

export const sitesService = new SitesService(); 
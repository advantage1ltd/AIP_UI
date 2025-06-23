import { StoreData, RegionalData, Period, UserRole, OfficerDashboardData, Incident, CustomerStoreData, Region, SatisfactionDataPoint, BeSafeDataPoint, DailyActivity, Site } from '@/types/dashboard';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class DashboardService {
  async getOfficerDashboard(): Promise<OfficerDashboardData> {
    const response = await fetch('/api/dashboard/officer')
    if (!response.ok) {
      throw new Error('Failed to fetch officer dashboard data')
    }
    return response.json()
  }

  async getRecentIncidents(): Promise<Incident[]> {
    const response = await fetch('/api/dashboard/incidents')
    if (!response.ok) {
      throw new Error('Failed to fetch recent incidents')
    }
    return response.json()
  }
}

export const dashboardService = new DashboardService()

export const dashboardApi = {
  async getStoreData(storeId: string): Promise<StoreData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stores/${storeId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new APIError(
          error.response?.data?.message || 'Failed to fetch store data',
          error.response?.status,
          error.response?.data?.code
        );
      }
      throw error;
    }
  },

  async getRegionalData(regionId: string): Promise<RegionalData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/regions/${regionId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new APIError(
          error.response?.data?.message || 'Failed to fetch regional data',
          error.response?.status,
          error.response?.data?.code
        );
      }
      throw error;
    }
  },

  async getMetrics(storeId: string, userRole: UserRole) {
    try {
      const response = await axios.get(`${API_BASE_URL}/metrics`, {
        params: { storeId, userRole }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new APIError(
          error.response?.data?.message || 'Failed to fetch metrics',
          error.response?.status,
          error.response?.data?.code
        );
      }
      throw error;
    }
  },

  async getIncidentData(storeId: string, period: Period) {
    try {
      const response = await axios.get(`${API_BASE_URL}/incidents`, {
        params: { storeId, period }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new APIError(
          error.response?.data?.message || 'Failed to fetch incident data',
          error.response?.status,
          error.response?.data?.code
        );
      }
      throw error;
    }
  },

  async getRecentIncidents(storeId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/incidents/recent`, {
        params: { storeId }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new APIError(
          error.response?.data?.message || 'Failed to fetch recent incidents',
          error.response?.status,
          error.response?.data?.code
        );
      }
      throw error;
    }
  }
};

const BASE_URL = '/api/dashboard';

// Helper function to get customer ID from auth context
const getCustomerIdFromAuth = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.companyId || 'COOP001'; // Default to COOP001 for testing
};

// Helper function to add customer ID to headers
const getHeaders = () => ({
  'X-Customer-Id': getCustomerIdFromAuth()
});

const getSites = async (signal?: AbortSignal): Promise<Site[]> => {
  const response = await fetch('/api/dashboard/sites', { 
    signal,
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to fetch sites');
  }
  return response.json();
};

const getStores = async (signal?: AbortSignal): Promise<StoreData[]> => {
  const response = await fetch('/api/dashboard/stores', { 
    signal,
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to fetch stores');
  }
  return response.json();
};

const getRegions = async (signal?: AbortSignal): Promise<Region[]> => {
  const response = await fetch('/api/dashboard/regions', { 
    signal,
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error('Failed to fetch regions');
  }
  return response.json();
};

class CustomerDashboardService {
  private baseUrl = '/api/dashboard';

  private async fetchWithSignal<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Don't log AbortError as it's expected during cleanup
      if (error instanceof Error && error.name === 'AbortError') {
        throw error; // Re-throw AbortError without logging
      }
      // Log and wrap other errors
      console.error(`Failed to fetch ${endpoint}:`, error);
      throw new Error(`Failed to fetch ${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getStores(signal?: AbortSignal): Promise<StoreData[]> {
    return this.fetchWithSignal<StoreData[]>('/stores', signal);
  }

  async getRegions(signal?: AbortSignal): Promise<Region[]> {
    return this.fetchWithSignal<Region[]>('/regions', signal);
  }

  async getSites(signal?: AbortSignal): Promise<Site[]> {
    return this.fetchWithSignal<Site[]>('/sites', signal);
  }

  async getStoreData(storeId: string, signal?: AbortSignal): Promise<CustomerStoreData> {
    return this.fetchWithSignal<CustomerStoreData>(`/store/${storeId}`, signal);
  }

  async getSiteData(siteId: string, signal?: AbortSignal): Promise<CustomerStoreData> {
    return this.fetchWithSignal<CustomerStoreData>(`/site/${siteId}`, signal);
  }

  async getSatisfactionData(signal?: AbortSignal): Promise<SatisfactionDataPoint[]> {
    return this.fetchWithSignal<SatisfactionDataPoint[]>('/satisfaction', signal);
  }

  async getBeSafeData(signal?: AbortSignal): Promise<BeSafeDataPoint[]> {
    return this.fetchWithSignal<BeSafeDataPoint[]>('/be-safe-be-secure', signal);
  }

  async getDailyActivities(signal?: AbortSignal): Promise<DailyActivity[]> {
    return this.fetchWithSignal<DailyActivity[]>('/daily-activities', signal);
  }

  async getAggregatedSitesData(siteIds: string[], signal?: AbortSignal): Promise<CustomerStoreData> {
    return this.fetchWithSignal<CustomerStoreData>(`/sites/aggregate?ids=${siteIds.join(',')}`, signal);
  }
}

export const customerDashboardService = new CustomerDashboardService(); 
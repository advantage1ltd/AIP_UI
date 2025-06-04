import { StoreData, RegionalData, Period, UserRole } from '@/types/dashboard';
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
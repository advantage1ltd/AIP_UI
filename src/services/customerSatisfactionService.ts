import { api } from '@/config/api';
import { getCurrentCustomerId } from '@/lib/utils';
import type {
  CustomerSurvey,
  CustomerSurveyFilters,
  CustomerSurveyResponse,
  CustomerSurveyRequest,
  CustomerSurveyUpdateRequest
} from '@/types/customerSatisfaction';

const BASE_URL = '/customer-satisfaction';

// Helper to get headers with customer ID
const getHeaders = () => {
  const customerId = getCurrentCustomerId();
  // Only include customer ID header if we have one (non-admin users)
  return customerId ? { 'X-Customer-Id': customerId.toString() } : {};
};

export const customerSatisfactionService = {
  // Get paginated list of surveys with optional filters
  async getSurveys(
    page: number = 1,
    pageSize: number = 10,
    filters?: CustomerSurveyFilters
  ): Promise<CustomerSurveyResponse> {
    const params = {
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.customerId && { customerId: filters.customerId }),
      ...(filters?.regionId && { regionId: filters.regionId }),
      ...(filters?.siteId && { siteId: filters.siteId }),
      ...(filters?.dateRange?.from && { from: filters.dateRange.from.toISOString() }),
      ...(filters?.dateRange?.to && { to: filters.dateRange.to.toISOString() })
    };

    const searchParams = new URLSearchParams(params);
    const response = await api.get(`${BASE_URL}?${searchParams.toString()}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  // Get a single survey by ID
  async getSurvey(id: string): Promise<CustomerSurvey> {
    const response = await api.get(`${BASE_URL}/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  // Create a new survey
  async createSurvey(data: CustomerSurveyRequest): Promise<CustomerSurvey> {
    const response = await api.post(BASE_URL, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  // Update an existing survey
  async updateSurvey(id: string, data: CustomerSurveyUpdateRequest): Promise<CustomerSurvey> {
    const response = await api.put(`${BASE_URL}/${id}`, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  // Delete a survey
  async deleteSurvey(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`, {
      headers: getHeaders()
    });
  }
}; 
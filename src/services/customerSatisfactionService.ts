import { api } from '@/config/api';
import type {
  CustomerSurvey,
  CustomerSurveyFilters,
  CustomerSurveyResponse,
  CustomerSurveyRequest,
  CustomerSurveyUpdateRequest
} from '@/types/customerSatisfaction';

const BASE_URL = '/customer-satisfaction';

export const customerSatisfactionService = {
  // Get paginated list of surveys with optional filters
  async getSurveys(
    page: number = 1,
    pageSize: number = 10,
    filters?: CustomerSurveyFilters
  ): Promise<CustomerSurveyResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.customer && { customer: filters.customer }),
      ...(filters?.region && { region: filters.region }),
      ...(filters?.location && { location: filters.location }),
      ...(filters?.dateRange?.from && { from: filters.dateRange.from }),
      ...(filters?.dateRange?.to && { to: filters.dateRange.to })
    });

    const response = await api.get(`${BASE_URL}?${params.toString()}`);
    return response.data;
  },

  // Get a single survey by ID
  async getSurvey(id: string): Promise<CustomerSurvey> {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create a new survey
  async createSurvey(data: CustomerSurveyRequest): Promise<CustomerSurvey> {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  // Update an existing survey
  async updateSurvey(id: string, data: CustomerSurveyUpdateRequest): Promise<CustomerSurvey> {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete a survey
  async deleteSurvey(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  }
}; 
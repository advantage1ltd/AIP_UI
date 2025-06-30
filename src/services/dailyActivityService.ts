import { api } from '@/config/api';
import { getCurrentCustomerId } from '@/lib/utils';
import type {
  DailyActivityReport,
  DailyActivityFilters,
  DailyActivityResponse,
  DailyActivityRequest,
  DailyActivityUpdateRequest
} from '@/types/dailyActivity';

const BASE_URL = '/daily-activity-reports';

// Helper to get headers with customer ID
const getHeaders = () => {
  const customerId = getCurrentCustomerId();
  // Only include customer ID header if we have one (non-admin users)
  return customerId ? { 'X-Customer-Id': customerId.toString() } : {};
};

export const dailyActivityService = {
  // Get paginated list of reports with optional filters
  async getReports(
    page: number = 1,
    pageSize: number = 10,
    filters?: DailyActivityFilters
  ): Promise<DailyActivityResponse> {
    const params = {
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.customerId && { customerId: filters.customerId }),
      ...(filters?.siteId && { siteId: filters.siteId }),
      ...(filters?.reportDate && { reportDate: filters.reportDate }),
      ...(filters?.officerName && { officerName: filters.officerName }),
      ...(filters?.dateRange?.from && { from: filters.dateRange.from.toISOString() }),
      ...(filters?.dateRange?.to && { to: filters.dateRange.to.toISOString() })
    };

    const searchParams = new URLSearchParams(params);
    const response = await api.get(`${BASE_URL}?${searchParams.toString()}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  // Get a single report by ID
  async getReport(id: string): Promise<DailyActivityReport> {
    const response = await api.get(`${BASE_URL}/${id}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  // Create a new report
  async createReport(data: DailyActivityRequest): Promise<DailyActivityReport> {
    const response = await api.post(BASE_URL, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  // Update an existing report
  async updateReport(id: string, data: DailyActivityUpdateRequest): Promise<DailyActivityReport> {
    const response = await api.put(`${BASE_URL}/${id}`, data, {
      headers: getHeaders()
    });
    return response.data;
  },

  // Delete a report
  async deleteReport(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`, {
      headers: getHeaders()
    });
  }
}; 
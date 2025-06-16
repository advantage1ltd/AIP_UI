import { api } from '@/config/api';
import type { 
  HolidayRequest, 
  HolidayRequestsResponse, 
  CreateHolidayRequestDTO, 
  UpdateHolidayRequestDTO,
  HolidayRequestFilters 
} from '@/types/holidayRequest';

const BASE_URL = '/holiday-requests';

export const holidayRequestService = {
  // Get all holiday requests with pagination and filters
  getHolidayRequests: async (filters: HolidayRequestFilters): Promise<HolidayRequestsResponse> => {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status) queryParams.append('status', filters.status);
    if (typeof filters.archived === 'boolean') queryParams.append('archived', filters.archived.toString());

    const response = await api.get(`${BASE_URL}?${queryParams.toString()}`);
    return response.data;
  },

  // Get a single holiday request by ID
  getHolidayRequest: async (id: string): Promise<HolidayRequest> => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create a new holiday request
  createHolidayRequest: async (data: CreateHolidayRequestDTO): Promise<HolidayRequest> => {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  // Update an existing holiday request
  updateHolidayRequest: async (id: string, data: UpdateHolidayRequestDTO): Promise<HolidayRequest> => {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete a holiday request
  deleteHolidayRequest: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },

  // Archive a holiday request
  archiveHolidayRequest: async (id: string): Promise<HolidayRequest> => {
    const response = await api.put(`${BASE_URL}/${id}/archive`);
    return response.data;
  },

  // Unarchive a holiday request
  unarchiveHolidayRequest: async (id: string): Promise<HolidayRequest> => {
    const response = await api.put(`${BASE_URL}/${id}/unarchive`);
    return response.data;
  }
}; 
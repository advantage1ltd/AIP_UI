import { api } from '@/config/api';
import type { 
  BankHoliday, 
  BankHolidayResponse, 
  CreateBankHolidayDTO, 
  UpdateBankHolidayDTO,
  BankHolidayFilters 
} from '@/types/bankHoliday';

const BASE_URL = '/bank-holidays';

export const bankHolidayService = {
  // Get bank holidays with pagination and filters
  getBankHolidays: async (filters: BankHolidayFilters = {}): Promise<BankHolidayResponse> => {
    const { data } = await api.get<BankHolidayResponse>(BASE_URL, { params: filters });
    return data;
  },

  // Get single bank holiday by ID
  getBankHoliday: async (id: string): Promise<BankHoliday> => {
    const { data } = await api.get<BankHoliday>(`${BASE_URL}/${id}`);
    return data;
  },

  // Create new bank holiday
  createBankHoliday: async (bankHoliday: CreateBankHolidayDTO): Promise<BankHoliday> => {
    const { data } = await api.post<BankHoliday>(BASE_URL, bankHoliday);
    return data;
  },

  // Update existing bank holiday
  updateBankHoliday: async (id: string, bankHoliday: UpdateBankHolidayDTO): Promise<BankHoliday> => {
    const { data } = await api.put<BankHoliday>(`${BASE_URL}/${id}`, bankHoliday);
    return data;
  },

  // Delete bank holiday
  deleteBankHoliday: async (id: string): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
  },

  // Archive bank holiday
  archiveBankHoliday: async (id: string): Promise<BankHoliday> => {
    const { data } = await api.put<BankHoliday>(`${BASE_URL}/${id}/archive`);
    return data;
  },

  // Unarchive bank holiday
  unarchiveBankHoliday: async (id: string): Promise<BankHoliday> => {
    const { data } = await api.put<BankHoliday>(`${BASE_URL}/${id}/unarchive`);
    return data;
  }
}; 
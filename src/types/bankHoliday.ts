export interface BankHoliday {
  id: string;
  officerId: string;
  holidayDate: Date;
  dateOfRequest: Date;
  authorisedBy: string;
  dateAuthorised: Date | null;
  status: "authorized" | "declined" | "pending";
  archived: boolean;
  reason?: string;
}

export interface CreateBankHolidayDTO {
  officerId: string;
  holidayDate: Date;
}

export interface UpdateBankHolidayDTO {
  officerId?: string;
  holidayDate?: Date;
  authorisedBy?: string;
  dateAuthorised?: Date | null;
  status?: "authorized" | "declined" | "pending";
  archived?: boolean;
  reason?: string;
}

export interface BankHolidayFilters {
  search?: string;
  page?: number;
  limit?: number;
  archived?: boolean;
}

export interface BankHolidayResponse {
  data: BankHoliday[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 
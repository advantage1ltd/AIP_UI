/** Holiday request list, filters, and create/update DTOs. */
export interface HolidayRequest {
  id: string;
  officerId: string;
  officerName: string;
  startDate: Date;
  endDate: Date;
  returnToWorkDate: Date;
  dateOfRequest: Date;
  authorisedBy: string;
  dateAuthorised: Date | null;
  status: 'pending' | 'approved' | 'denied';
  comment: string;
  reason?: string;
  totalDays: number;
  daysLeftYTD?: number;
  archived: boolean;
}

export interface CreateHolidayRequestDTO {
  officerId: string;
  startDate: Date;
  endDate: Date;
  returnToWorkDate: Date;
  authorisedBy?: string;
  comment?: string;
}

export interface UpdateHolidayRequestDTO extends Partial<CreateHolidayRequestDTO> {
  status?: 'pending' | 'approved' | 'denied';
  dateAuthorised?: Date | null;
  reason?: string;
  daysLeftYTD?: number;
}

export interface HolidayRequestsResponse {
  data: HolidayRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface HolidayRequestFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'pending' | 'approved' | 'denied';
  archived?: boolean;
  /** When set, backend should return only requests for this employee (officer). */
  employeeId?: number;
} 
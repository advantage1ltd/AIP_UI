import { Incident, IncidentStats } from './incidents'

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  pageSize: number
  totalCount: number
  hasPrevious: boolean
  hasNext: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationInfo
}

export interface IncidentResponse extends ApiResponse<Incident> {}
export interface IncidentsResponse extends PaginatedResponse<Incident[]> {}
export interface IncidentStatsResponse extends ApiResponse<IncidentStats & {
	totalAmountRecovered?: number
	totalAmountLost?: number
	totalStolenValue?: number
}> {}

// Query parameters for incidents
export interface GetIncidentsParams {
  page?: number
  pageSize?: number
  search?: string
  fromDate?: string
  toDate?: string
  incidentType?: string
  siteName?: string
  siteId?: string
  status?: string
  customerId?: string
  regionId?: string
  regionName?: string
  [key: string]: string | number | undefined
}

// Create/Update incident request
export interface UpsertIncidentRequest {
  incident: Omit<Incident, 'id' | 'dateInputted'>
} 
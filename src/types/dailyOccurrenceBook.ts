export type OccurrenceType = 
  | 'general_observation'
  | 'security_incident'
  | 'safety_concern'
  | 'visitor_log'
  | 'maintenance_issue'
  | 'equipment_fault'
  | 'staff_arrival_departure'
  | 'emergency_test'
  | 'weather_condition'
  | 'other';

export type OccurrenceSeverity = 'low' | 'medium' | 'high' | 'critical';

export type OccurrenceStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export interface DailyOccurrenceEntry {
  id: string;
  customerId: number;
  siteId: string;
  siteName?: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  occurrenceType: OccurrenceType;
  severity: OccurrenceSeverity;
  status: OccurrenceStatus;
  title: string;
  description: string;
  location: string; // Specific location within the site
  reportedBy: {
    id: string;
    name: string;
    role: string;
    badgeNumber?: string;
  };
  witnessNames?: string[];
  actionTaken?: string;
  followUpRequired: boolean;
  followUpBy?: string; // User ID of person responsible for follow-up
  followUpDate?: string; // ISO date string
  followUpNotes?: string;
  attachments?: {
    id: string;
    filename: string;
    url: string;
    type: string; // 'image' | 'document' | 'video'
    uploadedAt: string;
    uploadedBy: string;
  }[];
  relatedIncidentId?: string; // If this occurrence is related to a formal incident
  managerNotified: boolean;
  managerNotifiedAt?: string;
  managerNotes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface DailyOccurrenceBookFilters {
  dateFrom?: string;
  dateTo?: string;
  occurrenceType?: OccurrenceType[];
  severity?: OccurrenceSeverity[];
  status?: OccurrenceStatus[];
  siteId?: string;
  reportedBy?: string;
  followUpRequired?: boolean;
  searchTerm?: string;
}

export interface DailyOccurrenceBookStats {
  totalEntries: number;
  entriesThisWeek: number;
  entriesThisMonth: number;
  openOccurrences: number;
  highSeverityOccurrences: number;
  followUpsPending: number;
  byType: Record<OccurrenceType, number>;
  bySeverity: Record<OccurrenceSeverity, number>;
  byStatus: Record<OccurrenceStatus, number>;
}

export interface CreateOccurrenceRequest {
  customerId: number;
  siteId: string;
  date: string;
  time: string;
  occurrenceType: OccurrenceType;
  severity: OccurrenceSeverity;
  title: string;
  description: string;
  location: string;
  witnessNames?: string[];
  actionTaken?: string;
  followUpRequired: boolean;
  followUpBy?: string;
  followUpDate?: string;
  followUpNotes?: string;
  managerNotified: boolean;
}

export interface UpdateOccurrenceRequest extends Partial<CreateOccurrenceRequest> {
  id: string;
  status?: OccurrenceStatus;
  managerNotes?: string;
}

// API Response types
export interface DailyOccurrenceBookResponse {
  success: boolean;
  data: DailyOccurrenceEntry[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: DailyOccurrenceBookStats;
  message?: string;
}

export interface SingleOccurrenceResponse {
  success: boolean;
  data: DailyOccurrenceEntry;
  message?: string;
}

export interface OccurrenceStatsResponse {
  success: boolean;
  data: DailyOccurrenceBookStats;
  message?: string;
}
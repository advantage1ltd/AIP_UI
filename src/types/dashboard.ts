/** Home dashboard widgets, store/region metrics, and chart series types. */
import { UserRole } from './user';

export type { UserRole };

export interface Metric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: 'Activity' | 'AlertCircle' | 'Star' | 'Users' | 'Building2';
  color: 'green' | 'amber' | 'blue' | 'purple';
}

export interface IncidentDataPoint {
  date?: string;
  week?: string;
  month?: string;
  year?: string;
  uniformOfficers: number;
  storeDetectives: number;
}

export interface RecentIncident {
  id: string;
  customerId: number;
  date: string;
  regionId: string;
  regionName: string;
  siteId: string;
  siteName: string;
  type: string;
  value: number;
  assignedTo: string;
  customerName: string;
  store: string;
  officerName: string;
  amount: number;
  incidentType: string;
}

export interface CustomerStoreData {
  id: string;
  name: string;
  customerId: number;
  metrics: {
    customer: Metric[];
  };
  recentIncidents: RecentIncident[];
  incidentData: {
    daily: any[];
    weekly: any[];
    monthly: any[];
    yearly: any[];
  };
}

export interface StoreData {
  id: string;
  name: string;
  customerId: number;
  metrics: {
    'customer-site': Metric[];
    'customer-ho': Metric[];
  };
  incidentData: {
    daily: IncidentDataPoint[];
    weekly: IncidentDataPoint[];
    monthly: IncidentDataPoint[];
    yearly: IncidentDataPoint[];
  };
  recentIncidents: Incident[];
}

export interface Region {
  id: string;
  name: string;
  customerId: number;
  code: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyActivity {
  id: string;
  customerId: number;
  type: string;
  location: string;
  time: string;
  officer: string;
  status: 'completed' | 'in_progress';
}

export interface SatisfactionDataPoint {
  id: string;
  customerId: number;
  month: string;
  score: number;
  siteName?: string;
  siteId?: string;
}

export interface SatisfactionBySite {
  siteName: string;
  siteId?: string;
  score: number;
  month: string;
}

export interface BeSafeDataPoint {
  id: string;
  customerId: number;
  month: string;
  insecureAreas: number;
  compliance: number;
  systems: number;
}

export interface Incident {
  id: string;
  customerName: string;
  store: string;
  officerName: string;
  date: string;
  amount: number;
}

export interface RegionalData {
  name: string;
}

export type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Site {
  id: string;
  locationName: string;
  regionId: string;
  customerId: number;
  buildingName: string;
  street: string;
  town: string;
  county: string;
  postcode: string;
  isCoreSite: boolean;
  sinNumber: string;
  telephone: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminIncidentDateRange {
  startDate: Date
  endDate: Date
}

export interface NormalizedAdminIncident {
  id: string
  date: Date
  timeOfIncident?: string
  incidentType: string
  storeName: string
  customerName: string
  officerName: string
  offenderName: string
  policeInvolvement: boolean
  recoveredValue: number
  lossValue: number
  lossValueIsEstimated: boolean
}

export interface AdminIncidentKpiSummary {
  totalIncidents: number
  totalRecoveredValue: number
  totalLossValue: number
  averageLossPerIncident: number
  estimatedLossSamples: number
}

export interface AdminIncidentTrendItem {
  dateKey: string
  label: string
  recoveredValue: number
  lossValue: number
  incidentCount: number
}

export interface AdminIncidentByTypeItem {
  type: string
  incidentCount: number
  recoveredValue: number
  lossValue: number
}

export interface AdminIncidentStoreItem {
  storeName: string
  incidentCount: number
  recoveredValue: number
  lossValue: number
}

export interface AdminIncidentByHourItem {
  hour: number
  label: string
  incidentCount: number
}

export interface AdminIncidentByDayItem {
  day: string
  incidentCount: number
}

export interface AdminIncidentAnalytics {
  kpis: AdminIncidentKpiSummary
  recoveredVsLossTrend: AdminIncidentTrendItem[]
  incidentsByType: AdminIncidentByTypeItem[]
  topStoresByIncidents: AdminIncidentStoreItem[]
  peakHours: AdminIncidentByHourItem[]
  incidentsByDay: AdminIncidentByDayItem[]
}
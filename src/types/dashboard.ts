export interface Metric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
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

export interface BeSafeDataPoint {
  month: string;
  insecureAreas: number | null;
  compliance: number | null;
  systems: number | null;
}

export interface DailyActivity {
  id: string;
  type: string;
  location: string;
  officer: string;
  time: string;
  status: 'completed' | 'in-progress';
}

export interface Store {
  id: string;
  name: string;
}

export interface Region {
  id: string;
  name: string;
}

export interface Incident {
  id: string;
  customerName: string;
  store: string;
  officerName: string;
  date: string;
  amount: number;
}

export interface StoreData {
  name: string;
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

export interface RegionalData {
  name: string;
}

export interface SatisfactionDataPoint {
  month: string;
  score: number;
}

export type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type UserRole = 'customer-site' | 'customer-ho'; 
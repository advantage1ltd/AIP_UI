import { api } from '@/config/api';
import { getCurrentCustomerId } from '@/lib/utils';
import type { DailyActivityReport } from '@/types/dailyActivity';

const BASE_URL = '/daily-activity-analytics';

// Helper to get headers with customer ID
const getHeaders = () => {
  const customerId = getCurrentCustomerId();
  return customerId ? { 'X-Customer-Id': customerId.toString() } : {};
};

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  siteId?: string;
  customerId?: string;
}

export interface SiteBreakdownData {
  site: string;
  siteId: string;
  insecureAreas: number;
  compliance: number;
  systems: number;
}

export interface TypeBreakdownData {
  type: string;
  value: number;
}

export interface InsecureAreaData {
  area: string;
  value: number;
}

export interface SystemsCheckData {
  area: string;
  value: number;
}

export interface ComplianceCheckData {
  name: string;
  value: number;
  color: string;
}

export interface AnalyticsResponse {
  siteBreakdown: SiteBreakdownData[];
  typeBreakdown: TypeBreakdownData[];
  insecureAreas: InsecureAreaData[];
  systemsChecks: SystemsCheckData[];
  complianceChecks: ComplianceCheckData[];
  totalReports: number;
  dateRange: {
    from: string;
    to: string;
  };
}

export const dailyActivityAnalyticsService = {
  // Get analytics data with optional filters
  async getAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsResponse> {
    const params = {
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
      ...(filters?.siteId && { siteId: filters.siteId }),
      ...(filters?.customerId && { customerId: filters.customerId })
    };

    const searchParams = new URLSearchParams(params);
    const response = await api.get(`${BASE_URL}?${searchParams.toString()}`, {
      headers: getHeaders()
    });
    return response.data;
  },

  // Get site breakdown data
  async getSiteBreakdown(filters?: AnalyticsFilters): Promise<SiteBreakdownData[]> {
    const analytics = await this.getAnalytics(filters);
    return analytics.siteBreakdown;
  },

  // Get type breakdown data
  async getTypeBreakdown(filters?: AnalyticsFilters): Promise<TypeBreakdownData[]> {
    const analytics = await this.getAnalytics(filters);
    return analytics.typeBreakdown;
  },

  // Get insecure areas data
  async getInsecureAreas(filters?: AnalyticsFilters): Promise<InsecureAreaData[]> {
    const analytics = await this.getAnalytics(filters);
    return analytics.insecureAreas;
  },

  // Get systems checks data
  async getSystemsChecks(filters?: AnalyticsFilters): Promise<SystemsCheckData[]> {
    const analytics = await this.getAnalytics(filters);
    return analytics.systemsChecks;
  },

  // Get compliance checks data
  async getComplianceChecks(filters?: AnalyticsFilters): Promise<ComplianceCheckData[]> {
    const analytics = await this.getAnalytics(filters);
    return analytics.complianceChecks;
  }
}; 
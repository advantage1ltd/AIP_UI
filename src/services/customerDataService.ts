import { 
  getIncidentsByCustomer, 
  getIncidentStatsByCustomer, 
  getIncidentTrendData,
  type IncidentRecord 
} from '@/data/mockIncidents';

import {
  getSurveysByCustomer,
  getSatisfactionStatsByCustomer,
  getSatisfactionTrendData,
  type CustomerSatisfactionSurvey
} from '@/data/mockCustomerSatisfaction';

import {
  getDailyActivityByCustomer,
  getBeSafeBeSecureData,
  getDailyActivityStatsByCustomer,
  type DailyActivityReport
} from '@/data/mockDailyActivity';

import { DUMMY_CUSTOMERS } from '@/data/customers';

export class CustomerDataService {
  
  // Customer basic info
  static getCustomerInfo(customerId: string) {
    return DUMMY_CUSTOMERS.find(c => c.id === customerId);
  }

  // Incident-related data
  static getCustomerIncidents(customerId: string): IncidentRecord[] {
    return getIncidentsByCustomer(customerId);
  }

  static getCustomerIncidentStats(customerId: string) {
    return getIncidentStatsByCustomer(customerId);
  }

  static getCustomerIncidentTrends(customerId: string) {
    return getIncidentTrendData(customerId);
  }

  // Satisfaction survey data
  static getCustomerSatisfactionSurveys(customerId: string): CustomerSatisfactionSurvey[] {
    return getSurveysByCustomer(customerId);
  }

  static getCustomerSatisfactionStats(customerId: string) {
    return getSatisfactionStatsByCustomer(customerId);
  }

  static getCustomerSatisfactionTrends(customerId: string) {
    return getSatisfactionTrendData(customerId);
  }

  // Daily activity reports
  static getCustomerDailyActivity(customerId: string): DailyActivityReport[] {
    return getDailyActivityByCustomer(customerId);
  }

  static getCustomerDailyActivityStats(customerId: string) {
    return getDailyActivityStatsByCustomer(customerId);
  }

  // Be Safe Be Secure data (derived from daily activity)
  static getCustomerBeSafeBeSecureData(customerId: string) {
    return getBeSafeBeSecureData(customerId);
  }

  // Comprehensive customer dashboard data
  static getCustomerDashboardData(customerId: string) {
    const customer = this.getCustomerInfo(customerId);
    const incidentStats = this.getCustomerIncidentStats(customerId);
    const satisfactionStats = this.getCustomerSatisfactionStats(customerId);
    const dailyActivityStats = this.getCustomerDailyActivityStats(customerId);
    const beSafeData = this.getCustomerBeSafeBeSecureData(customerId);

    return {
      customer,
      incidents: {
        total: incidentStats.totalIncidents,
        valueRecovered: incidentStats.totalValueRecovered,
        openIncidents: incidentStats.openIncidents,
        uniqueStores: incidentStats.uniqueStores,
        incidentTypes: incidentStats.incidentTypes
      },
      satisfaction: {
        averageRating: satisfactionStats.averageOverallRating,
        npsScore: satisfactionStats.npsScore,
        totalSurveys: satisfactionStats.totalSurveys,
        recommendationRate: satisfactionStats.recommendationRate
      },
      dailyActivity: {
        totalReports: dailyActivityStats.totalReports,
        totalHours: dailyActivityStats.totalHours,
        averageQuality: dailyActivityStats.averageReportQuality,
        approvalRate: dailyActivityStats.supervisorApprovalRate
      },
      beSafe: {
        totalChecks: beSafeData.checksBySite.reduce((sum: number, site: any) => 
          sum + site.insecureAreas + site.compliance + site.systems, 0),
        complianceIssues: beSafeData.complianceBreakdown.reduce((sum: number, item: any) => 
          sum + item.value, 0),
        averageQuality: beSafeData.averageReportQuality
      }
    };
  }

  // Regional data filtering
  static getCustomerDataByRegion(customerId: string, regionId: string) {
    const incidents = this.getCustomerIncidents(customerId).filter(i => i.regionId === regionId);
    const surveys = this.getCustomerSatisfactionSurveys(customerId).filter(s => s.regionId === regionId);
    const dailyReports = this.getCustomerDailyActivity(customerId).filter(r => r.regionId === regionId);

    return {
      incidents,
      surveys,
      dailyReports,
      stats: {
        incidentCount: incidents.length,
        averageSatisfaction: surveys.length > 0 ? 
          surveys.reduce((sum, s) => sum + s.overallRating, 0) / surveys.length : 0,
        reportCount: dailyReports.length
      }
    };
  }

  // Site-specific data filtering
  static getCustomerDataBySite(customerId: string, siteId: string) {
    const incidents = this.getCustomerIncidents(customerId).filter(i => i.siteId === siteId);
    const surveys = this.getCustomerSatisfactionSurveys(customerId).filter(s => s.siteId === siteId);
    const dailyReports = this.getCustomerDailyActivity(customerId).filter(r => r.siteId === siteId);

    return {
      incidents,
      surveys,
      dailyReports,
      stats: {
        incidentCount: incidents.length,
        totalValueRecovered: incidents.reduce((sum, i) => sum + (i.valueRecovered || 0), 0),
        averageSatisfaction: surveys.length > 0 ? 
          surveys.reduce((sum, s) => sum + s.overallRating, 0) / surveys.length : 0,
        reportCount: dailyReports.length,
        totalHours: dailyReports.reduce((sum, r) => sum + r.totalHours, 0)
      }
    };
  }

  // Time-based filtering helper
  static filterDataByDateRange<T extends { dateReported?: string; surveyDate?: string; reportDate?: string }>(
    data: T[], 
    startDate?: Date, 
    endDate?: Date
  ): T[] {
    if (!startDate && !endDate) return data;

    return data.filter(item => {
      const itemDate = new Date(
        item.dateReported || item.surveyDate || item.reportDate || ''
      );
      
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      
      return true;
    });
  }
}

export default CustomerDataService; 
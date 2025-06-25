import { http, HttpResponse, delay } from 'msw';
import type { DailyActivityReport } from '@/types/dailyActivity';
import type { 
  AnalyticsResponse, 
  SiteBreakdownData, 
  TypeBreakdownData, 
  InsecureAreaData, 
  SystemsCheckData, 
  ComplianceCheckData 
} from '@/services/dailyActivityAnalyticsService';

// Base API URL
const BASE_API_URL = '/api';

// Helper function to get customer ID from request headers
const getCustomerId = (request: Request): number | null => {
  const customerId = request.headers.get('X-Customer-Id');
  return customerId ? parseInt(customerId, 10) : null;
};

// Helper function to load data from db.json
const loadDbData = async () => {
  try {
    const response = await fetch('/db.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load db.json:', error);
    return null;
  }
};

// Color constants for compliance checks
const COMPLIANCE_COLORS = {
  tills: '#ff6b6b',
  cashOffice: '#4ecdc4',
  cashLevels: '#45b7d1',
  keys: '#96ceb4',
  fireRoutes: '#ffeaa7',
  atm: '#dda0dd',
  poster: '#98d8c8'
};

// Helper function to aggregate data from Daily Activity Reports
const aggregateAnalyticsData = (
  reports: DailyActivityReport[], 
  filters: {
    startDate?: string;
    endDate?: string;
    siteId?: string;
    customerId?: string;
  }
): AnalyticsResponse => {
  console.log('[Analytics] Processing', reports.length, 'reports with filters:', filters);

  // Filter reports based on criteria
  let filteredReports = reports.filter(report => {
    // Filter by customer ID from query params (admin filter)
    if (filters.customerId && report.customerId !== parseInt(filters.customerId, 10)) {
      return false;
    }

    // Filter by site ID
    if (filters.siteId && report.siteId !== filters.siteId) {
      return false;
    }

    // Filter by date range
    if (filters.startDate && report.reportDate < filters.startDate) {
      return false;
    }
    if (filters.endDate && report.reportDate > filters.endDate) {
      return false;
    }

    return true;
  });

  console.log('[Analytics] Filtered to', filteredReports.length, 'reports');

  // Group by site for site breakdown
  const siteGroups = filteredReports.reduce((acc, report) => {
    const key = `${report.siteId}_${report.siteName}`;
    if (!acc[key]) {
      acc[key] = {
        site: report.siteName,
        siteId: report.siteId,
        reports: []
      };
    }
    acc[key].reports.push(report);
    return acc;
  }, {} as Record<string, { site: string; siteId: string; reports: DailyActivityReport[] }>);

  // Calculate site breakdown
  const siteBreakdown: SiteBreakdownData[] = Object.values(siteGroups).map(group => {
    let insecureAreas = 0;
    let compliance = 0;
    let systems = 0;

    group.reports.forEach(report => {
      // Count insecure areas (where value is "no" = problem)
      if (report.insecureAreas) {
        Object.values(report.insecureAreas).forEach(area => {
          if (area.value === 'no') insecureAreas++;
        });
      }

      // Count compliance issues (where value is "yes" = problem)
      if (report.compliance) {
        Object.values(report.compliance).forEach(item => {
          if (item.value === 'yes') compliance++;
        });
      }

      // Count systems not working (where value is "yes" = problem)
      if (report.systemsNotWorking) {
        Object.values(report.systemsNotWorking).forEach(system => {
          if (system.value === 'yes') systems++;
        });
      }
    });

    return {
      site: group.site,
      siteId: group.siteId,
      insecureAreas,
      compliance,
      systems
    };
  });

  // Calculate type breakdown
  const totalInsecureAreas = siteBreakdown.reduce((sum, site) => sum + site.insecureAreas, 0);
  const totalCompliance = siteBreakdown.reduce((sum, site) => sum + site.compliance, 0);
  const totalSystems = siteBreakdown.reduce((sum, site) => sum + site.systems, 0);

  const typeBreakdown: TypeBreakdownData[] = [
    { type: 'Compliance Issues', value: totalCompliance },
    { type: 'Insecure Areas', value: totalInsecureAreas },
    { type: 'Systems Not Working', value: totalSystems }
  ];

  // Calculate insecure areas breakdown
  const insecureAreasCounts = {
    'Kiosk': 0,
    'High Value Room': 0,
    'Managers Office': 0,
    'Warehouse To Sales Floor': 0,
    'Service Yard': 0,
    'Car Park / Grounds': 0,
    'Fire Doors (Back Of House)': 0,
    'Fire Doors (Shop Floor)': 0
  };

  filteredReports.forEach(report => {
    if (report.insecureAreas) {
      if (report.insecureAreas.kioskSecure?.value === 'no') insecureAreasCounts['Kiosk']++;
      if (report.insecureAreas.highValueRoom?.value === 'no') insecureAreasCounts['High Value Room']++;
      if (report.insecureAreas.managersOffice?.value === 'no') insecureAreasCounts['Managers Office']++;
      if (report.insecureAreas.warehouseToSalesFloor?.value === 'no') insecureAreasCounts['Warehouse To Sales Floor']++;
      if (report.insecureAreas.serviceYard?.value === 'no') insecureAreasCounts['Service Yard']++;
      if (report.insecureAreas.carParkGrounds?.value === 'no') insecureAreasCounts['Car Park / Grounds']++;
      if (report.insecureAreas.fireDoorsBackOfHouse?.value === 'no') insecureAreasCounts['Fire Doors (Back Of House)']++;
      if (report.insecureAreas.fireDoorsShopFloor?.value === 'no') insecureAreasCounts['Fire Doors (Shop Floor)']++;
    }
  });

  const insecureAreas: InsecureAreaData[] = Object.entries(insecureAreasCounts).map(([area, value]) => ({
    area,
    value
  }));

  // Calculate systems checks breakdown
  const systemsCounts = {
    'Watch Me Now': 0,
    'CCTV': 0,
    'Intruder Alarm': 0,
    'Keyholding': 0,
    'Body Worn CCTV': 0,
    'Cigarette Tracker': 0,
    'Crime Reporting': 0
  };

  filteredReports.forEach(report => {
    if (report.systemsNotWorking) {
      if (report.systemsNotWorking.watchMeNow?.value === 'yes') systemsCounts['Watch Me Now']++;
      if (report.systemsNotWorking.cctv?.value === 'yes') systemsCounts['CCTV']++;
      if (report.systemsNotWorking.intruderAlarm?.value === 'yes') systemsCounts['Intruder Alarm']++;
      if (report.systemsNotWorking.keyholding?.value === 'yes') systemsCounts['Keyholding']++;
      if (report.systemsNotWorking.bodyWornCctv?.value === 'yes') systemsCounts['Body Worn CCTV']++;
      if (report.systemsNotWorking.cigaretteTracker?.value === 'yes') systemsCounts['Cigarette Tracker']++;
      if (report.systemsNotWorking.crimeReporting?.value === 'yes') systemsCounts['Crime Reporting']++;
    }
  });

  const systemsChecks: SystemsCheckData[] = Object.entries(systemsCounts).map(([area, value]) => ({
    area,
    value
  }));

  // Calculate compliance checks breakdown
  const complianceCounts = {
    'Tills over £150': 0,
    'Cash Office Door Open': 0,
    'Visible Cash On Display': 0,
    'Visible Keys On Display': 0,
    'Fire Routes Blocked': 0,
    'ATM Abuse': 0,
    'Be Safe Be Secure Poster Missing': 0
  };

  filteredReports.forEach(report => {
    if (report.compliance) {
      if (report.compliance.tillsContainedOverCash?.value === 'yes') complianceCounts['Tills over £150']++;
      if (report.compliance.cashOfficeDoorOpen?.value === 'yes') complianceCounts['Cash Office Door Open']++;
      if (report.compliance.visibleCashOnDisplay?.value === 'yes') complianceCounts['Visible Cash On Display']++;
      if (report.compliance.visibleKeysOnDisplay?.value === 'yes') complianceCounts['Visible Keys On Display']++;
      if (report.compliance.fireRoutesBlocked?.value === 'yes') complianceCounts['Fire Routes Blocked']++;
      if (report.compliance.atmAbuse?.value === 'yes') complianceCounts['ATM Abuse']++;
      if (report.compliance.beSafeBSecurePoster?.value === 'no') complianceCounts['Be Safe Be Secure Poster Missing']++;
    }
  });

  const complianceChecks: ComplianceCheckData[] = [
    { name: 'Tills over £150', value: complianceCounts['Tills over £150'], color: COMPLIANCE_COLORS.tills },
    { name: 'Cash Office Door Open', value: complianceCounts['Cash Office Door Open'], color: COMPLIANCE_COLORS.cashOffice },
    { name: 'Visible Cash On Display', value: complianceCounts['Visible Cash On Display'], color: COMPLIANCE_COLORS.cashLevels },
    { name: 'Visible Keys On Display', value: complianceCounts['Visible Keys On Display'], color: COMPLIANCE_COLORS.keys },
    { name: 'Fire Routes Blocked', value: complianceCounts['Fire Routes Blocked'], color: COMPLIANCE_COLORS.fireRoutes },
    { name: 'ATM Abuse', value: complianceCounts['ATM Abuse'], color: COMPLIANCE_COLORS.atm },
    { name: 'Be Safe Be Secure Poster Missing', value: complianceCounts['Be Safe Be Secure Poster Missing'], color: COMPLIANCE_COLORS.poster }
  ];

  // Calculate date range
  const sortedDates = filteredReports.map(r => r.reportDate).sort();
  const dateRange = {
    from: sortedDates[0] || new Date().toISOString().split('T')[0],
    to: sortedDates[sortedDates.length - 1] || new Date().toISOString().split('T')[0]
  };

  return {
    siteBreakdown,
    typeBreakdown,
    insecureAreas,
    systemsChecks,
    complianceChecks,
    totalReports: filteredReports.length,
    dateRange
  };
};

// Helper function to simulate network delay
const simulateDelay = () => delay(100 + Math.random() * 200);

export const dailyActivityAnalyticsHandlers = [
  // GET /api/daily-activity-analytics
  http.get(`${BASE_API_URL}/daily-activity-analytics`, async ({ request }) => {
    try {
      await simulateDelay();
      const url = new URL(request.url);
      const customerId = getCustomerId(request);
      
      console.log('📊 [Analytics] GET /api/daily-activity-analytics', { 
        customerId, 
        searchParams: Object.fromEntries(url.searchParams.entries())
      });

      // Load data from db.json
      const dbData = await loadDbData();
      if (!dbData?.dailyActivityReports) {
        console.error('❌ [Analytics] No daily activity reports found in db.json');
        return new HttpResponse(null, { status: 404 });
      }

      let reports: DailyActivityReport[] = dbData.dailyActivityReports;
      console.log('📊 [Analytics] Total reports in db.json:', reports.length);

      // Filter by customer ID from headers (for non-admin users)
      if (customerId !== null && customerId !== undefined) {
        reports = reports.filter(report => report.customerId === customerId);
        console.log('📊 [Analytics] Reports after customer filter (customerId:', customerId, '):', reports.length);
        console.log('📊 [Analytics] Report sites:', reports.map(r => `${r.id}: ${r.siteName}`));
      }

      // Extract filters from query parameters
      const filters = {
        startDate: url.searchParams.get('startDate') || undefined,
        endDate: url.searchParams.get('endDate') || undefined,
        siteId: url.searchParams.get('siteId') || undefined,
        customerId: url.searchParams.get('customerId') || undefined
      };

      // Aggregate the analytics data
      const analyticsData = aggregateAnalyticsData(reports, filters);

      console.log('✅ [Analytics] Returning analytics data:', {
        totalReports: analyticsData.totalReports,
        siteBreakdownCount: analyticsData.siteBreakdown.length,
        siteBreakdown: analyticsData.siteBreakdown,
        dateRange: analyticsData.dateRange
      });

      return HttpResponse.json(analyticsData);
    } catch (error) {
      console.error('❌ [Analytics] Error in analytics handler:', error);
      return new HttpResponse(null, { status: 500 });
    }
  })
]; 
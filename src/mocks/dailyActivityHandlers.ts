import { http, HttpResponse, delay } from 'msw';
import type { 
  DailyActivityReport, 
  DailyActivityRequest, 
  DailyActivityResponse, 
  DailyActivityUpdateRequest 
} from '@/types/dailyActivity';

// Base API URL
const BASE_API_URL = '/api';

// Helper function to get customer ID from request headers
const getCustomerId = (request: Request): number | null => {
  const customerId = request.headers.get('X-Customer-Id');
  // If no customer ID header is present, return null (admin user)
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

// Helper function to save data to db.json (simulation - in real app would be backend)
let reportData: DailyActivityReport[] = [];

// Initialize data from db.json
const initializeData = async () => {
  const dbData = await loadDbData();
  if (dbData?.dailyActivityReports) {
    reportData = dbData.dailyActivityReports;
  }
};

// Initialize on module load
initializeData();

// Helper function to filter reports based on query parameters
const filterReports = (reports: DailyActivityReport[], searchParams: URLSearchParams, customerId?: number | null) => {
  return reports.filter(report => {
    // Filter by customer ID if provided (null means admin user - show all customers)
    if (customerId !== null && customerId !== undefined && report.customerId !== customerId) {
      return false;
    }

    const searchTerm = searchParams.get('search')?.toLowerCase() || '';
    const filterCustomerId = searchParams.get('customerId'); // Admin filter by customer
    const siteId = searchParams.get('siteId');
    const reportDate = searchParams.get('reportDate');
    const officerName = searchParams.get('officerName');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Text search across multiple fields
    if (searchTerm && !(
      report.officerName.toLowerCase().includes(searchTerm) ||
      report.customerName.toLowerCase().includes(searchTerm) ||
      report.siteName.toLowerCase().includes(searchTerm) ||
      report.notes.toLowerCase().includes(searchTerm)
    )) {
      return false;
    }

    // Filter by customer ID from query params (admin filter)
    if (filterCustomerId && report.customerId !== parseInt(filterCustomerId, 10)) {
      return false;
    }

    // Filter by site ID
    if (siteId && report.siteId !== siteId) {
      return false;
    }

    // Filter by specific report date
    if (reportDate && report.reportDate !== reportDate) {
      return false;
    }

    // Filter by officer name
    if (officerName && !report.officerName.toLowerCase().includes(officerName.toLowerCase())) {
      return false;
    }

    // Filter by date range
    if (from && new Date(report.reportDate) < new Date(from)) {
      return false;
    }
    if (to && new Date(report.reportDate) > new Date(to)) {
      return false;
    }

    return true;
  });
};

// Helper function to simulate network delay
const simulateDelay = () => delay(200 + Math.random() * 100);

// Helper function to generate new ID
const generateId = () => {
  const existingIds = reportData.map(r => parseInt(r.id.replace('DAR', ''), 10));
  const maxId = Math.max(...existingIds, 0);
  return `DAR${String(maxId + 1).padStart(3, '0')}`;
};

export const dailyActivityHandlers = [
  // GET /api/daily-activity-reports
  http.get(`${BASE_API_URL}/daily-activity-reports`, async ({ request }) => {
    try {
      await simulateDelay();
      const url = new URL(request.url);
      const customerId = getCustomerId(request);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 GET /api/daily-activity-reports', { customerId, searchParams: url.searchParams });
      }

      const page = Number(url.searchParams.get('page')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;

      // Reload data to ensure we have the latest
      await initializeData();

      const filteredReports = filterReports(reportData, url.searchParams, customerId);
      
      // Sort by date (newest first)
      const sortedReports = filteredReports.sort((a, b) => 
        new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
      );

      const paginatedReports = sortedReports.slice(
        (page - 1) * pageSize,
        page * pageSize
      );

      const response: DailyActivityResponse = {
        data: paginatedReports,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          total: filteredReports.length
        }
      };

      return HttpResponse.json(response);
    } catch (error) {
      console.error('Error in GET /api/daily-activity-reports:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // GET /api/daily-activity-reports/:id
  http.get(`${BASE_API_URL}/daily-activity-reports/:id`, async ({ params, request }) => {
    try {
      await simulateDelay();
      const customerId = getCustomerId(request);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 GET /api/daily-activity-reports/:id', params.id);
      }

      // Reload data to ensure we have the latest
      await initializeData();

      // Admin users can access reports from any customer, others are filtered by customer ID
      const report = customerId !== null 
        ? reportData.find(r => r.id === params.id && r.customerId === customerId)
        : reportData.find(r => r.id === params.id);
      
      if (!report) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(report);
    } catch (error) {
      console.error('Error in GET /api/daily-activity-reports/:id:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // POST /api/daily-activity-reports
  http.post(`${BASE_API_URL}/daily-activity-reports`, async ({ request }) => {
    try {
      await simulateDelay();
      const requestData = await request.json();
      const data = requestData as DailyActivityRequest;
      const customerId = getCustomerId(request);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 POST /api/daily-activity-reports', data);
      }

      // Reload data to ensure we have the latest
      await initializeData();

      // For admin users (customerId is null), we need to determine the customer from the report data
      // For now, we'll assign based on the customer name in the report
      let assignedCustomerId = customerId;
      if (customerId === null) {
        // Map customer names to IDs for admin-created reports
        const customerNameToId: Record<string, number> = {
          'Central England COOP': 21,
          'Heart of England': 22,
          'Midcounties COOP': 23
        };
        assignedCustomerId = customerNameToId[data.customerName] || 21; // Default to first customer
      }

      const newReport: DailyActivityReport = {
        ...data,
        id: generateId(),
        customerId: assignedCustomerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to our in-memory data (in real app, this would save to database)
      reportData = [newReport, ...reportData];

      return HttpResponse.json(newReport, { status: 201 });
    } catch (error) {
      console.error('Error in POST /api/daily-activity-reports:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // PUT /api/daily-activity-reports/:id
  http.put(`${BASE_API_URL}/daily-activity-reports/:id`, async ({ params, request }) => {
    try {
      await simulateDelay();
      const requestData = await request.json();
      const data = requestData as DailyActivityUpdateRequest;
      const customerId = getCustomerId(request);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 PUT /api/daily-activity-reports/:id', params.id, data);
      }

      // Reload data to ensure we have the latest
      await initializeData();

      // Admin users can update reports from any customer, others are filtered by customer ID
      const index = customerId !== null 
        ? reportData.findIndex(r => r.id === params.id && r.customerId === customerId)
        : reportData.findIndex(r => r.id === params.id);
      
      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      const updatedReport: DailyActivityReport = {
        ...reportData[index],
        ...data,
        updatedAt: new Date().toISOString()
      };

      // Update in our in-memory data (in real app, this would update in database)
      reportData[index] = updatedReport;

      return HttpResponse.json(updatedReport);
    } catch (error) {
      console.error('Error in PUT /api/daily-activity-reports/:id:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // DELETE /api/daily-activity-reports/:id
  http.delete(`${BASE_API_URL}/daily-activity-reports/:id`, async ({ params, request }) => {
    try {
      await simulateDelay();
      const customerId = getCustomerId(request);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 DELETE /api/daily-activity-reports/:id', params.id);
      }

      // Reload data to ensure we have the latest
      await initializeData();

      // Admin users can delete reports from any customer, others are filtered by customer ID
      const index = customerId !== null 
        ? reportData.findIndex(r => r.id === params.id && r.customerId === customerId)
        : reportData.findIndex(r => r.id === params.id);
      
      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      // Remove from our in-memory data (in real app, this would delete from database)
      reportData = reportData.filter(r => r.id !== params.id);

      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      console.error('Error in DELETE /api/daily-activity-reports/:id:', error);
      return new HttpResponse(null, { status: 500 });
    }
  })
]; 
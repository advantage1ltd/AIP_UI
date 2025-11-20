import { http, HttpResponse, delay } from 'msw';
import { BASE_API_URL } from '@/config/api';
import type { CustomerSurvey, CustomerSurveyRequest, CustomerSurveyResponse, CustomerSurveyUpdateRequest } from '@/types/customerSatisfaction';

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
let surveyData: CustomerSurvey[] = [];

// Initialize data from db.json
const initializeData = async () => {
  const dbData = await loadDbData();
  if (dbData?.customerSatisfactionSurveys) {
    surveyData = dbData.customerSatisfactionSurveys;
  }
};

// Initialize on module load
initializeData();

// Helper function to filter surveys based on query parameters
const filterSurveys = (surveys: CustomerSurvey[], searchParams: URLSearchParams, customerId?: number | null) => {
  return surveys.filter(survey => {
    // Filter by customer ID if provided (null means admin user - show all customers)
    if (customerId !== null && customerId !== undefined && survey.customerId !== customerId) {
      return false;
    }

    const searchTerm = searchParams.get('search')?.toLowerCase() || '';
    const filterCustomerId = searchParams.get('customerId'); // Admin filter by customer
    const regionId = searchParams.get('regionId');
    const siteId = searchParams.get('siteId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Text search across multiple fields
    if (searchTerm && !(
      survey.officerName.toLowerCase().includes(searchTerm) ||
      survey.customer.toLowerCase().includes(searchTerm) ||
      survey.location.toLowerCase().includes(searchTerm) ||
      survey.storeManagerName.toLowerCase().includes(searchTerm) ||
      survey.areaManagerName.toLowerCase().includes(searchTerm)
    )) {
      return false;
    }

    // Filter by customer ID from query params (admin filter)
    if (filterCustomerId && survey.customerId !== parseInt(filterCustomerId, 10)) {
      return false;
    }

    // Filter by region ID - map dashboard region IDs to survey region names
    if (regionId) {
      const regionIdToName: Record<string, string> = {
        'r1': 'Central England', // East Midlands -> Central England
        'r2': 'Central England', // West Midlands -> Central England
        'r3': 'Midcounties',    // Oxfordshire & Gloucestershire -> Midcounties
        'r4': 'Midcounties',    // Wiltshire & Somerset -> Midcounties
        'r5': 'Heart of England', // Coventry & Warwickshire -> Heart of England
        'r6': 'Heart of England'  // Leicestershire & Northamptonshire -> Heart of England
      };
      const expectedRegionName = regionIdToName[regionId];
      if (expectedRegionName && survey.region !== expectedRegionName) {
        return false;
      }
    }

    // Filter by site ID - map actual site IDs to survey location names
    if (siteId) {
      const siteIdToLocation: Record<string, string> = {
        // Map actual site IDs to exact survey location names as they appear in data
        'SITE001': 'Leicester Store',    // Leicester Central → Leicester Store
        'SITE002': 'Birmingham Central Store',
        'SITE003': 'Sheffield Branch',
        'SITE004': 'Oxford Store',
        'SITE005': 'Cheltenham Store',
        'SITE006': 'Swindon Branch',
        'SITE007': 'Coventry Store',
        'SITE008': 'Nuneaton Main Store',
        'SITE009': 'Rugby Store',
        'SITE010': 'Worcester Store',
        'SITE011': 'Solihull Store',
        'SITE012': 'Stratford Store',
        'SITE013': 'Warwick Store',
        'SITE014': 'Northampton Store',
        // Legacy support for old site IDs
        's1': 'Leicester Store',
        's2': 'Birmingham Central Store',
        's3': 'Sheffield Branch'
      };
      const expectedLocation = siteIdToLocation[siteId];
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 [CustomerSatisfaction] Site filtering:', { 
          siteId, 
          expectedLocation, 
          surveyLocation: survey.location,
          match: expectedLocation ? survey.location === expectedLocation : 'no-filter'
        });
      }
      
      if (expectedLocation && survey.location !== expectedLocation) {
        return false;
      }
    }

    // Filter by date range
    if (from && new Date(survey.date) < new Date(from)) {
      return false;
    }
    if (to && new Date(survey.date) > new Date(to)) {
      return false;
    }

    return true;
  });
};

// Helper function to simulate network delay
const simulateDelay = () => delay(200 + Math.random() * 100);

// Helper function to generate new ID
const generateId = () => {
  const existingIds = surveyData.map(s => parseInt(s.id.replace('CS', ''), 10));
  const maxId = Math.max(...existingIds, 0);
  return `CS${String(maxId + 1).padStart(3, '0')}`;
};

export const customerSatisfactionHandlers = [
  // GET /api/customer-satisfaction
  http.get(`${BASE_API_URL}/customer-satisfaction`, async ({ request }) => {
    try {
      await simulateDelay();
      const url = new URL(request.url);
      const customerId = getCustomerId(request);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 GET /api/customer-satisfaction', { customerId, searchParams: url.searchParams });
      }

      const page = Number(url.searchParams.get('page')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;

      // Reload data to ensure we have the latest
      await initializeData();

      const filteredSurveys = filterSurveys(surveyData, url.searchParams, customerId);
      
      // Sort by date (newest first)
      const sortedSurveys = filteredSurveys.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const paginatedSurveys = sortedSurveys.slice(
        (page - 1) * pageSize,
        page * pageSize
      );

      const response: CustomerSurveyResponse = {
        data: paginatedSurveys,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          total: filteredSurveys.length
        }
      };

      return HttpResponse.json(response);
    } catch (error) {
      console.error('Error in GET /api/customer-satisfaction:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // GET /api/customer-satisfaction/:id
  http.get(`${BASE_API_URL}/customer-satisfaction/:id`, async ({ params, request }) => {
    try {
      await simulateDelay();
      const customerId = getCustomerId(request);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 GET /api/customer-satisfaction/:id', params.id);
      }

      // Reload data to ensure we have the latest
      await initializeData();

      // Admin users can access surveys from any customer, others are filtered by customer ID
      const survey = customerId !== null 
        ? surveyData.find(s => s.id === params.id && s.customerId === customerId)
        : surveyData.find(s => s.id === params.id);
      
      if (!survey) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(survey);
    } catch (error) {
      console.error('Error in GET /api/customer-satisfaction/:id:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // POST /api/customer-satisfaction
  http.post(`${BASE_API_URL}/customer-satisfaction`, async ({ request }) => {
    try {
      await simulateDelay();
      const requestData = await request.json();
      const data = requestData as CustomerSurveyRequest;
      const customerId = getCustomerId(request);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 POST /api/customer-satisfaction', data);
      }

      // Reload data to ensure we have the latest
      await initializeData();

      // For admin users (customerId is null), we need to determine the customer from the survey data
      // For now, we'll assign based on the customer name in the survey
      let assignedCustomerId = customerId;
      if (customerId === null) {
        // Map customer names to IDs for admin-created surveys
        const customerNameToId: Record<string, number> = {
          'Central England COOP': 21,
          'Heart of England': 22,
          'Midcounties COOP': 23
        };
        assignedCustomerId = customerNameToId[data.customer] || 21; // Default to first customer
      }

      const newSurvey: CustomerSurvey = {
        ...data,
        id: generateId(),
        customerId: assignedCustomerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add to our in-memory data (in real app, this would save to database)
      surveyData = [newSurvey, ...surveyData];

      return HttpResponse.json(newSurvey, { status: 201 });
    } catch (error) {
      console.error('Error in POST /api/customer-satisfaction:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // PUT /api/customer-satisfaction/:id
  http.put(`${BASE_API_URL}/customer-satisfaction/:id`, async ({ params, request }) => {
    try {
      await simulateDelay();
      const requestData = await request.json();
      const data = requestData as CustomerSurveyUpdateRequest;
      const customerId = getCustomerId(request);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 PUT /api/customer-satisfaction/:id', params.id, data);
      }

      // Reload data to ensure we have the latest
      await initializeData();

      // Admin users can update surveys from any customer, others are filtered by customer ID
      const index = customerId !== null 
        ? surveyData.findIndex(s => s.id === params.id && s.customerId === customerId)
        : surveyData.findIndex(s => s.id === params.id);
      
      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      const updatedSurvey: CustomerSurvey = {
        ...surveyData[index],
        ...data,
        updatedAt: new Date().toISOString()
      };

      // Update in our in-memory data (in real app, this would update in database)
      surveyData[index] = updatedSurvey;

      return HttpResponse.json(updatedSurvey);
    } catch (error) {
      console.error('Error in PUT /api/customer-satisfaction/:id:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // DELETE /api/customer-satisfaction/:id
  http.delete(`${BASE_API_URL}/customer-satisfaction/:id`, async ({ params, request }) => {
    try {
      await simulateDelay();
      const customerId = getCustomerId(request);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📥 DELETE /api/customer-satisfaction/:id', params.id);
      }

      // Reload data to ensure we have the latest
      await initializeData();

      // Admin users can delete surveys from any customer, others are filtered by customer ID
      const index = customerId !== null 
        ? surveyData.findIndex(s => s.id === params.id && s.customerId === customerId)
        : surveyData.findIndex(s => s.id === params.id);
      
      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      // Remove from our in-memory data (in real app, this would delete from database)
      surveyData = surveyData.filter(s => s.id !== params.id);

      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      console.error('Error in DELETE /api/customer-satisfaction/:id:', error);
      return new HttpResponse(null, { status: 500 });
    }
  })
]; 
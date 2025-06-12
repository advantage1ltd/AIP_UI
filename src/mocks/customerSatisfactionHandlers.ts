import { http, HttpResponse, delay } from 'msw';
import { generateMockSurveys } from '@/pages/operations/CustomerSatisfactionPage';
import type { CustomerSurvey, CustomerSurveyRequest, CustomerSurveyResponse, CustomerSurveyUpdateRequest } from '@/types/customerSatisfaction';

// Initialize mock data
let mockSurveys = generateMockSurveys(50);

// Helper function to filter surveys based on query parameters
const filterSurveys = (surveys: CustomerSurvey[], searchParams: URLSearchParams) => {
  return surveys.filter(survey => {
    const searchTerm = searchParams.get('search')?.toLowerCase() || '';
    const customer = searchParams.get('customer');
    const region = searchParams.get('region');
    const location = searchParams.get('location');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Text search across multiple fields
    if (searchTerm && !Object.values(survey).some(value => 
      String(value).toLowerCase().includes(searchTerm)
    )) {
      return false;
    }

    // Filter by customer
    if (customer && survey.customer !== customer) {
      return false;
    }

    // Filter by region
    if (region && survey.region !== region) {
      return false;
    }

    // Filter by location
    if (location && survey.location !== location) {
      return false;
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
const simulateDelay = () => delay(300 + Math.random() * 200);

export const customerSatisfactionHandlers = [
  // GET /api/customer-satisfaction
  http.get('/api/customer-satisfaction', async ({ request }) => {
    try {
      await simulateDelay();
      const url = new URL(request.url);
      console.log('📥 GET /api/customer-satisfaction', url.searchParams);

      const page = Number(url.searchParams.get('page')) || 1;
      const pageSize = Number(url.searchParams.get('pageSize')) || 10;

      const filteredSurveys = filterSurveys(mockSurveys, url.searchParams);
      const paginatedSurveys = filteredSurveys.slice(
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
  http.get('/api/customer-satisfaction/:id', async ({ params }) => {
    try {
      await simulateDelay();
      console.log('📥 GET /api/customer-satisfaction/:id', params.id);

      const survey = mockSurveys.find(s => s.id === params.id);
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
  http.post('/api/customer-satisfaction', async ({ request }) => {
    try {
      await simulateDelay();
      const requestData = await request.json();
      const data = requestData as CustomerSurveyRequest;
      console.log('📥 POST /api/customer-satisfaction', data);

      const newSurvey: CustomerSurvey = {
        ...data,
        id: Math.random().toString(36).substring(2, 15)
      };

      mockSurveys = [newSurvey, ...mockSurveys];

      return HttpResponse.json(newSurvey);
    } catch (error) {
      console.error('Error in POST /api/customer-satisfaction:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // PUT /api/customer-satisfaction/:id
  http.put('/api/customer-satisfaction/:id', async ({ params, request }) => {
    try {
      await simulateDelay();
      const requestData = await request.json();
      const data = requestData as CustomerSurveyUpdateRequest;
      console.log('📥 PUT /api/customer-satisfaction/:id', params.id, data);

      const index = mockSurveys.findIndex(s => s.id === params.id);
      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      const updatedSurvey: CustomerSurvey = {
        ...mockSurveys[index],
        ...data
      };

      mockSurveys[index] = updatedSurvey;

      return HttpResponse.json(updatedSurvey);
    } catch (error) {
      console.error('Error in PUT /api/customer-satisfaction/:id:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // DELETE /api/customer-satisfaction/:id
  http.delete('/api/customer-satisfaction/:id', async ({ params }) => {
    try {
      await simulateDelay();
      console.log('📥 DELETE /api/customer-satisfaction/:id', params.id);

      const index = mockSurveys.findIndex(s => s.id === params.id);
      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      mockSurveys = mockSurveys.filter(s => s.id !== params.id);

      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      console.error('Error in DELETE /api/customer-satisfaction/:id:', error);
      return new HttpResponse(null, { status: 500 });
    }
  })
]; 
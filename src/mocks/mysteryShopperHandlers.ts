import { http, HttpResponse, delay } from 'msw'
import { mockOfficers, mockCustomers, mockLocations, evaluationCriteria } from '@/components/mystery-shopper/mockData'
import { v4 as uuidv4 } from 'uuid'
import type { MysteryShopperEvaluation } from '@/types/mysteryShopper'

// Base API URL
const API_URL = '/api'

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

// In-memory store for mystery shopper evaluations with sample data
let mysteryShopperEvaluations: MysteryShopperEvaluation[] = [
  {
    id: 'ms001',
    officerId: 'OFF001',
    officerName: 'John Smith',
    customerId: 21,
    customerName: 'Central England COOP',
    siteId: 's1',
    location: 'LOC001',
    locationName: 'Leicester Central',
    date: '2024-01-15',
    time: '14:30',
    mysteryShopperName: 'Sarah Wilson',
    scores: {
      location: { score: 4, comments: 'Good positioning' },
      security: { score: 5, comments: 'Very alert' },
      presentation: { score: 6, comments: 'Professional appearance' },
      license: { score: 3, comments: 'License visible' },
      customer: { score: 4, comments: 'Helpful approach' },
      courtesy: { score: 5, comments: 'Polite and courteous' },
      knowledge: { score: 4, comments: 'Good store knowledge' },
      professionalism: { score: 5, comments: 'Excellent service' }
    },
    totalScore: 36,
    maxPossibleScore: 40,
    percentage: '90.0',
    createdAt: '2024-01-15T14:30:00.000Z',
    updatedAt: '2024-01-15T14:30:00.000Z',
    status: 'submitted'
  },
  {
    id: 'ms002',
    officerId: 'OFF002',
    officerName: 'Sarah Johnson',
    customerId: 22,
    customerName: 'Heart of England',
    siteId: 's5',
    location: 'LOC002',
    locationName: 'Coventry Central',
    date: '2024-01-10',
    time: '10:15',
    mysteryShopperName: 'Mark Thompson',
    scores: {
      location: { score: 3, comments: 'Could improve positioning' },
      security: { score: 4, comments: 'Alert but distracted' },
      presentation: { score: 5, comments: 'Well presented' },
      license: { score: 3, comments: 'License displayed' },
      customer: { score: 3, comments: 'Slow to acknowledge' },
      courtesy: { score: 4, comments: 'Polite when engaged' },
      knowledge: { score: 3, comments: 'Basic knowledge' },
      professionalism: { score: 4, comments: 'Professional service' }
    },
    totalScore: 29,
    maxPossibleScore: 40,
    percentage: '72.5',
    createdAt: '2024-01-10T10:15:00.000Z',
    updatedAt: '2024-01-10T10:15:00.000Z',
    status: 'submitted'
  }
];

// Helper function to filter evaluations based on query parameters
const filterEvaluations = (evaluations: MysteryShopperEvaluation[], searchParams: URLSearchParams, customerId?: number | null) => {
  return evaluations.filter(evaluation => {
    // Filter by customer ID if provided (null means admin user - show all customers)
    if (customerId !== null && customerId !== undefined && evaluation.customerId !== customerId) {
      return false;
    }

    const searchTerm = searchParams.get('search')?.toLowerCase() || '';
    const filterCustomerId = searchParams.get('customerId'); // Admin filter by customer
    const siteId = searchParams.get('siteId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Text search across multiple fields
    if (searchTerm && !(
      evaluation.officerName.toLowerCase().includes(searchTerm) ||
      evaluation.customerName.toLowerCase().includes(searchTerm) ||
      evaluation.locationName.toLowerCase().includes(searchTerm) ||
      evaluation.mysteryShopperName.toLowerCase().includes(searchTerm)
    )) {
      return false;
    }

    // Filter by customer ID from query params (admin filter)
    if (filterCustomerId && evaluation.customerId !== parseInt(filterCustomerId, 10)) {
      return false;
    }

    // Filter by site ID
    if (siteId && evaluation.siteId !== siteId) {
      return false;
    }

    // Filter by date range
    if (from && new Date(evaluation.date) < new Date(from)) {
      return false;
    }
    if (to && new Date(evaluation.date) > new Date(to)) {
      return false;
    }

    return true;
  });
};

// Helper function to simulate network delay
const simulateDelay = () => delay(200 + Math.random() * 100);

export const mysteryShopperHandlers = [
  // GET /api/mystery-shopper/officers - Get all officers
  http.get(`${API_URL}/mystery-shopper/officers`, async ({ request }) => {
    await simulateDelay();
    const customerId = getCustomerId(request);
    
    console.log('📥 GET /api/mystery-shopper/officers', { customerId });
    
    return HttpResponse.json({
      success: true,
      data: mockOfficers
    });
  }),

  // GET /api/mystery-shopper/customers - Get all customers
  http.get(`${API_URL}/mystery-shopper/customers`, async ({ request }) => {
    await simulateDelay();
    const customerId = getCustomerId(request);
    
    console.log('📥 GET /api/mystery-shopper/customers', { customerId });
    
    return HttpResponse.json({
      success: true,
      data: mockCustomers
    });
  }),

  // GET /api/mystery-shopper/locations - Get all locations
  http.get(`${API_URL}/mystery-shopper/locations`, async ({ request }) => {
    await simulateDelay();
    const customerId = getCustomerId(request);
    
    console.log('📥 GET /api/mystery-shopper/locations', { customerId });
    
    return HttpResponse.json({
      success: true,
      data: mockLocations
    });
  }),

  // GET /api/mystery-shopper/evaluation-criteria - Get evaluation criteria
  http.get(`${API_URL}/mystery-shopper/evaluation-criteria`, async ({ request }) => {
    await simulateDelay();
    
    console.log('📥 GET /api/mystery-shopper/evaluation-criteria');
    
    return HttpResponse.json({
      success: true,
      data: evaluationCriteria
    });
  }),

  // GET /api/mystery-shopper/evaluations - Get all evaluations
  http.get(`${API_URL}/mystery-shopper/evaluations`, async ({ request }) => {
    try {
      await simulateDelay();
      const url = new URL(request.url);
      const customerId = getCustomerId(request);
      
      console.log('📥 GET /api/mystery-shopper/evaluations', { 
        customerId, 
        searchParams: url.searchParams 
      });

      const page = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

      const filteredEvaluations = filterEvaluations(mysteryShopperEvaluations, url.searchParams, customerId);
      
      // Sort by date (newest first)
      const sortedEvaluations = filteredEvaluations.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const paginatedEvaluations = sortedEvaluations.slice(
        (page - 1) * pageSize,
        page * pageSize
      );

      const response = {
        data: paginatedEvaluations,
        pagination: {
          currentPage: page,
          pageSize: pageSize,
          total: filteredEvaluations.length
        }
      };

      console.log('📤 Mystery shopper evaluations response:', response);
      return HttpResponse.json(response);
    } catch (error) {
      console.error('Error in GET /api/mystery-shopper/evaluations:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // GET /api/mystery-shopper/evaluations/:id - Get single evaluation
  http.get(`${API_URL}/mystery-shopper/evaluations/:id`, async ({ params, request }) => {
    try {
      await simulateDelay();
      const customerId = getCustomerId(request);
      
      console.log('📥 GET /api/mystery-shopper/evaluations/:id', params.id);

      // Admin users can access evaluations from any customer, others are filtered by customer ID
      const evaluation = customerId !== null 
        ? mysteryShopperEvaluations.find(e => e.id === params.id && e.customerId === customerId)
        : mysteryShopperEvaluations.find(e => e.id === params.id);
      
      if (!evaluation) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(evaluation);
    } catch (error) {
      console.error('Error in GET /api/mystery-shopper/evaluations/:id:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // POST /api/mystery-shopper/evaluations - Submit new evaluation
  http.post(`${API_URL}/mystery-shopper/evaluations`, async ({ request }) => {
    try {
      await simulateDelay();
      const customerId = getCustomerId(request);
      
      console.log('📥 POST /api/mystery-shopper/evaluations', { customerId });
      
      const body = await request.json() as Omit<MysteryShopperEvaluation, 'id' | 'createdAt' | 'updatedAt' | 'status'>;
      
      const evaluation: MysteryShopperEvaluation = {
        ...body,
        id: uuidv4(),
        customerId: customerId || body.customerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'submitted'
      };
      
      // Add new evaluation to the top
      mysteryShopperEvaluations.unshift(evaluation);
      
      console.log('📤 Created mystery shopper evaluation:', evaluation);
      
      return HttpResponse.json({
        success: true,
        data: evaluation,
        message: 'Evaluation submitted successfully'
      }, { status: 201 });
    } catch (error) {
      console.error('Error in POST /api/mystery-shopper/evaluations:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // PUT /api/mystery-shopper/evaluations/:id - Update evaluation
  http.put(`${API_URL}/mystery-shopper/evaluations/:id`, async ({ params, request }) => {
    try {
      await simulateDelay();
      const customerId = getCustomerId(request);
      
      console.log('📥 PUT /api/mystery-shopper/evaluations/:id', params.id);
      
      const body = await request.json() as Partial<MysteryShopperEvaluation>;
      
      const index = mysteryShopperEvaluations.findIndex(e => 
        e.id === params.id && (customerId === null || e.customerId === customerId)
      );
      
      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }
      
      const updatedEvaluation = {
        ...mysteryShopperEvaluations[index],
        ...body,
        updatedAt: new Date().toISOString()
      };
      
      mysteryShopperEvaluations[index] = updatedEvaluation;
      
      console.log('📤 Updated mystery shopper evaluation:', updatedEvaluation);
      
      return HttpResponse.json(updatedEvaluation);
    } catch (error) {
      console.error('Error in PUT /api/mystery-shopper/evaluations/:id:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // DELETE /api/mystery-shopper/evaluations/:id - Delete evaluation
  http.delete(`${API_URL}/mystery-shopper/evaluations/:id`, async ({ params, request }) => {
    try {
      await simulateDelay();
      const customerId = getCustomerId(request);
      
      console.log('📥 DELETE /api/mystery-shopper/evaluations/:id', params.id);
      
      const index = mysteryShopperEvaluations.findIndex(e => 
        e.id === params.id && (customerId === null || e.customerId === customerId)
      );
      
      if (index === -1) {
        return new HttpResponse(null, { status: 404 });
      }
      
      mysteryShopperEvaluations.splice(index, 1);
      
      console.log('📤 Deleted mystery shopper evaluation:', params.id);
      
      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      console.error('Error in DELETE /api/mystery-shopper/evaluations/:id:', error);
      return new HttpResponse(null, { status: 500 });
    }
  })
] 
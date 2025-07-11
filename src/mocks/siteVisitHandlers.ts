import { http, HttpResponse, delay } from 'msw'
import { allMockVisits } from '@/pages/operations/SiteVisitPage'
import type { SiteVisit, SiteVisitsResponse } from '@/types/siteVisit'

// Helper function to get customer ID from request headers
const getCustomerId = (request: Request): number | null => {
  const customerId = request.headers.get('X-Customer-Id');
  return customerId ? parseInt(customerId, 10) : null;
};

// Extended SiteVisit type for internal use with required customer and site fields
type InternalSiteVisit = SiteVisit & {
  customerId: number;
  siteId: string;
};

// Helper to simulate database operations - enhanced with customer and site data
let visits: InternalSiteVisit[] = allMockVisits.map(visit => ({
  ...visit,
  customerId: visit.customer === 'HOE' ? 22 : visit.customer === 'MCS' ? 23 : 21, // Map to actual customer IDs
  siteId: visit.location === 'SAR' ? 's1' : visit.location === 'SHR' ? 's2' : 's1' // Map to actual site IDs
}));

// Helper function to filter visits based on query parameters
const filterVisits = (visits: InternalSiteVisit[], searchParams: URLSearchParams, customerId?: number | null) => {
  return visits.filter(visit => {
    // Filter by customer ID if provided (null means admin user - show all customers)
    if (customerId !== null && customerId !== undefined && visit.customerId !== customerId) {
      return false;
    }

    const searchTerm = searchParams.get('search')?.toLowerCase() || '';
    const filterCustomerId = searchParams.get('customerId'); // Admin filter by customer
    const siteId = searchParams.get('siteId');

    // Text search across multiple fields
    if (searchTerm && !(
      visit.customerName.toLowerCase().includes(searchTerm) ||
      visit.officerName.toLowerCase().includes(searchTerm) ||
      visit.locationName.toLowerCase().includes(searchTerm) ||
      visit.status.toLowerCase().includes(searchTerm)
    )) {
      return false;
    }

    // Filter by customer ID from query params (admin filter)
    if (filterCustomerId && visit.customerId !== parseInt(filterCustomerId, 10)) {
      return false;
    }

    // Filter by site ID
    if (siteId && visit.siteId !== siteId) {
      return false;
    }

    return true;
  });
};

export const siteVisitHandlers = [
  // GET /api/site-visits - Get paginated site visits
  http.get('/api/site-visits', async ({ request }) => {
    console.log('📥 MSW: GET /api/site-visits called');
    await delay(500); // Simulate network delay
    
    const url = new URL(request.url);
    const customerId = getCustomerId(request);
    
    console.log('🔍 [SiteVisitHandlers] Request details:', { 
      customerId, 
      searchParams: url.searchParams 
    });
    
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    // Filter visits based on customer, site, and search parameters
    const filteredVisits = filterVisits(visits, url.searchParams, customerId);
    
    // Calculate pagination
    const total = filteredVisits.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedVisits = filteredVisits.slice(start, end);
    
    const response: SiteVisitsResponse = {
      data: paginatedVisits,
      total,
      page,
      pageSize,
      totalPages
    };
    
    console.log('📤 [SiteVisitHandlers] Response:', {
      totalVisits: visits.length,
      filteredVisits: filteredVisits.length,
      paginatedVisits: paginatedVisits.length,
      page,
      totalPages
    });
    
    return HttpResponse.json(response);
  }),

  // GET /api/site-visits/:id - Get single site visit
  http.get('/api/site-visits/:id', async ({ params, request }) => {
    console.log('📥 MSW: GET /api/site-visits/:id called with id:', params.id);
    await delay(300);
    
    const customerId = getCustomerId(request);
    
    // Admin users can access visits from any customer, others are filtered by customer ID
    const visit = customerId !== null 
      ? visits.find(v => v.id === params.id && v.customerId === customerId)
      : visits.find(v => v.id === params.id);
    
    if (!visit) {
      console.log('📤 MSW: Visit not found for id:', params.id);
      return new HttpResponse(null, { status: 404 });
    }

    console.log('📤 MSW: Found visit:', visit.id);
    return HttpResponse.json(visit);
  }),

  // POST /api/site-visits - Create site visit
  http.post('/api/site-visits', async ({ request }) => {
    console.log('📥 MSW: POST /api/site-visits called');
    await delay(500);
    
    const customerId = getCustomerId(request);
    const body = await request.json() as Omit<SiteVisit, 'id' | 'createdAt' | 'status'>;
    
    const newVisit: InternalSiteVisit = {
      ...body,
      id: `sv${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
      customerId: customerId || body.customerId || 21,
      siteId: body.siteId || 's1', // Default to site 1 if not provided
      createdAt: new Date().toISOString(),
      status: 'Completed',
      followUpAction: body.followUpAction || '',
      followUpActionDate: body.followUpActionDate || '',
      recommendations: body.recommendations || '',
      updatedAt: new Date().toISOString()
    };
    
    visits = [newVisit, ...visits];
    
    console.log('📤 MSW: Created new visit:', newVisit.id);
    return HttpResponse.json(newVisit);
  }),

  // PUT /api/site-visits/:id - Update site visit
  http.put('/api/site-visits/:id', async ({ params, request }) => {
    console.log('📥 MSW: PUT /api/site-visits/:id called with id:', params.id);
    await delay(500);
    
    const customerId = getCustomerId(request);
    const body = await request.json() as Partial<SiteVisit>;
    
    const index = visits.findIndex(v => 
      v.id === params.id && (customerId === null || v.customerId === customerId)
    );
    
    if (index === -1) {
      console.log('📤 MSW: Visit not found for update, id:', params.id);
      return new HttpResponse(null, { status: 404 });
    }
    
    const updatedVisit: InternalSiteVisit = {
      ...visits[index],
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    visits[index] = updatedVisit;
    
    console.log('📤 MSW: Updated visit:', updatedVisit.id);
    return HttpResponse.json(updatedVisit);
  }),

  // DELETE /api/site-visits/:id - Delete site visit
  http.delete('/api/site-visits/:id', async ({ params, request }) => {
    console.log('📥 MSW: DELETE /api/site-visits/:id called with id:', params.id);
    await delay(300);
    
    const customerId = getCustomerId(request);
    
    const index = visits.findIndex(v => 
      v.id === params.id && (customerId === null || v.customerId === customerId)
    );
    
    if (index === -1) {
      console.log('📤 MSW: Visit not found for deletion, id:', params.id);
      return new HttpResponse(null, { status: 404 });
    }
    
    visits = visits.filter(v => v.id !== params.id);
    
    console.log('📤 MSW: Deleted visit:', params.id);
    return new HttpResponse(null, { status: 204 });
  })
] 
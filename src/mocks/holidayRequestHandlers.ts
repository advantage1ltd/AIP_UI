import { http, HttpResponse } from 'msw';
import { mockOfficers } from '@/data/mockOfficers';
import { mockManagers } from '@/data/mockManagers';
import { mockRequests } from '@/data/mockRequests';
import type { 
  HolidayRequest, 
  CreateHolidayRequestDTO, 
  UpdateHolidayRequestDTO 
} from '@/types/holidayRequest';
import { v4 as uuidv4 } from 'uuid';
import { differenceInBusinessDays } from 'date-fns';

const BASE_URL = '/api/holiday-requests';
let requests = [...mockRequests];

// Utility function to calculate total days
const calculateTotalDays = (startDate: Date, endDate: Date): number => {
  return differenceInBusinessDays(endDate, startDate) + 1;
};

// Utility function to filter and paginate requests
const filterAndPaginateRequests = (
  search: string = '',
  page: number = 1,
  limit: number = 10,
  status?: string,
  archived?: boolean
) => {
  let filtered = [...requests];

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(request => 
      request.officerName.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  if (status) {
    filtered = filtered.filter(request => request.status === status);
  }

  // Apply archived filter
  if (typeof archived === 'boolean') {
    filtered = filtered.filter(request => request.archived === archived);
  }

  // Calculate pagination
  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = filtered.slice(startIndex, endIndex);

  return {
    data,
    total,
    page,
    limit
  };
};

export const holidayRequestHandlers = [
  // GET - List holiday requests with pagination and filters
  http.get(BASE_URL, async ({ request }) => {
    try {
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const status = url.searchParams.get('status') || undefined;
      const archived = url.searchParams.get('archived') ? 
        url.searchParams.get('archived') === 'true' : undefined;

      const result = filterAndPaginateRequests(search, page, limit, status, archived);

      console.log('[MSW] GET /api/holiday-requests', { 
        filters: { search, page, limit, status, archived }, 
        result 
      });

      return HttpResponse.json(result, { status: 200 });
    } catch (error) {
      console.error('[MSW] Error handling GET /api/holiday-requests:', error);
      return HttpResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  }),

  // GET - Single holiday request
  http.get(`${BASE_URL}/:id`, async ({ params }) => {
    try {
      const { id } = params;
      const request = requests.find(r => r.id === id);

      console.log('[MSW] GET /api/holiday-requests/:id', { id, found: !!request });

      if (!request) {
        return HttpResponse.json(
          { message: 'Holiday request not found' },
          { status: 404 }
        );
      }

      return HttpResponse.json(request, { status: 200 });
    } catch (error) {
      console.error('[MSW] Error handling GET /api/holiday-requests/:id:', error);
      return HttpResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  }),

  // POST - Create holiday request
  http.post(BASE_URL, async ({ request }) => {
    try {
      const data = await request.json() as CreateHolidayRequestDTO;
      
      if (!data.officerId || !data.startDate || !data.endDate || !data.returnToWorkDate || !data.authorisedBy) {
        return HttpResponse.json(
          { message: 'Missing required fields' },
          { status: 400 }
        );
      }

      const officer = mockOfficers.find(o => o.id === data.officerId);
      if (!officer) {
        return HttpResponse.json(
          { message: 'Invalid officer ID' },
          { status: 400 }
        );
      }

      const newRequest: HolidayRequest = {
        id: uuidv4(),
        officerId: data.officerId,
        officerName: officer.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        returnToWorkDate: new Date(data.returnToWorkDate),
        dateOfRequest: new Date(),
        authorisedBy: data.authorisedBy,
        dateAuthorised: null,
        status: 'pending',
        comment: data.comment || '',
        totalDays: calculateTotalDays(new Date(data.startDate), new Date(data.endDate)),
        archived: false
      };

      requests.unshift(newRequest);

      console.log('[MSW] POST /api/holiday-requests', { data, created: newRequest });

      return HttpResponse.json(newRequest, { status: 201 });
    } catch (error) {
      console.error('[MSW] Error handling POST /api/holiday-requests:', error);
      return HttpResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  }),

  // PUT - Update holiday request
  http.put(`${BASE_URL}/:id`, async ({ request, params }) => {
    try {
      const { id } = params;
      const data = await request.json() as UpdateHolidayRequestDTO;
      
      const index = requests.findIndex(r => r.id === id);
      if (index === -1) {
        return HttpResponse.json(
          { message: 'Holiday request not found' },
          { status: 404 }
        );
      }

      const updatedRequest = {
        ...requests[index],
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : requests[index].startDate,
        endDate: data.endDate ? new Date(data.endDate) : requests[index].endDate,
        returnToWorkDate: data.returnToWorkDate ? new Date(data.returnToWorkDate) : requests[index].returnToWorkDate,
        dateAuthorised: data.status === 'approved' || data.status === 'denied' ? new Date() : requests[index].dateAuthorised
      };

      if (data.startDate || data.endDate) {
        updatedRequest.totalDays = calculateTotalDays(updatedRequest.startDate, updatedRequest.endDate);
      }

      requests[index] = updatedRequest;

      console.log('[MSW] PUT /api/holiday-requests/:id', { id, data, updated: updatedRequest });

      return HttpResponse.json(updatedRequest, { status: 200 });
    } catch (error) {
      console.error('[MSW] Error handling PUT /api/holiday-requests/:id:', error);
      return HttpResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  }),

  // DELETE - Delete holiday request
  http.delete(`${BASE_URL}/:id`, async ({ params }) => {
    try {
      const { id } = params;
      const index = requests.findIndex(r => r.id === id);

      console.log('[MSW] DELETE /api/holiday-requests/:id', { id, found: index !== -1 });

      if (index === -1) {
        return HttpResponse.json(
          { message: 'Holiday request not found' },
          { status: 404 }
        );
      }

      requests = requests.filter(r => r.id !== id);

      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      console.error('[MSW] Error handling DELETE /api/holiday-requests/:id:', error);
      return HttpResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  }),

  // PUT - Archive holiday request
  http.put(`${BASE_URL}/:id/archive`, async ({ params }) => {
    try {
      const { id } = params;
      const index = requests.findIndex(r => r.id === id);

      console.log('[MSW] PUT /api/holiday-requests/:id/archive', { id, found: index !== -1 });

      if (index === -1) {
        return HttpResponse.json(
          { message: 'Holiday request not found' },
          { status: 404 }
        );
      }

      const updatedRequest = { ...requests[index], archived: true };
      requests[index] = updatedRequest;

      return HttpResponse.json(updatedRequest, { status: 200 });
    } catch (error) {
      console.error('[MSW] Error handling PUT /api/holiday-requests/:id/archive:', error);
      return HttpResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  }),

  // PUT - Unarchive holiday request
  http.put(`${BASE_URL}/:id/unarchive`, async ({ params }) => {
    try {
      const { id } = params;
      const index = requests.findIndex(r => r.id === id);

      console.log('[MSW] PUT /api/holiday-requests/:id/unarchive', { id, found: index !== -1 });

      if (index === -1) {
        return HttpResponse.json(
          { message: 'Holiday request not found' },
          { status: 404 }
        );
      }

      const updatedRequest = { ...requests[index], archived: false };
      requests[index] = updatedRequest;

      return HttpResponse.json(updatedRequest, { status: 200 });
    } catch (error) {
      console.error('[MSW] Error handling PUT /api/holiday-requests/:id/unarchive:', error);
      return HttpResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    }
  })
]; 
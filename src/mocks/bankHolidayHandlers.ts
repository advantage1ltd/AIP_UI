import { http, HttpResponse, delay } from 'msw';
import { BASE_API_URL } from '@/config/api';
import { v4 as uuidv4 } from 'uuid';
import { mockOfficers } from '@/data/mockOfficers';
import { mockManagers } from '@/data/mockManagers';
import type { 
  BankHoliday,
  CreateBankHolidayDTO,
  UpdateBankHolidayDTO,
  BankHolidayResponse
} from '@/types/bankHoliday';

// Initialize with mock data
let bankHolidays: BankHoliday[] = generateMockHolidays();

// Generate mock holiday data
function generateMockHolidays(): BankHoliday[] {
  const holidays: BankHoliday[] = [];
  const today = new Date();

  // Create 30 random holidays for the demo
  for (let i = 0; i < 30; i++) {
    const officerId = mockOfficers[Math.floor(Math.random() * mockOfficers.length)].id;
    const managerId = mockManagers[Math.floor(Math.random() * mockManagers.length)].id;
    const holidayDate = new Date(today.getTime() + Math.floor(Math.random() * 90 - 45) * 24 * 60 * 60 * 1000);
    const requestDate = new Date(holidayDate.getTime() - Math.floor(Math.random() * 30 + 1) * 24 * 60 * 60 * 1000);
    
    // 70% of holidays are authorized, 10% declined, 20% pending
    const random = Math.random();
    let authDate = null;
    let status: BankHoliday['status'] = "pending";
    let reason = undefined;
    
    if (random > 0.3) {
      // Authorized
      authDate = new Date(requestDate.getTime() + Math.floor(Math.random() * 5 + 1) * 24 * 60 * 60 * 1000);
      status = "authorized";
      reason = "Approved - Regular bank holiday request";
    } else if (random > 0.2) {
      // Declined
      authDate = new Date(requestDate.getTime() + Math.floor(Math.random() * 5 + 1) * 24 * 60 * 60 * 1000);
      status = "declined";
      reason = "Declined - Insufficient notice period";
    }
    
    holidays.push({
      id: uuidv4(),
      officerId,
      holidayDate,
      dateOfRequest: requestDate,
      authorisedBy: managerId,
      dateAuthorised: authDate,
      status,
      archived: false,
      reason
    });
  }

  return holidays;
}

// Utility function to filter and paginate holidays
function filterAndPaginateHolidays(
  search: string = '',
  page: number = 1,
  limit: number = 10,
  archived: boolean = false
): BankHolidayResponse {
  let filtered = [...bankHolidays];

  // Filter by archive status
  filtered = filtered.filter(h => h.archived === archived);

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(holiday => {
      const officerName = mockOfficers.find(o => o.id === holiday.officerId)?.name || '';
      return officerName.toLowerCase().includes(searchLower);
    });
  }

  // Calculate pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filtered.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    total,
    page,
    limit,
    totalPages
  };
}

export const bankHolidayHandlers = [
  // GET - List bank holidays with pagination and filters
  http.get('/api/bank-holidays', async ({ request }) => {
    try {
      console.log('GET /api/bank-holidays - Fetching bank holidays');
      
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const archived = url.searchParams.get('archived') === 'true';

      await delay(300);

      const response = filterAndPaginateHolidays(search, page, limit, archived);
      
      console.log('GET /api/bank-holidays - Success', response);
      return HttpResponse.json(response);
    } catch (error) {
      console.error('GET /api/bank-holidays - Error:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // GET - Single bank holiday
  http.get('/api/bank-holidays/:id', async ({ params }) => {
    try {
      console.log(`GET /api/bank-holidays/${params.id} - Fetching bank holiday`);
      
      await delay(300);

      const holiday = bankHolidays.find(h => h.id === params.id);
      
      if (!holiday) {
        console.log(`GET /api/bank-holidays/${params.id} - Not found`);
        return new HttpResponse(null, { status: 404 });
      }

      console.log(`GET /api/bank-holidays/${params.id} - Success:`, holiday);
      return HttpResponse.json(holiday);
    } catch (error) {
      console.error(`GET /api/bank-holidays/${params.id} - Error:`, error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // POST - Create bank holiday
  http.post('/api/bank-holidays', async ({ request }) => {
    try {
      console.log('POST /api/bank-holidays - Creating bank holiday');
      
      const body = await request.json() as CreateBankHolidayDTO;
      await delay(300);

      const newHoliday: BankHoliday = {
        id: uuidv4(),
        ...body,
        dateOfRequest: new Date(),
        authorisedBy: "",
        dateAuthorised: null,
        status: "pending",
        archived: false
      };

      bankHolidays = [newHoliday, ...bankHolidays];
      
      console.log('POST /api/bank-holidays - Success:', newHoliday);
      return HttpResponse.json(newHoliday);
    } catch (error) {
      console.error('POST /api/bank-holidays - Error:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // PUT - Update bank holiday
  http.put('/api/bank-holidays/:id', async ({ params, request }) => {
    try {
      console.log(`PUT /api/bank-holidays/${params.id} - Updating bank holiday`);
      
      const body = await request.json() as UpdateBankHolidayDTO;
      await delay(300);

      const index = bankHolidays.findIndex(h => h.id === params.id);
      
      if (index === -1) {
        console.log(`PUT /api/bank-holidays/${params.id} - Not found`);
        return new HttpResponse(null, { status: 404 });
      }

      const updatedHoliday = {
        ...bankHolidays[index],
        ...body
      };

      bankHolidays[index] = updatedHoliday;
      
      console.log(`PUT /api/bank-holidays/${params.id} - Success:`, updatedHoliday);
      return HttpResponse.json(updatedHoliday);
    } catch (error) {
      console.error(`PUT /api/bank-holidays/${params.id} - Error:`, error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // DELETE - Delete bank holiday
  http.delete('/api/bank-holidays/:id', async ({ params }) => {
    try {
      console.log(`DELETE /api/bank-holidays/${params.id} - Deleting bank holiday`);
      
      await delay(300);

      const index = bankHolidays.findIndex(h => h.id === params.id);
      
      if (index === -1) {
        console.log(`DELETE /api/bank-holidays/${params.id} - Not found`);
        return new HttpResponse(null, { status: 404 });
      }

      bankHolidays = bankHolidays.filter(h => h.id !== params.id);
      
      console.log(`DELETE /api/bank-holidays/${params.id} - Success`);
      return new HttpResponse(null, { status: 200 });
    } catch (error) {
      console.error(`DELETE /api/bank-holidays/${params.id} - Error:`, error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // PUT - Archive bank holiday
  http.put('/api/bank-holidays/:id/archive', async ({ params }) => {
    try {
      console.log(`PUT /api/bank-holidays/${params.id}/archive - Archiving bank holiday`);
      
      await delay(300);

      const index = bankHolidays.findIndex(h => h.id === params.id);
      
      if (index === -1) {
        console.log(`PUT /api/bank-holidays/${params.id}/archive - Not found`);
        return new HttpResponse(null, { status: 404 });
      }

      const updatedHoliday = {
        ...bankHolidays[index],
        archived: true
      };

      bankHolidays[index] = updatedHoliday;
      
      console.log(`PUT /api/bank-holidays/${params.id}/archive - Success:`, updatedHoliday);
      return HttpResponse.json(updatedHoliday);
    } catch (error) {
      console.error(`PUT /api/bank-holidays/${params.id}/archive - Error:`, error);
      return new HttpResponse(null, { status: 500 });
    }
  }),

  // PUT - Unarchive bank holiday
  http.put('/api/bank-holidays/:id/unarchive', async ({ params }) => {
    try {
      console.log(`PUT /api/bank-holidays/${params.id}/unarchive - Unarchiving bank holiday`);
      
      await delay(300);

      const index = bankHolidays.findIndex(h => h.id === params.id);
      
      if (index === -1) {
        console.log(`PUT /api/bank-holidays/${params.id}/unarchive - Not found`);
        return new HttpResponse(null, { status: 404 });
      }

      const updatedHoliday = {
        ...bankHolidays[index],
        archived: false
      };

      bankHolidays[index] = updatedHoliday;
      
      console.log(`PUT /api/bank-holidays/${params.id}/unarchive - Success:`, updatedHoliday);
      return HttpResponse.json(updatedHoliday);
    } catch (error) {
      console.error(`PUT /api/bank-holidays/${params.id}/unarchive - Error:`, error);
      return new HttpResponse(null, { status: 500 });
    }
  })
]; 
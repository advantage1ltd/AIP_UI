import { http, HttpResponse, delay } from 'msw'
import { BASE_API_URL } from '@/config/api'
import { CUSTOMER_PAGES } from '@/config/customerPages'
import type { Customer } from '@/types/customer'
import { customerOperations } from './customerStore'

// Helper function to validate request
const validateRequest = async (request: Request) => {
  try {
    return await request.json()
  } catch (error) {
    throw new Error('Invalid JSON payload')
  }
}

// Helper function to create error response
const createErrorResponse = (status: number, message: string) => {
  return HttpResponse.json(
    { 
      success: false,
      error: message,
      data: null
    },
    { status }
  )
}

// Mock data for Be Safe Be Secure Graph
const beSafeBeSecureData = {
  sites: [
    { site: 'Anson Road', insecureAreas: 70, compliance: 263, systems: 112 },
    { site: 'Cropston Drive', insecureAreas: 49, compliance: 235, systems: 67 },
    { site: 'Ilkstock', insecureAreas: 67, compliance: 155, systems: 86 },
    { site: 'Marston', insecureAreas: 112, compliance: 94, systems: 49 },
    { site: 'Peterborough', insecureAreas: 86, compliance: 56, systems: 70 },
  ],
  types: [
    { type: 'Compliance', value: 17 },
    { type: 'Insecure Areas', value: 22 },
    { type: 'Systems', value: 442 },
  ],
  insecureAreas: [
    { area: 'Kiosk', value: 4 },
    { area: 'High Value Room', value: 1 },
    { area: 'Managers Office', value: 1 },
    { area: 'Warehouse To Sales Floor', value: 13 },
    { area: 'Service Yard', value: 1 },
    { area: 'CarPark And Grounds', value: 1 },
    { area: 'Fire Doors(Back Of House)', value: 1 },
    { area: 'Fire Doors(Shop Floor)', value: 1 },
  ],
  systemsChecks: [
    { area: 'Watch Me Now', value: 62 },
    { area: 'Intruder Alarm', value: 64 },
    { area: 'Keyholding', value: 64 },
    { area: 'CCTV', value: 64 },
    { area: 'Body Worn CCTV', value: 61 },
    { area: 'Crime Reporting', value: 64 },
    { area: 'Cigarette Tracker', value: 63 },
  ],
  complianceChecks: [
    { name: 'Tills over £150', value: 20, color: '#4361ee' },
    { name: 'Cash Office Opened', value: 38, color: '#f72585' },
    { name: 'OverLimit on Cash Levels', value: 1, color: '#ffd166' },
    { name: 'Visible Keys on display', value: 14, color: '#06d6a0' },
    { name: 'Fire Routes Blocked', value: 3, color: '#ef476f' },
    { name: 'ATM Abused', value: 4, color: '#073b4c' },
    { name: 'Be Safe Be Secure Poster', value: 26, color: '#118ab2' },
  ],
  region: "Central England Sites"
};

// Mock data for Customer Satisfaction Reports
const satisfactionReportsData = {
  data: [
    {
      id: '1',
      officerName: 'John Doe',
      date: '2024-03-14',
      customer: 'Anson Road Store',
      region: 'Central England',
      location: 'Anson Road',
      ratings: {
        uniformAndAppearance: 4,
        professionalism: 5,
        customerServiceApproach: 4,
        improvedFeelingOfSecurityWhenOfficerOnSite: 5,
        relationsWithStoreColleagues: 4,
        punctualityBreaks: 4,
        proactivity: 5
      },
      storeManagerName: 'Jane Smith',
      areaManagerName: 'Mike Johnson',
      followUpActions: ['Review security protocols', 'Update training materials'],
      datesToBeCompleted: ['2024-04-01', '2024-04-15']
    },
    {
      id: '2',
      officerName: 'Jane Smith',
      date: '2024-03-13',
      customer: 'Cropston Drive Store',
      region: 'Central England',
      location: 'Cropston Drive',
      ratings: {
        uniformAndAppearance: 5,
        professionalism: 5,
        customerServiceApproach: 4,
        improvedFeelingOfSecurityWhenOfficerOnSite: 5,
        relationsWithStoreColleagues: 5,
        punctualityBreaks: 4,
        proactivity: 4
      },
      storeManagerName: 'Bob Wilson',
      areaManagerName: 'Sarah Parker',
      followUpActions: ['Implement new security measures'],
      datesToBeCompleted: ['2024-04-30']
    }
  ],
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 2
  }
};

// Mock data for Daily Activity Reports
const darData = {
  activities: [
    { id: 1, time: '09:00', activity: 'Site inspection', location: 'Anson Road' },
    { id: 2, time: '10:30', activity: 'Security check', location: 'Cropston Drive' },
    { id: 3, time: '14:00', activity: 'Incident response', location: 'Ilkstock' }
  ]
};

export const customerHandlers = [
  // Customer Satisfaction Reports
  http.get('/api/customers/satisfaction-reports', async ({ request }) => {
    await delay(300)
    
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = satisfactionReportsData.data.slice(startIndex, endIndex)
    
    return HttpResponse.json({
      success: true,
      data: paginatedData,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        total: satisfactionReportsData.data.length,
        totalPages: Math.ceil(satisfactionReportsData.data.length / pageSize)
      }
    })
  }),

  // Be Safe Be Secure Graph
  http.get('/api/customers/be-safe-be-secure-graph', async ({ request }) => {
    await delay(500)
    
    return HttpResponse.json({
      success: true,
      data: beSafeBeSecureData
    })
  }),

  // Customer DAR (Daily Activity Report)
  http.get('/api/customers/dar', async ({ request }) => {
    await delay(300)
    
    return HttpResponse.json({
      success: true,
      data: darData
    })
  }),

  // Get customer reporting data
  http.get('/api/customers/reporting', async ({ request }) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const userRole = url.searchParams.get('role');
      const assignedCustomerIds = url.searchParams.get('assignedCustomerIds');

      console.log('🔍 [Customer Reporting] Processing request:', {
        userId,
        userRole,
        assignedCustomerIds,
        url: request.url
      });

      let customers = await customerOperations.getAll();
      
      // Filter customers based on user role and assignments
      if (userRole !== 'Administrator' && assignedCustomerIds) {
        const assignedIds = assignedCustomerIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        customers = customers.filter(customer => assignedIds.includes(customer.id));
        
        console.log('🔍 [Customer Reporting] Filtered customers for officer:', {
          assignedIds,
          totalCustomers: await customerOperations.getAll().then(all => all.length),
          filteredCustomers: customers.length,
          customerNames: customers.map(c => c.companyName)
        });
      } else if (userRole === 'Administrator') {
        console.log('🔍 [Customer Reporting] Administrator access - returning all customers');
      } else if (userRole !== 'Administrator') {
        // For officers without assignments, return empty array
        customers = [];
        console.log('🔍 [Customer Reporting] Officer with no assignments - returning empty array');
      }
      
      // Add statistics and available pages to each customer
      const customersWithDetails = await Promise.all(customers.map(async (customer) => {
        // Get enabled page assignments
        const enabledPages = customer.pageAssignments ? 
          Object.entries(customer.pageAssignments)
            .filter(([_, assignment]) => (assignment as any).enabled)
            .map(([pageId, _]) => {
              const pageConfig = Object.values(CUSTOMER_PAGES).find(p => p.id === pageId)
              return pageConfig ? {
                id: pageId,
                title: pageConfig.title,
                category: pageConfig.category,
                icon: pageConfig.icon,
                path: pageConfig.path
              } : null
            })
            .filter(Boolean) : [];

        // Calculate statistics
        const statistics = {
          incidents: Math.floor(Math.random() * 50), // Mock data
          reports: Math.floor(Math.random() * 200) + 50,
          lastIncident: new Date().toISOString(),
          activeIssues: Math.floor(Math.random() * 10),
          regions: customer.regions?.length || 0,
          sites: customer.sites?.length || 0
        };

        return {
          ...customer,
          statistics,
          availablePages: enabledPages
        };
      }));

      console.log('✅ [Customer Reporting] Returning customers:', {
        count: customersWithDetails.length,
        customersWithPages: customersWithDetails.map(c => ({
          id: c.id,
          name: c.companyName,
          pagesCount: c.availablePages?.length || 0
        }))
      });

      return HttpResponse.json({
        success: true,
        data: customersWithDetails
      });
    } catch (error) {
      console.error('❌ [Customer Reporting] Error:', error);
      return createErrorResponse(500, 'Failed to fetch customer reporting data');
    }
  }),

  // Get customer details by ID
  http.get('/api/customers/:id', async ({ params }) => {
    try {
      const customer = await customerOperations.getById(parseInt(params.id as string));
      
      if (!customer) {
        return createErrorResponse(404, 'Customer not found');
      }

      // Get enabled page assignments
      const enabledPages = customer.pageAssignments ? 
        Object.entries(customer.pageAssignments)
          .filter(([_, assignment]) => (assignment as any).enabled)
          .map(([pageId, _]) => {
            const pageConfig = Object.values(CUSTOMER_PAGES).find(p => p.id === pageId)
            return pageConfig ? {
              id: pageId,
              title: pageConfig.title,
              category: pageConfig.category,
              icon: pageConfig.icon,
              path: pageConfig.path
            } : null
          })
          .filter(Boolean) : [];

      // Calculate statistics
      const statistics = {
        incidents: Math.floor(Math.random() * 50),
        reports: Math.floor(Math.random() * 200) + 50,
        lastIncident: new Date().toISOString(),
        activeIssues: Math.floor(Math.random() * 10),
        regions: customer.regions?.length || 0,
        sites: customer.sites?.length || 0
      };

      console.log('🔍 [Individual Customer] Loaded:', {
        customerId: customer.id,
        customerName: customer.companyName,
        enabledPagesCount: enabledPages.length,
        pageAssignments: Object.keys(customer.pageAssignments || {})
      });

      return HttpResponse.json({
        success: true,
        data: {
          ...customer,
          availablePages: enabledPages,
          statistics
        }
      });
    } catch (error) {
      console.error('❌ [Individual Customer] Error:', error);
      return createErrorResponse(500, 'Failed to fetch customer details');
    }
  }),

  // Update customer page assignments
  http.patch('/api/customers/:id/page-assignments', async ({ params, request }) => {
    try {
      const customerId = parseInt(params.id as string);
      const updates = await validateRequest(request) as { pageAssignments: Record<string, any> };
      
      const customer = await customerOperations.getById(customerId);
      if (!customer) {
        return createErrorResponse(404, 'Customer not found');
      }

      console.log('🔧 [Page Assignments] Updating customer:', {
        customerId,
        customerName: customer.companyName,
        currentPageAssignments: Object.keys(customer.pageAssignments || {}),
        newPageAssignments: Object.keys(updates.pageAssignments)
      });

      // Update the customer's page assignments
      const updatedCustomer = await customerOperations.update(customerId, {
        pageAssignments: {
          ...customer.pageAssignments,
          ...updates.pageAssignments
        },
        viewConfig: {
          ...customer.viewConfig,
          enabledPages: Object.entries(updates.pageAssignments)
            .filter(([_, assignment]) => (assignment as any).enabled)
            .map(([pageId]) => pageId),
          updatedAt: new Date().toISOString()
        }
      });

      if (!updatedCustomer) {
        return createErrorResponse(500, 'Failed to update customer');
      }

      console.log('✅ [Page Assignments] Updated customer configuration:', {
        customerId,
        enabledPages: updatedCustomer.viewConfig?.enabledPages,
        pageAssignments: Object.entries(updatedCustomer.pageAssignments || {})
          .filter(([_, assignment]) => (assignment as any).enabled)
          .map(([pageId]) => pageId)
      });

      return HttpResponse.json({
        success: true,
        data: updatedCustomer,
        message: `Page assignments updated for ${customer.companyName}`
      });
    } catch (error) {
      console.error('❌ [Page Assignments] Error:', error);
      return createErrorResponse(500, 'Failed to update page assignments');
    }
  }),

  // Get all customers for admin/setup purposes
  http.get('/api/customers', async () => {
    try {
      const customers = await customerOperations.getAll();
      
      console.log('🔍 [All Customers] Loading:', {
        totalCustomers: customers.length,
        customers: customers.map(c => ({ id: c.id, name: c.companyName }))
      });
      
      return HttpResponse.json({
        success: true,
        data: customers.map(customer => ({
          ...customer,
          statistics: {
            incidents: Math.floor(Math.random() * 50),
            reports: Math.floor(Math.random() * 200) + 50,
            regions: customer.regions?.length || 0,
            sites: customer.sites?.length || 0
          }
        }))
      });
    } catch (error) {
      console.error('❌ [All Customers] Error:', error);
      return createErrorResponse(500, 'Failed to fetch customers');
    }
  }),

  // Get customer regions
  http.get(`${BASE_API_URL}/customers/:id/regions`, async ({ params }) => {
    try {
      const customer = await customerOperations.getById(parseInt(params.id as string));
      if (!customer) {
        return createErrorResponse(404, 'Customer not found');
      }
      
      return HttpResponse.json({
        success: true,
        data: customer.regions || []
      });
    } catch (error) {
      console.error('❌ [Customer Regions] Error:', error);
      return createErrorResponse(500, 'Failed to fetch customer regions');
    }
  })
];
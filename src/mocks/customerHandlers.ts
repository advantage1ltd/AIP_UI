import { http, HttpResponse, delay } from 'msw'
import { BASE_API_URL } from '@/config/api'
import { CUSTOMER_PAGES } from '@/config/customerPages'
import type { Customer } from '@/types/customer'
import { customerOperations } from './customerStore'
import db from '../../db.json'

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

// Helper function to determine if a customer is "new" (created recently with minimal data)
const isNewCustomer = (customer: any): boolean => {
  console.log('🔍 [isNewCustomer] Checking customer:', {
    name: customer.companyName,
    id: customer.id,
    createdAt: customer.createdAt,
    pageAssignments: customer.pageAssignments,
    regions: customer.regions?.length || 0,
    sites: customer.sites?.length || 0
  });

  // Check if customer was created within the last 7 days (extended from 24 hours for testing)
  const createdAt = new Date(customer.createdAt);
  const now = new Date();
  const hoursAge = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  const daysAge = hoursAge / 24;
  
  // Consider a customer "new" if:
  // 1. Created within last 7 days, AND
  // 2. Has no page assignments OR only empty page assignments, AND  
  // 3. Has no regions or sites
  const hasNoPageAssignments = !customer.pageAssignments || Object.keys(customer.pageAssignments).length === 0;
  const hasNoRegions = !customer.regions || customer.regions.length === 0;
  const hasNoSites = !customer.sites || customer.sites.length === 0;
  
  const isNew = daysAge < 7 && hasNoPageAssignments && hasNoRegions && hasNoSites;
  
  console.log('🔍 [isNewCustomer] Result:', {
    name: customer.companyName,
    id: customer.id,
    daysAge: daysAge.toFixed(2),
    hasNoPageAssignments,
    hasNoRegions,
    hasNoSites,
    isNew,
    pageAssignmentsKeys: customer.pageAssignments ? Object.keys(customer.pageAssignments) : [],
    regionsCount: customer.regions?.length || 0,
    sitesCount: customer.sites?.length || 0
  });
  
  return isNew;
};

// Helper function to calculate real statistics for a customer from actual data
const calculateCustomerStatistics = (customer: any) => {
  console.log('🔍 [calculateCustomerStatistics] Calculating for:', customer.companyName, customer.id);
  
  try {
    // Get real incidents for this customer from db.json
    const customerIncidents = db.dashboard?.incidents?.filter(incident => 
      incident.customerId === customer.id
    ) || [];
    
    // Get real daily activity reports for this customer  
    const customerReports = db.dailyActivityReports?.filter(report =>
      report.customerId === customer.id
    ) || [];
    
    // Calculate real statistics
    const incidents = customerIncidents.length;
    const reports = customerReports.length;
    const regions = customer.regions?.length || 0;
    const sites = customer.sites?.length || 0;
    
    // Get last incident date
    const lastIncident = customerIncidents.length > 0 
      ? customerIncidents
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
          .date
      : null;
    
    // Count active issues (incidents from last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeIssues = customerIncidents.filter(incident => {
      const incidentDate = new Date(incident.date);
      return incidentDate >= thirtyDaysAgo;
    }).length;
    
    const statistics = {
      incidents,
      reports,
      lastIncident,
      activeIssues,
      regions,
      sites
    };
    
    console.log('🔍 [calculateCustomerStatistics] Real statistics calculated:', {
      customer: customer.companyName,
      customerId: customer.id,
      incidents: statistics.incidents,
      reports: statistics.reports,
      regions: statistics.regions,
      sites: statistics.sites,
      lastIncident: statistics.lastIncident,
      activeIssues: statistics.activeIssues,
      customerIncidentsFound: customerIncidents.length,
      customerReportsFound: customerReports.length
    });
    
    return statistics;
    
  } catch (error) {
    console.error('❌ [calculateCustomerStatistics] Error calculating real statistics:', error);
    
    // Fallback to zero statistics if there's an error
    return {
      incidents: 0,
      reports: 0,
      lastIncident: null,
      activeIssues: 0,
      regions: customer.regions?.length || 0,
      sites: customer.sites?.length || 0
    };
  }
};

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
    const customerId = url.searchParams.get('customerId')
    
    let responseData = satisfactionReportsData.data
    
    // Filter by customer if customerId is provided
    if (customerId) {
      try {
        const customer = await customerOperations.getById(parseInt(customerId))
        
        if (!customer) {
          return createErrorResponse(404, 'Customer not found')
        }
        
        // If it's a new customer, return empty data
        if (isNewCustomer(customer)) {
          return HttpResponse.json({
            success: true,
            data: [],
            pagination: {
              currentPage: page,
              pageSize: pageSize,
              total: 0,
              totalPages: 0
            }
          })
        }
        
        // For existing customers, filter mock data by customer name (simplified)
        responseData = satisfactionReportsData.data.filter(report => 
          report.customer.toLowerCase().includes(customer.companyName.toLowerCase()) ||
          report.location.toLowerCase().includes(customer.companyName.toLowerCase())
        )
      } catch (error) {
        console.error('Error filtering satisfaction reports:', error)
      }
    }
    
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedData = responseData.slice(startIndex, endIndex)
    
    return HttpResponse.json({
      success: true,
      data: paginatedData,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        total: responseData.length,
        totalPages: Math.ceil(responseData.length / pageSize)
      }
    })
  }),

  // Be Safe Be Secure Graph
  http.get('/api/customers/be-safe-be-secure-graph', async ({ request }) => {
    await delay(500)
    
    const url = new URL(request.url)
    const customerId = url.searchParams.get('customerId')
    
    if (customerId) {
      // Get customer data to check if it's a new customer
      try {
        const customer = await customerOperations.getById(parseInt(customerId))
        
        if (!customer) {
          return createErrorResponse(404, 'Customer not found')
        }
        
        // If it's a new customer, return empty data
        if (isNewCustomer(customer)) {
          return HttpResponse.json({
            success: true,
            data: {
              sites: [],
              types: [],
              insecureAreas: [],
              systemsChecks: [],
              complianceChecks: [],
              region: customer.companyName
            }
          })
        }
      } catch (error) {
        console.error('Error checking customer:', error)
      }
    }
    
    // Return mock data for existing customers or when no customer ID is specified
    return HttpResponse.json({
      success: true,
      data: beSafeBeSecureData
    })
  }),

  // Customer DAR (Daily Activity Report)
  http.get('/api/customers/dar', async ({ request }) => {
    await delay(300)
    
    const url = new URL(request.url)
    const customerId = url.searchParams.get('customerId')
    
    if (customerId) {
      try {
        const customer = await customerOperations.getById(parseInt(customerId))
        
        if (!customer) {
          return createErrorResponse(404, 'Customer not found')
        }
        
        // If it's a new customer, return empty data
        if (isNewCustomer(customer)) {
          return HttpResponse.json({
            success: true,
            data: {
              activities: []
            }
          })
        }
      } catch (error) {
        console.error('Error checking customer:', error)
      }
    }
    
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

        // Calculate statistics based on whether it's a new customer
        const statistics = calculateCustomerStatistics(customer);

        console.log('🔍 [Customer Reporting] Customer processed:', {
          name: customer.companyName,
          id: customer.id,
          incidents: statistics.incidents,
          reports: statistics.reports,
          availablePages: enabledPages.length,
          isDetectedAsNew: isNewCustomer(customer),
          enabledPageIds: enabledPages.map(p => p.id)
        });

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

      // Calculate statistics based on whether it's a new customer
      const statistics = calculateCustomerStatistics(customer);

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
          statistics: calculateCustomerStatistics(customer)
        }))
      });
    } catch (error) {
      console.error('❌ [All Customers] Error:', error);
      return createErrorResponse(500, 'Failed to fetch customers');
    }
  }),

  // Create new customer
  http.post('/api/customers', async ({ request }) => {
    try {
      await delay(300);
      const customerData = await validateRequest(request) as Customer;
      
      // Generate ID if not provided or if it's a temporary string ID
      let customerId: number;
      const idString = String(customerData.id || '');
      const isTemporaryId = idString.startsWith('CUST');
      if (!customerData.id || isTemporaryId) {
        // Generate a proper numeric ID
        const customers = await customerOperations.getAll();
        const existingIds = customers.map(c => c.id).filter(id => !isNaN(Number(id)));
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 20;
        customerId = maxId + 1;
      } else {
        customerId = Number(customerData.id);
      }

      // Set timestamps
      const now = new Date().toISOString();
      
      // Create CustomerWithRelations object with required relations and proper defaults
      const customerWithRelations = {
        ...customerData,
        id: customerId,
        regions: [],
        sites: [],
        pageAssignments: {}, // Initialize with empty page assignments
        viewConfig: {
          id: `view_config_${customerId}`,
          customerId: customerId,
          customerType: customerData.customerType,
          enabledPages: [],
          createdAt: now,
          updatedAt: now
        },
        createdAt: customerData.createdAt || now,
        updatedAt: now
      };

      console.log('🆕 [Create Customer] Creating:', {
        id: customerId,
        name: customerData.companyName,
        type: customerData.customerType
      });

      const result = await customerOperations.create(customerWithRelations);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('customer-created', {
        detail: { customer: result }
      }));

      return HttpResponse.json({
        success: true,
        data: result,
        message: `Customer "${customerData.companyName}" created successfully`
      }, { status: 201 });
    } catch (error) {
      console.error('❌ [Create Customer] Error:', error);
      return createErrorResponse(500, 'Failed to create customer');
    }
  }),

  // Update existing customer
  http.put('/api/customers/:id', async ({ params, request }) => {
    try {
      await delay(300);
      const customerId = parseInt(params.id as string);
      const updates = await validateRequest(request) as Partial<Customer>;
      
      const existingCustomer = await customerOperations.getById(customerId);
      if (!existingCustomer) {
        return createErrorResponse(404, 'Customer not found');
      }

      // Set updated timestamp
      updates.updatedAt = new Date().toISOString();

      console.log('✏️ [Update Customer] Updating:', {
        id: customerId,
        name: existingCustomer.companyName,
        changes: Object.keys(updates)
      });

      const result = await customerOperations.update(customerId, updates);
      
      if (!result) {
        return createErrorResponse(500, 'Failed to update customer');
      }

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('customer-updated', {
        detail: { customer: result }
      }));

      return HttpResponse.json({
        success: true,
        data: result,
        message: `Customer "${result.companyName}" updated successfully`
      });
    } catch (error) {
      console.error('❌ [Update Customer] Error:', error);
      return createErrorResponse(500, 'Failed to update customer');
    }
  }),

  // Delete customer
  http.delete('/api/customers/:id', async ({ params }) => {
    try {
      await delay(300);
      const customerId = parseInt(params.id as string);
      
      const existingCustomer = await customerOperations.getById(customerId);
      if (!existingCustomer) {
        return createErrorResponse(404, 'Customer not found');
      }

      console.log('🗑️ [Delete Customer] Deleting:', {
        id: customerId,
        name: existingCustomer.companyName
      });

      await customerOperations.delete(customerId);

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('customer-deleted', {
        detail: { customerId, customerName: existingCustomer.companyName }
      }));

      return HttpResponse.json({
        success: true,
        message: `Customer "${existingCustomer.companyName}" deleted successfully`
      });
    } catch (error) {
      console.error('❌ [Delete Customer] Error:', error);
      return createErrorResponse(500, 'Failed to delete customer');
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
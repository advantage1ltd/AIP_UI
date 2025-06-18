import { http, HttpResponse, delay } from 'msw'
import { BASE_API_URL } from '@/config/api'
import { mockRegions, mockSites } from '@/data/mockCustomers'
import { CUSTOMER_PAGES } from '@/config/customerPages'
import type { Customer, CustomerWithRelations, Region, Site } from '@/types/customer'

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

// Mock customer data with proper page assignments
const localMockCustomers = [
  {
    id: 'COOP001',
    companyName: 'Central England COOP',
    companyNumber: 'IP00141R',
    vatNumber: 'GB123456789',
    status: 'active' as const,
    customerType: 'retail' as const,
    regions: 3,
    sites: 12,
    lastActivity: '2024-03-21T14:30:00.000Z',
    assignedOfficers: ['2'], // Officer with ID 2 is assigned
    pageAssignments: {
      'daily-activity': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'incident-report': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'customer-satisfaction': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'be-safe-be-secure': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'site-visit-reports': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'officer-support': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'incident-graph': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' }
    }
  },
  {
    id: 'COOP002',
    companyName: 'Midcounties COOP',
    companyNumber: 'IP00141S',
    vatNumber: 'GB987654321',
    status: 'active' as const,
    customerType: 'retail' as const,
    regions: 3,
    sites: 8,
    lastActivity: '2024-03-20T16:45:00.000Z',
    assignedOfficers: ['2'], // Officer with ID 2 is assigned
    pageAssignments: {
      'daily-activity': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'incident-report': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'customer-satisfaction': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'be-safe-be-secure': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'site-visit-reports': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'officer-support': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'incident-graph': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' }
    }
  },
  {
    id: 'COOP003',
    companyName: 'Heart of England COOP',
    companyNumber: 'IP00141T',
    vatNumber: 'GB456789123',
    status: 'active' as const,
    customerType: 'retail' as const,
    regions: 3,
    sites: 6,
    lastActivity: '2024-03-22T09:15:00.000Z',
    assignedOfficers: [], // No officers assigned
    pageAssignments: {
      'daily-activity': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'incident-report': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'customer-satisfaction': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'be-safe-be-secure': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'site-visit-reports': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'officer-support': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' },
      'incident-graph': { enabled: true, customized: false, lastModified: '2024-03-21T18:30:00.000Z', modifiedBy: 'system' }
    }
  }
]

// In-memory data store
let customers: any[] = [...localMockCustomers]
let regions = [...mockRegions]
let sites = [...mockSites]

// Save to db.json
const saveToDb = async () => {
  const dbResponse = await fetch('/db.json')
  const db = await dbResponse.json()
  
  db.customers = customers
  db.regions = regions
  db.sites = sites

  await fetch('/db.json', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(db),
  })
}

// Load from db.json
const loadFromDb = async () => {
  try {
    const dbResponse = await fetch('/db.json')
    const db = await dbResponse.json()
    
    if (db.customers) customers = db.customers
    if (db.regions) regions = db.regions
    if (db.sites) sites = db.sites
  } catch (error) {
    console.error('Error loading from db.json:', error)
  }
}

// Initialize data from db.json
loadFromDb()

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

  // Customer reporting endpoint with role-based access
  http.get('/api/customers/reporting', ({ request }) => {
    const url = new URL(request.url)
    const role = url.searchParams.get('role')
    const userId = url.searchParams.get('userId')
    const assignedCustomerIds = url.searchParams.get('assignedCustomerIds')

    let filteredCustomers = localMockCustomers

    // Role-based filtering
    if (role === 'AdvantageOneOfficer' && assignedCustomerIds) {
      const assignedIds = assignedCustomerIds.split(',')
      filteredCustomers = localMockCustomers.filter(customer => 
        assignedIds.includes(customer.id)
      )
    }
    // Admin and HO Officers see all customers (no filtering needed)

    // Add statistics and available pages to each customer
    const customersWithDetails = filteredCustomers.map(customer => {
      // Get enabled page assignments
      const enabledPages = Object.entries(customer.pageAssignments)
        .filter(([_, assignment]) => assignment.enabled)
        .map(([pageId]) => {
          const pageConfig = Object.values(CUSTOMER_PAGES).find(p => p.id === pageId)
          return pageConfig ? {
            id: pageId,
            title: pageConfig.title,
            category: pageConfig.category,
            icon: pageConfig.icon,
            path: pageConfig.path
          } : null
        })
        .filter(Boolean)

      return {
        ...customer,
        statistics: {
          incidents: Math.floor(Math.random() * 50) + 10,
          reports: Math.floor(Math.random() * 200) + 50,
          lastIncident: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          activeIssues: Math.floor(Math.random() * 5)
        },
        availablePages: enabledPages
      }
    })

    return HttpResponse.json({
      success: true,
      data: customersWithDetails
    })
  }),

  // Get customer details by ID
  http.get('/api/customers/:id', ({ params }) => {
    const customer = localMockCustomers.find(c => c.id === params.id)
    
    if (!customer) {
      return HttpResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 })
    }

    // Get enabled page assignments
    const enabledPages = Object.entries(customer.pageAssignments)
      .filter(([_, assignment]) => assignment.enabled)
      .map(([pageId]) => {
        const pageConfig = Object.values(CUSTOMER_PAGES).find(p => p.id === pageId)
        return pageConfig ? {
          id: pageId,
          title: pageConfig.title,
          category: pageConfig.category,
          icon: pageConfig.icon,
          path: pageConfig.path
        } : null
      })
      .filter(Boolean)

    return HttpResponse.json({
      success: true,
      data: {
        ...customer,
        availablePages: enabledPages,
        statistics: {
          incidents: Math.floor(Math.random() * 50) + 10,
          reports: Math.floor(Math.random() * 200) + 50,
          lastIncident: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          activeIssues: Math.floor(Math.random() * 5)
        }
      }
    })
  }),

  // Update customer page assignments
  http.patch('/api/customers/:id/page-assignments', async ({ params, request }) => {
    const customerId = params.id as string
    const updates = await request.json() as { pageAssignments: Record<string, any> }
    
    const customerIndex = localMockCustomers.findIndex(c => c.id === customerId)
    if (customerIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 })
    }

    // Update the customer's page assignments
    (localMockCustomers[customerIndex] as any).pageAssignments = {
      ...(localMockCustomers[customerIndex] as any).pageAssignments,
      ...updates.pageAssignments
    }

    return HttpResponse.json({
      success: true,
      data: localMockCustomers[customerIndex]
    })
  }),

  // Get all customers for admin/setup purposes
  http.get('/api/customers', () => {
    return HttpResponse.json({
      success: true,
      data: localMockCustomers.map(customer => ({
        ...customer,
        statistics: {
          incidents: Math.floor(Math.random() * 50) + 10,
          reports: Math.floor(Math.random() * 200) + 50,
          regions: customer.regions,
          sites: customer.sites
        }
      }))
    })
  }),

  // GET /api/customers - Get all customers
  http.get(`${BASE_API_URL}/customers`, async ({ request }) => {
    await delay(200)
    
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    let filteredCustomers = customers
    
    if (userId) {
      // In a real scenario, filter based on user assignments
      // For now, return all customers
      filteredCustomers = customers
    }

    // Add relations to customers
    const customersWithRelations = filteredCustomers.map(customer => {
      const customerSites = sites.filter(s => s.customerId === customer.id)
      const customerRegions = regions.filter(r => r.customerId === customer.id)
      
      return {
        ...customer,
        regions: customerRegions,
        sites: customerSites
      }
    })

    return HttpResponse.json({
      success: true,
      data: customersWithRelations
    })
  }),

  // GET /api/customers/:id - Get customer by ID with relations
  http.get(`${BASE_API_URL}/customers/:id`, async ({ params }) => {
    await delay(200)
    
    const customer = customers.find(c => c.id === params.id)
    if (!customer) {
      return createErrorResponse(404, 'Customer not found')
    }

    const customerRegions = regions.filter(r => r.customerId === customer.id)
    const customerSites = sites.filter(s => s.customerId === customer.id)

    const customerWithRelations: CustomerWithRelations = {
      ...customer,
      regions: customerRegions,
      sites: customerSites
    }

    return HttpResponse.json({
      success: true,
      data: customerWithRelations
    })
  }),

  // POST /api/customers - Create new customer
  http.post(`${BASE_API_URL}/customers`, async ({ request }) => {
    try {
      const newCustomer = await validateRequest(request) as Customer
      customers.push(newCustomer as any)
      await saveToDb()
      
      return HttpResponse.json({
        success: true,
        data: newCustomer,
        message: 'Customer created successfully'
      }, { status: 201 })
    } catch (error) {
      return createErrorResponse(400, error instanceof Error ? error.message : 'Failed to create customer')
    }
  }),

  // PUT /api/customers/:id - Update customer
  http.put(`${BASE_API_URL}/customers/:id`, async ({ params, request }) => {
    try {
      const updatedCustomer = await validateRequest(request) as Customer
      const index = customers.findIndex(c => c.id === params.id)
      
      if (index === -1) {
        return createErrorResponse(404, 'Customer not found')
      }

      customers[index] = updatedCustomer as any
      await saveToDb()

      return HttpResponse.json({
        success: true,
        data: updatedCustomer,
        message: 'Customer updated successfully'
      })
    } catch (error) {
      return createErrorResponse(400, error instanceof Error ? error.message : 'Failed to update customer')
    }
  }),

  // DELETE /api/customers/:id - Delete customer
  http.delete(`${BASE_API_URL}/customers/:id`, async ({ params }) => {
    const index = customers.findIndex(c => c.id === params.id)
    if (index === -1) {
      return createErrorResponse(404, 'Customer not found')
    }

    const deletedCustomer = customers[index]
    customers.splice(index, 1)
    
    // Also delete related regions and sites
    regions = regions.filter(r => r.customerId !== params.id)
    sites = sites.filter(s => s.customerId !== params.id)
    
    await saveToDb()

    return HttpResponse.json({
      success: true,
      data: deletedCustomer,
      message: 'Customer and related data deleted successfully'
    })
  }),

  // GET /api/customers/:id/regions - Get customer regions
  http.get(`${BASE_API_URL}/customers/:id/regions`, async ({ params }) => {
    await delay(200)
    
    const customerRegions = regions.filter(r => r.customerId === params.id)
    
    return HttpResponse.json({
      success: true,
      data: customerRegions
    })
  })
]
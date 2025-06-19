import { http, HttpResponse, delay } from 'msw'
import { BASE_API_URL } from '@/config/api'
import { mockRegions, mockSites } from '@/data/mockCustomers'
import { CUSTOMER_PAGES } from '@/config/customerPages'
import { DUMMY_CUSTOMERS } from '@/data/customers'
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

// In-memory data store for regions and sites (using DUMMY_CUSTOMERS for customer data)
let regions = [...mockRegions]
let sites = [...mockSites]

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

    let filteredCustomers = DUMMY_CUSTOMERS

    // Role-based filtering
    if (role === 'AdvantageOneOfficer' && assignedCustomerIds) {
      const assignedIds = assignedCustomerIds.split(',')
      filteredCustomers = DUMMY_CUSTOMERS.filter(customer => 
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
    const customer = DUMMY_CUSTOMERS.find(c => c.id === params.id)
    
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
    
    const customerIndex = DUMMY_CUSTOMERS.findIndex(c => c.id === customerId)
    if (customerIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 })
    }

    // Update the customer's page assignments
    (DUMMY_CUSTOMERS[customerIndex] as any).pageAssignments = {
      ...(DUMMY_CUSTOMERS[customerIndex] as any).pageAssignments,
      ...updates.pageAssignments
    }

    return HttpResponse.json({
      success: true,
      data: DUMMY_CUSTOMERS[customerIndex]
    })
  }),

  // Get all customers for admin/setup purposes
  http.get('/api/customers', () => {
    return HttpResponse.json({
      success: true,
      data: DUMMY_CUSTOMERS.map(customer => ({
        ...customer,
        statistics: {
          incidents: Math.floor(Math.random() * 50) + 10,
          reports: Math.floor(Math.random() * 200) + 50,
          regions: 3, // Default since DUMMY_CUSTOMERS doesn't have this field
          sites: 6   // Default since DUMMY_CUSTOMERS doesn't have this field
        }
      }))
    })
  }),

  // Note: Legacy CRUD endpoints removed - now using DUMMY_CUSTOMERS directly

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
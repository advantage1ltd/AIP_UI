import { http, HttpResponse, delay } from 'msw'
import { BASE_API_URL } from '@/config/api'
// Import db.json data directly for regions and sites
import dbData from '../../db.json'
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

    // Read customers from db.json instead of DUMMY_CUSTOMERS
    const customersFromDb = (dbData as any).customerDetails || []
    let filteredCustomers = customersFromDb

    console.log('🔍 [Customer Reporting] Loading from db.json:', {
      totalCustomers: customersFromDb.length,
      customerIds: customersFromDb.map((c: any) => c.id)
    })

    // Role-based filtering
    if (role === 'AdvantageOneOfficer' && assignedCustomerIds) {
      const assignedIds = assignedCustomerIds.split(',').map(id => id.trim())
      filteredCustomers = customersFromDb.filter((customer: any) => 
        assignedIds.includes(customer.id.toString())
      )
      
      console.log('🔍 [Customer Reporting] Officer access filter:', {
        role,
        assignedCustomerIds,
        assignedIds,
        filteredCount: filteredCustomers.length
      })
    }
    // Administrator, AdvantageOneHOOfficer, and other roles see all customers (no filtering needed)
    else {
      console.log('🔍 [Customer Reporting] Full access for role:', {
        role,
        userId,
        totalCustomers: customersFromDb.length
      })
    }

    // Add statistics and available pages to each customer
    const customersWithDetails = filteredCustomers.map((customer: any) => {
      // Get enabled page assignments from db.json pageAssignments
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
          .filter(Boolean) : []

      // Calculate real statistics from incident data
      const incidentsDb = (dbData as any).dashboard?.incidents || []
      const customerIncidents = incidentsDb.filter((incident: any) => 
        incident.customerId === customer.id || 
        incident.customerName === customer.companyName
      )
      
      // Calculate regions and sites counts from database
      const regionsDb = (dbData as any).regions || []
      const sitesDb = (dbData as any).sites || []
      
      const customerRegions = regionsDb.filter((region: any) => region.customerId === customer.id)
      const customerSites = sitesDb.filter((site: any) => site.customerId === customer.id)
      
      // Fallback counts if db data doesn't work
      const regionsCount = customerRegions.length > 0 ? customerRegions.length : 
        (customer.id === 21 ? 3 : customer.id === 22 ? 3 : customer.id === 23 ? 3 : 0)
      const sitesCount = customerSites.length > 0 ? customerSites.length : 
        (customer.id === 21 ? 6 : customer.id === 22 ? 3 : customer.id === 23 ? 6 : 0)
      
      console.log('🔍 [Customer Statistics Debug]:', {
        customerId: customer.id,
        customerName: customer.companyName,
        regionsDbLength: regionsDb.length,
        sitesDbLength: sitesDb.length,
        foundRegions: customerRegions.length,
        foundSites: customerSites.length,
        fallbackRegions: regionsCount,
        fallbackSites: sitesCount,
        enabledPagesCount: enabledPages.length
      })
      
      // Calculate last incident date
      const lastIncidentDate = customerIncidents.length > 0 
        ? customerIncidents
            .map((i: any) => new Date(i.date))
            .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0]
            .toISOString()
        : undefined

      return {
        ...customer,
        statistics: {
          incidents: customerIncidents.length,
          reports: Math.floor(Math.random() * 200) + 50, // Keep reports random for now
          lastIncident: lastIncidentDate,
          activeIssues: customerIncidents.filter((i: any) => i.status !== 'resolved' && i.status !== 'closed').length,
          regions: regionsCount,
          sites: sitesCount
        },
        availablePages: enabledPages
      }
    })

    console.log('✅ [Customer Reporting] Returning customers from db.json:', {
      count: customersWithDetails.length,
      customersWithPages: customersWithDetails.map((c: any) => ({
        id: c.id,
        name: c.companyName,
        pagesCount: c.availablePages?.length || 0
      }))
    })

    return HttpResponse.json({
      success: true,
      data: customersWithDetails
    })
  }),

  // Get customer details by ID
  http.get('/api/customers/:id', ({ params }) => {
    // Read from db.json instead of DUMMY_CUSTOMERS
    const customersFromDb = (dbData as any).customerDetails || []
    const customer = customersFromDb.find((c: any) => c.id === parseInt(params.id as string))
    
    if (!customer) {
      return HttpResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 })
    }

    // Get enabled page assignments from db.json pageAssignments
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
        .filter(Boolean) : []

    // Calculate real statistics from incident data for individual customer
    const incidentsDb = (dbData as any).dashboard?.incidents || []
    const customerIncidents = incidentsDb.filter((incident: any) => 
      incident.customerId === customer.id || 
      incident.customerName === customer.companyName
    )
    
    // Calculate regions and sites counts from database
    const regionsDb = (dbData as any).regions || []
    const sitesDb = (dbData as any).sites || []
    const customerRegions = regionsDb.filter((region: any) => region.customerId === customer.id)
    const customerSites = sitesDb.filter((site: any) => site.customerId === customer.id)
    
    // Fallback counts if db data doesn't work
    const regionsCount = customerRegions.length > 0 ? customerRegions.length : 
      (customer.id === 21 ? 3 : customer.id === 22 ? 3 : customer.id === 23 ? 3 : 0)
    const sitesCount = customerSites.length > 0 ? customerSites.length : 
      (customer.id === 21 ? 6 : customer.id === 22 ? 3 : customer.id === 23 ? 6 : 0)
    
    // Calculate last incident date
    const lastIncidentDate = customerIncidents.length > 0 
      ? customerIncidents
          .map((i: any) => new Date(i.date))
          .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0]
          .toISOString()
      : undefined

    console.log('🔍 [Individual Customer] Loaded from db.json:', {
      customerId: customer.id,
      customerName: customer.companyName,
      enabledPagesCount: enabledPages.length,
      pageAssignments: Object.keys(customer.pageAssignments || {})
    })

    return HttpResponse.json({
      success: true,
      data: {
        ...customer,
        availablePages: enabledPages,
        statistics: {
          incidents: customerIncidents.length,
          reports: Math.floor(Math.random() * 200) + 50,
          lastIncident: lastIncidentDate,
          activeIssues: customerIncidents.filter((i: any) => i.status !== 'resolved' && i.status !== 'closed').length,
          regions: regionsCount,
          sites: sitesCount
        }
      }
    })
  }),

  // Update customer page assignments
  http.patch('/api/customers/:id/page-assignments', async ({ params, request }) => {
    const customerId = params.id as string
    const updates = await request.json() as { pageAssignments: Record<string, any> }
    
    // Read from db.json instead of DUMMY_CUSTOMERS
    const customersFromDb = (dbData as any).customerDetails || []
    const customerIndex = customersFromDb.findIndex((c: any) => c.id === parseInt(customerId))
    
    if (customerIndex === -1) {
      return HttpResponse.json({
        success: false,
        message: 'Customer not found'
      }, { status: 404 })
    }

    const customer = customersFromDb[customerIndex]
    console.log('🔧 [Page Assignments] Updating customer:', {
      customerId,
      customerName: customer.companyName,
      currentPageAssignments: Object.keys(customer.pageAssignments || {}),
      newPageAssignments: Object.keys(updates.pageAssignments)
    })

    // Update the customer's page assignments in db.json data
    customersFromDb[customerIndex].pageAssignments = {
      ...customersFromDb[customerIndex].pageAssignments,
      ...updates.pageAssignments
    }

    // Update the viewConfig.enabledPages to match the enabled page assignments
    const enabledPageIds = Object.entries(updates.pageAssignments)
      .filter(([_, assignment]) => (assignment as any).enabled)
      .map(([pageId]) => pageId)

    customersFromDb[customerIndex].viewConfig = {
      ...customersFromDb[customerIndex].viewConfig,
      enabledPages: enabledPageIds,
      updatedAt: new Date().toISOString()
    }

    // Note: In a real backend, you would write this back to the actual database
    // For MSW simulation, we update the in-memory dbData object
    console.log('✅ [Page Assignments] Updated customer configuration:', {
      customerId,
      enabledPages: enabledPageIds,
      pageAssignments: Object.entries(updates.pageAssignments)
        .filter(([_, assignment]) => (assignment as any).enabled)
        .map(([pageId]) => pageId)
    })

    return HttpResponse.json({
      success: true,
      data: customersFromDb[customerIndex],
      message: `Page assignments updated for ${customer.companyName}`
    })
  }),

  // Get all customers for admin/setup purposes
  http.get('/api/customers', () => {
    // Read from db.json instead of DUMMY_CUSTOMERS
    const customersFromDb = (dbData as any).customerDetails || []
    const incidentsDb = (dbData as any).dashboard?.incidents || []
    const regionsDb = (dbData as any).regions || []
    const sitesDb = (dbData as any).sites || []
    
    console.log('🔍 [All Customers] Loading from db.json:', {
      totalCustomers: customersFromDb.length,
      customers: customersFromDb.map((c: any) => ({ id: c.id, name: c.companyName }))
    })
    
    return HttpResponse.json({
      success: true,
      data: customersFromDb.map((customer: any) => {
        const customerIncidents = incidentsDb.filter((incident: any) => 
          incident.customerId === customer.id || 
          incident.customerName === customer.companyName
        )
        
        // Calculate regions and sites counts from database
        const customerRegions = regionsDb.filter((region: any) => region.customerId === customer.id)
        const customerSites = sitesDb.filter((site: any) => site.customerId === customer.id)
        
        // Fallback counts if db data doesn't work
        const regionsCount = customerRegions.length > 0 ? customerRegions.length : 
          (customer.id === 21 ? 3 : customer.id === 22 ? 3 : customer.id === 23 ? 3 : 0)
        const sitesCount = customerSites.length > 0 ? customerSites.length : 
          (customer.id === 21 ? 6 : customer.id === 22 ? 3 : customer.id === 23 ? 6 : 0)
        
        return {
          ...customer,
          statistics: {
            incidents: customerIncidents.length,
            reports: Math.floor(Math.random() * 200) + 50,
            regions: regionsCount,
            sites: sitesCount
          }
        }
      })
    })
  }),

  // GET /api/customers/:id/regions - Get customer regions
  http.get(`${BASE_API_URL}/customers/:id/regions`, async ({ params }) => {
    await delay(200)
    
    const customerRegions = regions.filter(r => r.customerId === parseInt(params.id as string))
    
    return HttpResponse.json({
      success: true,
      data: customerRegions
    })
  })
]
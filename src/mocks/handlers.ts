import { http, HttpResponse, delay } from 'msw'
import type { PageAccessSettings } from '@/api/pageAccess'
import type { Incident } from '@/types/incidents'
import type { IncidentsResponse, IncidentResponse, UpsertIncidentRequest } from '@/types/api'
import { defaultPageAccess, getPageAccess } from '@/api/pageAccess'
import { BASE_API_URL } from '@/config/api'
import { mockIncidents } from '@/data/mockIncidents'
import { v4 as uuidv4 } from 'uuid'
import { GetIncidentsParams } from '@/types/api'
import { siteVisitHandlers } from './siteVisitHandlers'
import { safeDuressWordsHandlers } from './safeDuressWordsHandlers'
import { holidayRequestHandlers } from './holidayRequestHandlers'
import { customerSatisfactionHandlers } from './customerSatisfactionHandlers'
import { bankHolidayHandlers } from './bankHolidayHandlers'
import { customerHandlers } from './customerHandlers'
import { mockUsers, mockCustomers, mockEmployees } from '@/data/mockData'
import { User, Customer, Employee, AuthResponse, UserResponse, UsersResponse, UserRole, AdvantageOneUser, CustomerUser } from '@/types/user'

// Mock users data
const users: (
  | (Omit<AdvantageOneUser, 'role'> & { password: string; role: UserRole })
  | (Omit<CustomerUser, 'role'> & { password: string; role: UserRole })
)[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    firstName: 'Alice',
    lastName: 'Admin',
    email: 'admin@example.com',
    role: 'Administrator',
    pageAccessRole: 'Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'officer1',
    password: 'officer123',
    firstName: 'Oscar',
    lastName: 'Officer',
    email: 'officer1@example.com',
    role: 'AdvantageOneOfficer',
    pageAccessRole: 'AdvantageOneOfficer',
    assignedCustomerIds: ['1', '2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    username: 'officer2',
    password: 'officer456',
    firstName: 'Olivia',
    lastName: 'Officer',
    email: 'officer2@example.com',
    role: 'AdvantageOneOfficer',
    pageAccessRole: 'AdvantageOneOfficer',
    assignedCustomerIds: ['3', '4'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    username: 'customerho',
    password: 'customer123',
    firstName: 'Cathy',
    lastName: 'Customer',
    email: 'customer@example.com',
    role: 'CustomerHOManager',
    pageAccessRole: 'CustomerHOManager',
    companyId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
]

// Helper to simulate database operations
let incidents = [...mockIncidents]
let dbUsers: (
  | (AdvantageOneUser & { password: string })
  | (CustomerUser & { password: string })
)[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    firstName: 'Alice',
    lastName: 'Admin',
    email: 'admin@example.com',
    role: 'Administrator',
    pageAccessRole: 'Administrator',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'officer1',
    password: 'officer123',
    firstName: 'Oscar',
    lastName: 'Officer',
    email: 'officer1@example.com',
    role: 'AdvantageOneOfficer',
    pageAccessRole: 'AdvantageOneOfficer',
    assignedCustomerIds: ['1', '2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    username: 'hoofficer',
    password: 'ho123',
    firstName: 'Harry',
    lastName: 'HOOfficer',
    email: 'hoofficer@example.com',
    role: 'AdvantageOneHOOfficer',
    pageAccessRole: 'AdvantageOneHOOfficer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    username: 'customerho',
    password: 'customer123',
    firstName: 'Cathy',
    lastName: 'Customer',
    email: 'customer@example.com',
    role: 'CustomerHOManager',
    pageAccessRole: 'CustomerHOManager',
    companyId: 'COOP001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    username: 'customersite',
    password: 'site123',
    firstName: 'Sam',
    lastName: 'SiteManager',
    email: 'sitemanager@example.com',
    role: 'CustomerSiteManager',
    pageAccessRole: 'CustomerSiteManager',
    companyId: 'COOP001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    username: 'midcounties',
    password: 'mid123',
    firstName: 'Michael',
    lastName: 'Midcounties',
    email: 'manager@midcounties.coop',
    role: 'CustomerHOManager',
    pageAccessRole: 'CustomerHOManager',
    companyId: 'COOP002',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '7',
    username: 'heartengland',
    password: 'heart123',
    firstName: 'Helen',
    lastName: 'HeartEngland',
    email: 'manager@heartengland.coop',
    role: 'CustomerHOManager',
    pageAccessRole: 'CustomerHOManager',
    companyId: 'COOP003',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '8',
    username: 'midsite',
    password: 'midsite123',
    firstName: 'Mark',
    lastName: 'MidSite',
    email: 'sitemanager@midcounties.coop',
    role: 'CustomerSiteManager',
    pageAccessRole: 'CustomerSiteManager',
    companyId: 'COOP002',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '9',
    username: 'heartsite',
    password: 'heartsite123',
    firstName: 'Hannah',
    lastName: 'HeartSite',
    email: 'sitemanager@heartengland.coop',
    role: 'CustomerSiteManager',
    pageAccessRole: 'CustomerSiteManager',
    companyId: 'COOP003',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Helper function to validate request
const validateRequest = async (request: Request) => {
  try {
    return await request.json()
  } catch (error) {
    throw new Error('Invalid JSON payload')
  }
}

// Save to db.json
const saveToDb = async () => {
  try {
    const dbResponse = await fetch('/db.json')
    const db = await dbResponse.json()
    
    db.users = dbUsers
    
    await fetch('/db.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(db),
    })
  } catch (error) {
    console.error('Failed to save to db.json:', error)
  }
}

// Load from db.json
const loadFromDb = async () => {
  try {
    const dbResponse = await fetch('/db.json')
    const db = await dbResponse.json()
    
    if (db.users) {
      dbUsers = db.users
    }
  } catch (error) {
    console.error('Failed to load from db.json:', error)
  }
}

// Load data on startup
loadFromDb()

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

// Page Access Settings state
let pageAccessSettings: PageAccessSettings = {
  pageAccessByRole: defaultPageAccess
}

// Load initial settings from db.json
fetch('/db.json')
  .then(response => response.json())
  .then(data => {
    if (data.pageAccess) {
      pageAccessSettings = data.pageAccess
    }
  })
  .catch(error => console.error('Error loading page access settings:', error))

// Helper function to filter customers based on user role and access
const filterCustomersByUserAccess = (user: User): Customer[] => {
  if (user.role === 'Administrator') {
    return mockCustomers
  }
  
  if (user.role === 'AdvantageOneOfficer' && user.assignedCustomerIds) {
    return mockCustomers.filter(customer => 
      user.assignedCustomerIds?.includes(customer.id)
    )
  }
  
  if ((user.role === 'CustomerSiteManager' || user.role === 'CustomerHOManager') && user.companyId) {
    return mockCustomers.filter(customer => 
      customer.id === user.companyId
    )
  }
  
  return []
}

export const handlers = [
  // Customer handlers must come first to avoid route conflicts
  ...customerHandlers,

  // Login and user management handlers
  // POST /api/login - Handle user login
  http.post(`${BASE_API_URL}/login`, async ({ request }) => {
    try {
      const { username, password } = await validateRequest(request)
      
      if (!username || !password) {
        return new HttpResponse(
          JSON.stringify({ 
            success: false,
            message: 'Username and password are required' 
          }),
          { status: 400 }
        )
      }
      
      const user = dbUsers.find(u => u.username === username && u.password === password)
      
      if (!user) {
        return new HttpResponse(
          JSON.stringify({ 
            success: false,
            message: 'Invalid username or password' 
          }),
          { status: 401 }
        )
      }
      
      // Don't send password in response
      const { password: _, ...userInfo } = user
      
      return HttpResponse.json({
        success: true,
        data: {
          user: userInfo,
          token: 'mock-jwt-token'
        }
      })
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ 
          success: false,
          message: 'Internal server error' 
        }),
        { status: 500 }
      )
    }
  }),

  // POST /api/users - Create new user
  http.post(`${BASE_API_URL}/users`, async ({ request }) => {
    try {
      const newUser = await validateRequest(request)
      
      // Check if username already exists
      if (dbUsers.some(u => u.username === newUser.username)) {
        return new HttpResponse(
          JSON.stringify({ 
            success: false,
            message: 'Username already exists' 
          }),
          { status: 400 }
        )
      }
      
      // Add timestamps and ID
      const now = new Date().toISOString()
      const userWithTimestamps = {
        ...newUser,
        id: String(dbUsers.length + 1),
        createdAt: now,
        updatedAt: now
      }
      
      dbUsers.push(userWithTimestamps)
      await saveToDb()
      
      // Don't send password in response
      const { password: _, ...userInfo } = userWithTimestamps
      
      return HttpResponse.json({
        success: true,
        data: userInfo
      }, { status: 201 })
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ 
          success: false,
          message: 'Failed to create user' 
        }),
        { status: 500 }
      )
    }
  }),

  // GET /api/users/:userId - Get user details
  http.get(`${BASE_API_URL}/users/:userId`, async ({ params }) => {
    const user = dbUsers.find(u => u.id === params.userId)
    
    if (!user) {
      return new HttpResponse(
        JSON.stringify({ 
          success: false,
          message: 'User not found' 
        }),
        { status: 404 }
      )
    }
    
    // Don't send password in response
    const { password: _, ...userInfo } = user
    
    return HttpResponse.json({
      success: true,
      data: userInfo
    })
  }),

  // GET /api/customers - Get all customers (filtered by user access)
  http.get(`${BASE_API_URL}/customers`, async ({ request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return new HttpResponse(
        JSON.stringify({ message: 'User ID is required' }),
        { status: 400 }
      )
    }
    
    const user = mockUsers.find(u => u.id === userId)
    if (!user) {
      return new HttpResponse(
        JSON.stringify({ message: 'User not found' }),
        { status: 404 }
      )
    }
    
    const filteredCustomers = filterCustomersByUserAccess(user)
    
    return HttpResponse.json({
      success: true,
      data: filteredCustomers
    })
  }),

  // GET /api/customers/:customerId - Get customer details
  http.get(`${BASE_API_URL}/customers/:customerId`, async ({ params, request }) => {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return new HttpResponse(
        JSON.stringify({ message: 'User ID is required' }),
        { status: 400 }
      )
    }
    
    const user = mockUsers.find(u => u.id === userId)
    if (!user) {
      return new HttpResponse(
        JSON.stringify({ message: 'User not found' }),
        { status: 404 }
      )
    }
    
    const customer = mockCustomers.find(c => c.id === params.customerId)
    if (!customer) {
      return new HttpResponse(
        JSON.stringify({ message: 'Customer not found' }),
        { status: 404 }
      )
    }
    
    // Check if user has access to this customer
    const hasAccess = filterCustomersByUserAccess(user).some(c => c.id === customer.id)
    if (!hasAccess) {
      return new HttpResponse(
        JSON.stringify({ message: 'Access denied' }),
        { status: 403 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      data: customer
    })
  }),

  // GET /api/employees/:userId - Get employee details
  http.get(`${BASE_API_URL}/employees/:userId`, async ({ params }) => {
    const employee = mockEmployees.find(e => e.userId === params.userId)
    
    if (!employee) {
      return new HttpResponse(
        JSON.stringify({ message: 'Employee not found' }),
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      success: true,
      data: employee
    })
  }),

  // GET /api/incidents - Get paginated incidents
  http.get(`${BASE_API_URL}/incidents`, async ({ request }) => {
    try {
      await delay(500) // Simulate network latency

      const url = new URL(request.url)
      const page = Number(url.searchParams.get('page')) || 1
      const pageSize = Number(url.searchParams.get('pageSize')) || 10
      const search = url.searchParams.get('search') || ''

      // Filter incidents based on search term
      let filteredIncidents = incidents
      if (search) {
        filteredIncidents = incidents.filter(incident =>
          incident.siteName.toLowerCase().includes(search.toLowerCase()) ||
          incident.description.toLowerCase().includes(search.toLowerCase())
        )
      }

      const totalCount = filteredIncidents.length
      const totalPages = Math.ceil(totalCount / pageSize)
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize

      const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex)

      const response: IncidentsResponse = {
        success: true,
        data: paginatedIncidents,
        pagination: {
          currentPage: page,
          totalPages,
          pageSize,
          totalCount,
          hasPrevious: page > 1,
          hasNext: page < totalPages
        }
      }

      return HttpResponse.json(response)
    } catch (error) {
      return createErrorResponse(500, 'Failed to fetch incidents')
    }
  }),

  // GET /api/incidents/:id - Get single incident
  http.get(`${BASE_API_URL}/incidents/:id`, async ({ params }) => {
    try {
      await delay(200)

      const incident = incidents.find(inc => inc.id === params.id)
      if (!incident) {
        return createErrorResponse(404, 'Incident not found')
      }

      const response: IncidentResponse = {
        success: true,
        data: incident
      }

      return HttpResponse.json(response)
    } catch (error) {
      return createErrorResponse(500, 'Failed to fetch incident')
    }
  }),

  // POST /api/incidents - Create new incident
  http.post(`${BASE_API_URL}/incidents`, async ({ request }) => {
    try {
      const { incident: newIncident } = await validateRequest(request) as UpsertIncidentRequest

      const incident: Incident = {
        ...newIncident,
        id: Math.random().toString(36).substr(2, 9),
        dateInputted: new Date().toISOString()
      }

      incidents.unshift(incident)

      return HttpResponse.json({
        success: true,
        data: incident,
        message: 'Incident created successfully'
      }, { status: 201 })
    } catch (error) {
      return createErrorResponse(400, error instanceof Error ? error.message : 'Failed to create incident')
    }
  }),

  // PUT /api/incidents/:id - Update incident
  http.put(`${BASE_API_URL}/incidents/:id`, async ({ params, request }) => {
    try {
      const { incident: updatedIncident } = await validateRequest(request) as UpsertIncidentRequest

      const index = incidents.findIndex(inc => inc.id === params.id)
      if (index === -1) {
        return createErrorResponse(404, 'Incident not found')
      }

      incidents[index] = {
        ...updatedIncident,
        id: params.id as string,
        dateInputted: incidents[index].dateInputted
      }

      return HttpResponse.json({
        success: true,
        data: incidents[index],
        message: 'Incident updated successfully'
      })
    } catch (error) {
      return createErrorResponse(400, error instanceof Error ? error.message : 'Failed to update incident')
    }
  }),

  // DELETE /api/incidents/:id - Delete incident
  http.delete(`${BASE_API_URL}/incidents/:id`, async ({ params }) => {
    try {
      const index = incidents.findIndex(inc => inc.id === params.id)
      if (index === -1) {
        return createErrorResponse(404, 'Incident not found')
      }

      const deletedIncident = incidents[index]
      incidents.splice(index, 1)

      return HttpResponse.json({
        success: true,
        data: deletedIncident,
        message: 'Incident deleted successfully'
      })
    } catch (error) {
      return createErrorResponse(500, 'Failed to delete incident')
    }
  }),

  // GET /api/page-access
  http.get(`${BASE_API_URL}/page-access`, () => {
    return HttpResponse.json(pageAccessSettings)
  }),

  // PUT /api/page-access
  http.put(`${BASE_API_URL}/page-access`, async ({ request }) => {
    const newSettings = await request.json() as PageAccessSettings
    pageAccessSettings = newSettings

    // Save to db.json
    const dbResponse = await fetch('/db.json')
    const db = await dbResponse.json()
    db.pageAccess = newSettings

    await fetch('/db.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(db),
    })

    return HttpResponse.json({ success: true })
  }),

  // Other feature handlers
  ...siteVisitHandlers,
  ...safeDuressWordsHandlers,
  ...holidayRequestHandlers,
  ...customerSatisfactionHandlers,
  ...bankHolidayHandlers,

  // Page Access handler should be last
  http.get(`${BASE_API_URL}/page-access`, async () => {
    const data = await getPageAccess()
    return HttpResponse.json(data)
  })
]
import { http, HttpResponse, delay } from 'msw'
import type { PageAccessSettings } from '@/api/pageAccess'
import { defaultPageAccess, getPageAccess } from '@/api/pageAccess'
import { BASE_API_URL } from '@/config/api'
import { v4 as uuidv4 } from 'uuid'
import { siteVisitHandlers } from './siteVisitHandlers'
import { safeDuressWordsHandlers } from './safeDuressWordsHandlers'
import { holidayRequestHandlers } from './holidayRequestHandlers'
import { customerSatisfactionHandlers } from './customerSatisfactionHandlers'
import { bankHolidayHandlers } from './bankHolidayHandlers'
import { customerHandlers } from './customerHandlers'
import { regionsHandlers } from './regionsHandlers'
import { sitesHandlers } from './sitesHandlers'
import { incidentHandlers } from './incidentHandlers'
import { mockUsers, mockCustomers, mockEmployees } from '@/data/mockData'
import { User, Customer, Employee, AuthResponse, UserResponse, UsersResponse, UserRole, AdvantageOneUser, CustomerUser } from '@/types/user'
import { userHandlers } from './userHandlers'
import { settingsHandlers } from './settingsHandlers'
import { headerHandlers } from './headerHandlers'
import { PageAccessSettings as PageAccessSettingsService } from '@/services/settingsService'
import { dashboardHandlers } from './dashboardHandlers'
import { mysteryShopperHandlers } from './mysteryShopperHandlers'

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

// Helper to simulate database operations (incidents handled by incidentHandlers.ts)
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

// Helper function to ensure Administrator has all pages
const ensureAdminAccess = (settings: PageAccessSettings): PageAccessSettings => {
  const allPageIds = defaultPageAccess.Administrator;
  const currentAdminAccess = settings.pageAccessByRole.Administrator || [];

  // If admin doesn't have all pages, give them full access
  if (!allPageIds.every(id => currentAdminAccess.includes(id))) {
    return {
      ...settings,
      pageAccessByRole: {
        ...settings.pageAccessByRole,
        Administrator: allPageIds
      }
    };
  }

  return settings;
};

// Page Access Settings state
let pageAccessSettings: PageAccessSettings = {
  pageAccessByRole: defaultPageAccess
};

// Load initial settings from db.json
fetch('/db.json')
  .then(response => response.json())
  .then(data => {
    if (data.pageAccess) {
      // Ensure role names are correct and admin has full access
      const correctedAccess = Object.entries(data.pageAccess.pageAccessByRole).reduce((acc, [role, pages]) => {
        // Convert kebab-case to PascalCase for role names
        const correctedRole = role
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        acc[correctedRole] = pages;
        return acc;
      }, {});
      
      pageAccessSettings = ensureAdminAccess({
        pageAccessByRole: {
          ...defaultPageAccess,  // Keep default access as fallback
          ...correctedAccess     // Override with stored settings
        }
      });
    }
  })
  .catch(error => console.error('Error loading page access settings:', error));

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

interface LoginRequest {
  username: string;
  password: string;
}

export const handlers = [
  ...dashboardHandlers,
  ...headerHandlers,
  ...settingsHandlers,
  // Customer handlers must come first to avoid route conflicts
  ...customerHandlers,
  ...userHandlers,

  // Login handler
  http.post('/api/login', async ({ request }) => {
    try {
      const body = await request.json() as LoginRequest;
      const { username } = body;

      // Simulate successful login
      const mockUser = {
        id: 'user123',
        username,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: username.includes('customer') ? 'CustomerHOManager' : 'AdvantageOneOfficer',
        // For CustomerHOManager, associate with Central England COOP
        ...(username.includes('customer') ? {
          companyId: 'COOP001',
          companyName: 'Central England COOP'
        } : {
          assignedCustomerIds: ['COOP001', 'COOP002']
        })
      };

      return HttpResponse.json({
        success: true,
        message: 'Login successful',
        data: {
          token: 'mock-jwt-token',
          user: mockUser
        }
      });
    } catch (error) {
      return new HttpResponse(null, { status: 400 });
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

  // GET /api/page-access
  http.get(`${BASE_API_URL}/page-access`, () => {
    return HttpResponse.json(pageAccessSettings)
  }),

  // PUT /api/page-access
  http.put(`${BASE_API_URL}/page-access`, async ({ request }) => {
    const data = await request.json() as PageAccessSettings;
    
    // Ensure role names are in correct format
    const correctedAccess = Object.entries(data.pageAccessByRole).reduce((acc, [role, pages]) => {
      // Convert kebab-case to PascalCase for role names if needed
      const correctedRole = role.includes('-') 
        ? role.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('')
        : role;
      acc[correctedRole] = pages;
      return acc;
    }, {});
    
    // Ensure admin access is preserved
    pageAccessSettings = ensureAdminAccess({
      pageAccessByRole: correctedAccess
    });
    
    // Save to db.json
    const dbResponse = await fetch('/db.json')
    const db = await dbResponse.json()
    db.pageAccess = pageAccessSettings

    await fetch('/db.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(db),
    })

    return HttpResponse.json(pageAccessSettings)
  }),

  // Other feature handlers
  ...siteVisitHandlers,
  ...safeDuressWordsHandlers,
  ...holidayRequestHandlers,
  ...customerSatisfactionHandlers,
  ...bankHolidayHandlers,
  ...regionsHandlers,
  ...sitesHandlers,
  ...incidentHandlers,
  ...mysteryShopperHandlers,

  // Page Access handler should be last
  http.get(`${BASE_API_URL}/page-access`, async () => {
    const data = await getPageAccess()
    return HttpResponse.json(data)
  })
]
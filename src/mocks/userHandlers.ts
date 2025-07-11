import { http, HttpResponse } from 'msw';
import { BASE_API_URL } from '@/config/api';
import { User, CreateUserInput, UpdateUserInput, CustomerUser, AdvantageOneUser } from '@/types/user';
import { userOperations } from './handlers';

// Helper function to validate request
const validateRequest = async (request: Request) => {
  try {
    return await request.json();
  } catch (error) {
    throw new Error('Invalid JSON payload');
  }
};

// Helper function to create a properly typed user based on role
const createTypedUser = (data: Omit<CreateUserInput, 'id'> & { id: string }): User => {
  const isCustomerRole = data.role === 'CustomerSiteManager' || data.role === 'CustomerHOManager';
  
  const now = new Date().toISOString();
  const baseUser = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  
  if (isCustomerRole) {
    if (!('companyId' in data)) {
      throw new Error('Company ID is required for customer users');
    }
    return baseUser as CustomerUser;
  } else {
    if (data.role !== 'AdvantageOneOfficer' && data.role !== 'AdvantageOneHOOfficer' && data.role !== 'Administrator') {
      throw new Error('Invalid role for Advantage One user');
    }
    return baseUser as AdvantageOneUser;
  }
};

// Helper function to update a properly typed user based on role
const updateTypedUser = (existingUser: User, data: UpdateUserInput): User => {
  const isCustomerRole = data.role === 'CustomerSiteManager' || data.role === 'CustomerHOManager';
  
  const baseUser = {
    ...existingUser,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  if (isCustomerRole) {
    if (!('companyId' in baseUser)) {
      throw new Error('Company ID is required for customer users');
    }
    return baseUser as CustomerUser;
  } else {
    if (baseUser.role !== 'AdvantageOneOfficer' && baseUser.role !== 'AdvantageOneHOOfficer' && baseUser.role !== 'Administrator') {
      throw new Error('Invalid role for Advantage One user');
    }
    return baseUser as AdvantageOneUser;
  }
};

interface LoginRequest {
  username: string;
  password: string;
}

// Login handler
const loginHandler = http.post<any, LoginRequest>(`${BASE_API_URL}/login`, async ({ request }) => {
  const body = await request.json() as LoginRequest;
  const { username, password } = body;
  
  try {
    // Load users from store
    const users = await userOperations.getAll();
    const user = users.find(u => u.username === username);
    
    if (!user || user.password !== password) {
      return HttpResponse.json({
        success: false,
        message: 'Invalid username or password'
      }, { status: 401 });
    }
    
    // Generate a proper JWT token structure
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      username: user.username,
      role: user.role,
      ...('customerId' in user ? { companyId: user.customerId } : {}),
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    }));
    const signature = btoa('mock-signature');
    
    const token = `${header}.${payload}.${signature}`;
    
    return HttpResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          ...user,
          pageAccessRole: user.role,
          ...(user.role === 'CustomerSiteManager' || user.role === 'CustomerHOManager'
            ? { 
                companyId: (user as CustomerUser).customerId,
                customerId: (user as CustomerUser).customerId
              }
            : { assignedCustomerIds: (user as AdvantageOneUser).assignedCustomerIds || [] }
          )
        }
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return HttpResponse.json({
      success: false,
      message: 'Login failed due to server error'
    }, { status: 500 });
  }
});

export const userHandlers = [
  loginHandler,
  
  // GET /api/users - Get all users
  http.get(`${BASE_API_URL}/users`, async () => {
    try {
      const users = await userOperations.getAll();
      return HttpResponse.json({
        success: true,
        data: users,
      });
    } catch (error) {
      return HttpResponse.json({ 
        success: false,
        message: 'Failed to fetch users' 
      }, { status: 500 });
    }
  }),

  // GET /api/users/:id - Get user by ID
  http.get(`${BASE_API_URL}/users/:id`, async ({ params }) => {
    try {
      const user = await userOperations.getById(params.id as string);
      if (!user) {
        return HttpResponse.json({ 
          success: false,
          message: 'User not found' 
        }, { status: 404 });
      }
      
      console.log('🔍 [UserHandler] Returning user data for ID:', params.id, {
        username: user.username,
        role: user.role,
        assignedCustomerIds: 'assignedCustomerIds' in user ? user.assignedCustomerIds : 'N/A'
      });
      
      return HttpResponse.json({
        success: true,
        data: user,
      });
    } catch (error) {
      return HttpResponse.json({ 
        success: false,
        message: 'Failed to fetch user' 
      }, { status: 500 });
    }
  }),

  // POST /api/users - Create new user
  http.post(`${BASE_API_URL}/users`, async ({ request }) => {
    try {
      const userData = await validateRequest(request) as CreateUserInput;
      const newUser = createTypedUser({ ...userData, id: Date.now().toString() });
      await userOperations.create(newUser);
      
      return HttpResponse.json({
        success: true,
        data: newUser,
      });
    } catch (error) {
      return HttpResponse.json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create user' 
      }, { status: 500 });
    }
  }),

  // PUT /api/users/:id - Update user
  http.put(`${BASE_API_URL}/users/:id`, async ({ request, params }) => {
    try {
      const userData = await validateRequest(request) as UpdateUserInput;
      const existingUser = await userOperations.getById(params.id as string);
      
      if (!existingUser) {
        return HttpResponse.json({ 
          success: false,
          message: 'User not found' 
        }, { status: 404 });
      }
      
      const updatedUser = updateTypedUser(existingUser, userData);
      const result = await userOperations.update(params.id as string, updatedUser);
      
      if (!result) {
        throw new Error('Failed to update user');
      }
      
      return HttpResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      return HttpResponse.json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user' 
      }, { status: 500 });
    }
  }),

  // DELETE /api/users/:id - Delete user
  http.delete(`${BASE_API_URL}/users/:id`, async ({ params }) => {
    try {
      await userOperations.delete(params.id as string);
      return HttpResponse.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      return HttpResponse.json({ 
        success: false,
        message: 'Failed to delete user' 
      }, { status: 500 });
    }
  }),
];
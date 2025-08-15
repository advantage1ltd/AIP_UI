import { http, HttpResponse } from 'msw';
import { BASE_API_URL } from '@/config/api';
import { User, CreateUserInput, UpdateUserInput, CustomerUser, AdvantageOneUser } from '@/types/user';
import { userOperations } from './handlers';

// Enhanced logging utility
const log = {
  info: (message: string, data?: any) => {
    console.log(`${new Date().toISOString()} 📝 [UserHandler] ${message}`, data ? data : '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`${new Date().toISOString()} ⚠️ [UserHandler] ${message}`, data ? data : '');
  },
  error: (message: string, data?: any) => {
    console.error(`${new Date().toISOString()} ❌ [UserHandler] ${message}`, data ? data : '');
  },
  success: (message: string, data?: any) => {
    console.log(`${new Date().toISOString()} ✅ [UserHandler] ${message}`, data ? data : '');
  }
};

// Helper function to validate request
const validateRequest = async (request: Request) => {
  try {
    const data = await request.json();
    log.info('Request validation successful', { data });
    return data;
  } catch (error) {
    log.error('Request validation failed', { error });
    throw new Error('Invalid JSON payload');
  }
};

// Helper function to create a properly typed user based on role
const createTypedUser = (data: Omit<CreateUserInput, 'id'> & { id: string }): User => {
  log.info('Creating typed user', { role: data.role, username: data.username });
  
  const isCustomerRole = data.role === 'CustomerSiteManager' || data.role === 'CustomerHOManager';
  
  const now = new Date().toISOString();
  const baseUser = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  
  if (isCustomerRole) {
    if (!('companyId' in data)) {
      log.error('Company ID missing for customer user', { data });
      throw new Error('Company ID is required for customer users');
    }
    log.success('Created customer user', { id: baseUser.id, role: baseUser.role });
    return baseUser as CustomerUser;
  } else {
    if (data.role !== 'AdvantageOneOfficer' && data.role !== 'AdvantageOneHOOfficer' && data.role !== 'Administrator') {
      log.error('Invalid role for Advantage One user', { role: data.role });
      throw new Error('Invalid role for Advantage One user');
    }
    log.success('Created Advantage One user', { id: baseUser.id, role: baseUser.role });
    return baseUser as AdvantageOneUser;
  }
};

// Helper function to update a properly typed user based on role
const updateTypedUser = (existingUser: User, data: UpdateUserInput): User => {
  log.info('Updating typed user', { id: existingUser.id, role: data.role });
  
  const isCustomerRole = data.role === 'CustomerSiteManager' || data.role === 'CustomerHOManager';
  
  const baseUser = {
    ...existingUser,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  if (isCustomerRole) {
    if (!('companyId' in baseUser)) {
      log.error('Company ID missing for customer user update', { data });
      throw new Error('Company ID is required for customer users');
    }
    log.success('Updated customer user', { id: baseUser.id, role: baseUser.role });
    return baseUser as CustomerUser;
  } else {
    if (baseUser.role !== 'AdvantageOneOfficer' && baseUser.role !== 'AdvantageOneHOOfficer' && baseUser.role !== 'Administrator') {
      log.error('Invalid role for Advantage One user update', { role: baseUser.role });
      throw new Error('Invalid role for Advantage One user');
    }
    log.success('Updated Advantage One user', { id: baseUser.id, role: baseUser.role });
    return baseUser as AdvantageOneUser;
  }
};

interface LoginRequest {
  email: string;
  password: string;
}

// Login handler
const loginHandler = http.post<any, LoginRequest>(`${BASE_API_URL}/Auth/login`, async ({ request }) => {
  log.info('Login request received');
  
  try {
    const body = await request.json() as LoginRequest;
    const { username, password } = body;
    
    log.info('Login attempt', { username });
    
    // Load users from store
    const users = await userOperations.getAll();
    const user = users.find(u => u.username === username);
    
    if (!user || user.password !== password) {
      log.warn('Login failed - invalid credentials', { username });
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
    
    log.success('Login successful', { username, role: user.role });
    
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
    log.error('Login error', { error });
    return HttpResponse.json({
      success: false,
      message: 'Login failed due to server error'
    }, { status: 500 });
  }
});

export const userHandlers = [
  loginHandler,
  
  // GET /api/user - Get all users (matches USER_ENDPOINTS.LIST)
  http.get(`${BASE_API_URL}/user`, async ({ request }) => {
    log.info('GET /user - Fetching all users');
    
    try {
      const url = new URL(request.url);
      const page = url.searchParams.get('page');
      const pageSize = url.searchParams.get('pageSize');
      const searchTerm = url.searchParams.get('searchTerm');
      
      log.info('User list request parameters', { page, pageSize, searchTerm });
      
      const users = await userOperations.getAll();
      
      // Apply search filter if provided
      let filteredUsers = users;
      if (searchTerm) {
        filteredUsers = users.filter(user => 
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply pagination if provided
      let paginatedUsers = filteredUsers;
      if (page && pageSize) {
        const pageNum = parseInt(page);
        const size = parseInt(pageSize);
        const startIndex = (pageNum - 1) * size;
        const endIndex = startIndex + size;
        paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      }
      
      log.success('Users fetched successfully', { 
        total: users.length, 
        filtered: filteredUsers.length, 
        returned: paginatedUsers.length 
      });
      
      return HttpResponse.json({
        success: true,
        data: {
          items: paginatedUsers,
          totalCount: filteredUsers.length,
          pageNumber: page ? parseInt(page) : 1,
          pageSize: pageSize ? parseInt(pageSize) : filteredUsers.length,
          totalPages: page && pageSize ? Math.ceil(filteredUsers.length / parseInt(pageSize)) : 1,
          hasPreviousPage: page && pageSize ? parseInt(page) > 1 : false,
          hasNextPage: page && pageSize ? parseInt(page) < Math.ceil(filteredUsers.length / parseInt(pageSize)) : false,
        },
      });
    } catch (error) {
      log.error('Failed to fetch users', { error });
      return HttpResponse.json({ 
        success: false,
        message: 'Failed to fetch users' 
      }, { status: 500 });
    }
  }),

  // GET /api/user/:id - Get user by ID (matches USER_ENDPOINTS.DETAIL)
  http.get(`${BASE_API_URL}/user/:id`, async ({ params }) => {
    log.info('GET /user/:id - Fetching user by ID', { id: params.id });
    
    try {
      const user = await userOperations.getById(params.id as string);
      if (!user) {
        log.warn('User not found', { id: params.id });
        return HttpResponse.json({ 
          success: false,
          message: 'User not found' 
        }, { status: 404 });
      }
      
      log.success('User fetched successfully', {
        id: user.id,
        username: user.username,
        role: user.role,
        assignedCustomerIds: 'assignedCustomerIds' in user ? user.assignedCustomerIds : 'N/A'
      });
      
      return HttpResponse.json({
        success: true,
        data: user,
      });
    } catch (error) {
      log.error('Failed to fetch user', { error, id: params.id });
      return HttpResponse.json({ 
        success: false,
        message: 'Failed to fetch user' 
      }, { status: 500 });
    }
  }),

  // POST /api/user - Create new user (matches USER_ENDPOINTS.CREATE)
  http.post(`${BASE_API_URL}/user`, async ({ request }) => {
    log.info('POST /user - Creating new user');
    
    try {
      const userData = await validateRequest(request) as CreateUserInput;
      log.info('User creation data received', { 
        username: userData.username, 
        role: userData.role,
        assignedCustomerIds: userData.assignedCustomerIds 
      });
      
      const newUser = createTypedUser({ ...userData, id: Date.now().toString() });
      await userOperations.create(newUser);
      
      log.success('User created successfully', { 
        id: newUser.id, 
        username: newUser.username, 
        role: newUser.role 
      });
      
      return HttpResponse.json({
        success: true,
        data: newUser,
      });
    } catch (error) {
      log.error('Failed to create user', { error });
      return HttpResponse.json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create user' 
      }, { status: 500 });
    }
  }),

  // PUT /api/user/:id - Update user (matches USER_ENDPOINTS.UPDATE)
  http.put(`${BASE_API_URL}/user/:id`, async ({ request, params }) => {
    log.info('PUT /user/:id - Updating user', { id: params.id });
    
    try {
      const userData = await validateRequest(request) as UpdateUserInput;
      log.info('User update data received', { 
        id: params.id,
        role: userData.role,
        assignedCustomerIds: userData.assignedCustomerIds 
      });
      
      const existingUser = await userOperations.getById(params.id as string);
      
      if (!existingUser) {
        log.warn('User not found for update', { id: params.id });
        return HttpResponse.json({ 
          success: false,
          message: 'User not found' 
        }, { status: 404 });
      }
      
      const updatedUser = updateTypedUser(existingUser, userData);
      const result = await userOperations.update(params.id as string, updatedUser);
      
      if (!result) {
        log.error('Failed to update user in store', { id: params.id });
        throw new Error('Failed to update user');
      }
      
      log.success('User updated successfully', { 
        id: result.id, 
        username: result.username, 
        role: result.role 
      });
      
      return HttpResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      log.error('Failed to update user', { error, id: params.id });
      return HttpResponse.json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user' 
      }, { status: 500 });
    }
  }),

  // DELETE /api/user/:id - Delete user (matches USER_ENDPOINTS.DELETE)
  http.delete(`${BASE_API_URL}/user/:id`, async ({ params }) => {
    log.info('DELETE /user/:id - Deleting user', { id: params.id });
    
    try {
      await userOperations.delete(params.id as string);
      log.success('User deleted successfully', { id: params.id });
      
      return HttpResponse.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      log.error('Failed to delete user', { error, id: params.id });
      return HttpResponse.json({ 
        success: false,
        message: 'Failed to delete user' 
      }, { status: 500 });
    }
  }),

  // POST /api/user/:id/assign-customers - Assign customers to user (matches USER_ENDPOINTS.ASSIGN_CUSTOMERS)
  http.post(`${BASE_API_URL}/user/:id/assign-customers`, async ({ request, params }) => {
    log.info('POST /user/:id/assign-customers - Assigning customers to user', { id: params.id });
    
    try {
      const { customerIds } = await validateRequest(request);
      log.info('Customer assignment data received', { id: params.id, customerIds });
      
      const existingUser = await userOperations.getById(params.id as string);
      
      if (!existingUser) {
        log.warn('User not found for customer assignment', { id: params.id });
        return HttpResponse.json({ 
          success: false,
          message: 'User not found' 
        }, { status: 404 });
      }
      
      const updatedUser = {
        ...existingUser,
        assignedCustomerIds: customerIds,
        updatedAt: new Date().toISOString(),
      };
      
      const result = await userOperations.update(params.id as string, updatedUser);
      
      if (!result) {
        log.error('Failed to assign customers to user', { id: params.id });
        throw new Error('Failed to assign customers to user');
      }
      
      log.success('Customers assigned successfully', { 
        id: result.id, 
        assignedCustomerIds: result.assignedCustomerIds 
      });
      
      return HttpResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      log.error('Failed to assign customers to user', { error, id: params.id });
      return HttpResponse.json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to assign customers to user' 
      }, { status: 500 });
    }
  }),
];
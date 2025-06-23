import { http, HttpResponse } from 'msw';
import { BASE_API_URL } from '@/config/api';
import { User, CreateUserInput, UpdateUserInput, CustomerUser, AdvantageOneUser } from '@/types/user';

// Helper function to validate request
const validateRequest = async (request: Request) => {
  try {
    return await request.json();
  } catch (error) {
    throw new Error('Invalid JSON payload');
  }
};

// Helper function to save to db.json
const saveToDb = async (users: User[]) => {
  try {
    const dbResponse = await fetch('/db.json');
    const db = await dbResponse.json();
    
    db.users = users;
    
    await fetch('/db.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(db),
    });
  } catch (error) {
    console.error('Failed to save to db.json:', error);
    throw error;
  }
};

// Helper function to load from db.json
const loadFromDb = async (): Promise<User[]> => {
  try {
    const dbResponse = await fetch('/db.json');
    const db = await dbResponse.json();
    return db.users || [];
  } catch (error) {
    console.error('Failed to load from db.json:', error);
    throw error;
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

export const userHandlers = [
  // GET /api/users - Get all users
  http.get(`${BASE_API_URL}/users`, async () => {
    try {
      const users = await loadFromDb();
      return HttpResponse.json({
        success: true,
        data: users,
      });
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ 
          success: false,
          message: 'Failed to fetch users' 
        }),
        { status: 500 }
      );
    }
  }),

  // POST /api/users - Create new user
  http.post(`${BASE_API_URL}/users`, async ({ request }) => {
    try {
      const newUser = await validateRequest(request) as CreateUserInput;
      const users = await loadFromDb();
      
      // Check if username already exists
      if (users.some(u => u.username === newUser.username)) {
        return new HttpResponse(
          JSON.stringify({ 
            success: false,
            message: 'Username already exists' 
          }),
          { status: 400 }
        );
      }
      
      // Create new user with ID and timestamps
      const userWithId = {
        ...newUser,
        id: String(users.length + 1),
      };
      
      const typedUser = createTypedUser(userWithId);
      users.push(typedUser);
      await saveToDb(users);
      
      return HttpResponse.json({
        success: true,
        data: typedUser,
      }, { status: 201 });
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ 
          success: false,
          message: error instanceof Error ? error.message : 'Failed to create user' 
        }),
        { status: 500 }
      );
    }
  }),

  // PUT /api/users/:id - Update user
  http.put(`${BASE_API_URL}/users/:id`, async ({ request, params }) => {
    try {
      const userData = await validateRequest(request) as UpdateUserInput;
      const users = await loadFromDb();
      
      const index = users.findIndex(u => u.id === params.id);
      if (index === -1) {
        return new HttpResponse(
          JSON.stringify({ 
            success: false,
            message: 'User not found' 
          }),
          { status: 404 }
        );
      }
      
      // Update user with proper typing
      const updatedUser = updateTypedUser(users[index], userData);
      users[index] = updatedUser;
      await saveToDb(users);
      
      return HttpResponse.json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ 
          success: false,
          message: error instanceof Error ? error.message : 'Failed to update user' 
        }),
        { status: 500 }
      );
    }
  }),

  // DELETE /api/users/:id - Delete user
  http.delete(`${BASE_API_URL}/users/:id`, async ({ params }) => {
    try {
      const users = await loadFromDb();
      
      const filteredUsers = users.filter(u => u.id !== params.id);
      if (filteredUsers.length === users.length) {
        return new HttpResponse(
          JSON.stringify({ 
            success: false,
            message: 'User not found' 
          }),
          { status: 404 }
        );
      }
      
      await saveToDb(filteredUsers);
      
      return HttpResponse.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      return new HttpResponse(
        JSON.stringify({ 
          success: false,
          message: 'Failed to delete user' 
        }),
        { status: 500 }
      );
    }
  }),
]; 
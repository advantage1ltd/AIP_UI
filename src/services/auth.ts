import { User, AuthResponse, AdvantageOneUser, CustomerUser } from '@/types/user';
import { BASE_API_URL } from '@/config/api';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'user';

interface LoginCredentials {
  username: string;
  password: string;
}

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const login = async ({ username, password }: LoginCredentials): Promise<User> => {
  try {
    const response = await fetch(`${BASE_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok) {
      throw new AuthError(data.message || 'Login failed');
    }

    if (!data.data?.token || !data.data?.user) {
      throw new AuthError('Invalid response from server');
    }

    // Store auth data
    localStorage.setItem(TOKEN_KEY, data.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));

    const userData = data.data.user;
    const isAdvantageOneRole = ['AdvantageOneOfficer', 'AdvantageOneHOOfficer', 'Administrator'].includes(userData.role);
    return isAdvantageOneRole 
      ? { ...userData, assignedCustomerIds: (userData as any).assignedCustomerIds || [] } as AdvantageOneUser
      : { ...userData, companyId: (userData as any).companyId || userData.id } as CustomerUser;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    console.error('Login error:', error);
    throw new AuthError('Failed to login. Please try again.');
  }
};

export const logout = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Logout error:', error);
    throw new AuthError('Failed to logout');
  }
};

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const getUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    const userData = JSON.parse(userStr);
    const isAdvantageOneRole = ['AdvantageOneOfficer', 'AdvantageOneHOOfficer', 'Administrator'].includes(userData.role);
    
    return isAdvantageOneRole 
      ? { ...userData, assignedCustomerIds: userData.assignedCustomerIds || [] } as AdvantageOneUser
      : { ...userData, companyId: userData.companyId || userData.id } as CustomerUser;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  try {
    const token = getToken();
    const user = getUser();
    return !!(token && user);
  } catch (error) {
    console.error('Error checking auth:', error);
    return false;
  }
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  } : {
    'Content-Type': 'application/json',
  };
}; 
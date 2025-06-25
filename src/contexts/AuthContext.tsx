import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '@/types/user';
import { BASE_API_URL } from '@/config/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Ensure role is set in localStorage
        if (userData.role) {
          localStorage.setItem('userRole', userData.role);
        }
      } catch (err) {
        console.error('Failed to parse stored user:', err);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${BASE_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      // Set userRole in localStorage
      localStorage.setItem('userRole', data.data.user.role);
      
      const userData = data.data.user;
      const isAdvantageOneRole = ['AdvantageOneOfficer', 'AdvantageOneHOOfficer', 'Administrator'].includes(userData.role);
      
      // Type-safe user assignment
      if (isAdvantageOneRole) {
        setUser({
          ...userData,
          role: userData.role as 'AdvantageOneOfficer' | 'AdvantageOneHOOfficer' | 'Administrator',
          assignedCustomerIds: (userData as any).assignedCustomerIds || []
        });
      } else {
        // For customer users, prioritize customerId from the response, fallback to companyId
        const customerId = (userData as any).customerId || (userData as any).companyId;
        const companyId = (userData as any).companyId || customerId;
        setUser({
          ...userData,
          role: userData.role as 'CustomerSiteManager' | 'CustomerHOManager',
          customerId: customerId,
          companyId: companyId // For backward compatibility
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole'); // Also remove userRole on logout
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
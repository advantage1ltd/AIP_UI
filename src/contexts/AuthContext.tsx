import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '@/types/user';
import { BASE_API_URL } from '@/config/api';
import { authService } from '@/services/authService';

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
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        
        // NEW: Update unified auth service with existing session
        authService.setCurrentUser(userData);
        
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

      const response = await fetch(`${BASE_API_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: username, // Backend expects 'email' field
          password: password 
        }),
      });

      console.log('🔍 [AuthContext] Response status:', response.status);
      console.log('🔍 [AuthContext] Response headers:', Object.fromEntries(response.headers.entries()));

      const data: AuthResponse = await response.json();

      console.log('🔍 [AuthContext] Backend response:', data);
      console.log('🔍 [AuthContext] Data object:', data.data);
      console.log('🔍 [AuthContext] Data object keys:', Object.keys(data.data || {}));

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Handle real backend response format
      if (data.success && data.data) {
        // The backend returns a nested structure where data.data contains the actual response
        const loginData = data.data;
        const accessToken = loginData.accessToken;
        const userData = loginData.user;
        
        console.log('🔍 [AuthContext] User data:', userData);
        
        if (!userData) {
          throw new Error('User data is missing from response');
        }
        
        // Type-safe user assignment based on role
        const userRole = userData.Role || userData.role || userData.Roles?.[0] || 'CustomerSiteManager';
        const isAdvantageOneRole = ['AdvantageOneOfficer', 'AdvantageOneHOOfficer', 'Administrator'].includes(userRole);
        
        console.log('🔍 [AuthContext] Extracted role:', userRole);
        console.log('🔍 [AuthContext] Is AdvantageOne role:', isAdvantageOneRole);
        
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userRole', userRole);
        
        // Update unified auth service
        authService.setCurrentUser(userData);
        
        if (isAdvantageOneRole) {
          setUser({
            ...userData,
            role: userRole as 'AdvantageOneOfficer' | 'AdvantageOneHOOfficer' | 'Administrator',
            assignedCustomerIds: (userData as any).AssignedCustomerIds || (userData as any).assignedCustomerIds || []
          });
        } else {
          // For customer users, use customerId only
          const customerId = (userData as any).CustomerId || (userData as any).customerId;
          setUser({
            ...userData,
            role: userRole as 'CustomerSiteManager' | 'CustomerHOManager',
            customerId: customerId
          });
        }
      } else {
        throw new Error(data.message || 'Invalid response from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole'); // Also remove userRole on logout
    
    // NEW: Clear unified auth service
    authService.clearCurrentUser();
    
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
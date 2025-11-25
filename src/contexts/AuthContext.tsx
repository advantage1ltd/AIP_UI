import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '@/types/user';
import { BASE_API_URL } from '@/config/api';
import { authService } from '@/services/authService';
import { extractCustomerId } from '@/utils/customerId';

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

  // Listen for user assignment updates
  useEffect(() => {
    const handleUserAssignmentsUpdate = (event: CustomEvent) => {
      const updatedUser = event.detail;
      if (updatedUser && updatedUser.id === user?.id) {
        console.log('🔄 [AuthContext] Updating user assignments from event');
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        authService.setCurrentUser(updatedUser);
      }
    };

    window.addEventListener('user-assignments-updated', handleUserAssignmentsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('user-assignments-updated', handleUserAssignmentsUpdate as EventListener);
    };
  }, [user]);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    
    const restoreSession = async () => {
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          
          // Ensure customerId is set for customer roles (backward compatibility)
          const userRoleRaw = userData.role || userData.Role;
          const userRole = (userRoleRaw?.toLowerCase() || '') as UserRole;
          const isAdvantageOneRole = ['advantageoneofficer', 'advantageonehoofficer', 'administrator'].includes(userRole);
          
          if (!isAdvantageOneRole) {
            // Normalize CustomerId from API response (PascalCase) to customerId (camelCase)
            // The data in localStorage came from the API, so trust it
            const apiCustomerId = (userData as any).CustomerId ?? userData.customerId;
            if (apiCustomerId !== null && apiCustomerId !== undefined && apiCustomerId !== 0) {
              (userData as any).customerId = apiCustomerId;
              // Preserve both formats for compatibility
              (userData as any).CustomerId = apiCustomerId;
              console.log('🔧 [AuthContext] Normalized CustomerId from API during session restore:', apiCustomerId);
              // Update localStorage with normalized data
              localStorage.setItem('user', JSON.stringify(userData));
            } else {
              console.warn('⚠️ [AuthContext] No CustomerId found in stored user data. User may need to log in again.', {
                role: userRole,
                userId: userData.id || userData.Id,
                userDataKeys: Object.keys(userData)
              });
            }
          }
          
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
    };

    restoreSession();
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
        // Support both 'accessToken' and 'token' for backward compatibility
        const accessToken = loginData.accessToken || loginData.token;
        const userData = loginData.user;
        
        console.log('🔍 [AuthContext] Full loginData structure:', loginData);
        console.log('🔍 [AuthContext] User data:', userData);
        console.log('🔍 [AuthContext] User data customerId (direct):', (userData as any)?.customerId);
        console.log('🔍 [AuthContext] User data CustomerId (PascalCase):', (userData as any)?.CustomerId);
        
        if (!userData) {
          throw new Error('User data is missing from response');
        }
        
        if (!accessToken) {
          throw new Error('Access token is missing from response');
        }
        
        // Type-safe user assignment based on role
        const userRoleRaw = userData.Role || userData.role || userData.Roles?.[0] || 'customersitemanager';
        const userRole = (userRoleRaw?.toLowerCase() || 'customersitemanager') as UserRole;
        const isAdvantageOneRole = ['advantageoneofficer', 'advantageonehoofficer', 'administrator'].includes(userRole);
        
        console.log('🔍 [AuthContext] Extracted role (raw):', userRoleRaw);
        console.log('🔍 [AuthContext] Extracted role (normalized):', userRole);
        console.log('🔍 [AuthContext] Is AdvantageOne role:', isAdvantageOneRole);
        
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('userRole', userRole);
        
        // Build the complete user object with all necessary fields BEFORE storing in localStorage
        let completeUserData: User;
        
        if (isAdvantageOneRole) {
          completeUserData = {
            ...userData,
            role: userRole as 'advantageoneofficer' | 'advantageonehoofficer' | 'administrator',
            assignedCustomerIds: (userData as any).AssignedCustomerIds || (userData as any).assignedCustomerIds || []
          };
        } else {
          // For customer users: API returns CustomerId (PascalCase) - normalize to customerId (camelCase)
          // Trust the API response directly - it comes from the database
          const apiCustomerId = (userData as any).CustomerId ?? (userData as any).customerId;
          
          if (!apiCustomerId || apiCustomerId === 0) {
            console.error('❌ [AuthContext] API did not return CustomerId for customer user:', {
              role: userRole,
              userId: userData.id || userData.Id,
              userDataKeys: Object.keys(userData),
              rawUserData: userData
            });
            throw new Error('Customer ID is required for customer users but was not provided by the API');
          }
          
          // Normalize: store as both customerId (camelCase) and CustomerId (PascalCase) for compatibility
          completeUserData = {
            ...userData,
            role: userRole as 'customersitemanager' | 'customerhomanager',
            customerId: apiCustomerId
          };
          (completeUserData as any).CustomerId = apiCustomerId;
          
          console.log('✅ [AuthContext] Customer user logged in with CustomerId from API:', apiCustomerId);
        }
        
        // Store the complete user object (with customerId and CustomerId) in localStorage
        localStorage.setItem('user', JSON.stringify(completeUserData));
        
        // Update unified auth service with complete user data
        authService.setCurrentUser(completeUserData);
        
        // Set user state
        setUser(completeUserData);
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
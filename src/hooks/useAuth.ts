import { useState, useEffect } from 'react';
import { getUser, isAuthenticated } from '@/services/auth';

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: string;
  pageAccessRole: string;
  avatar?: string;
  lastLogin?: Date;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const user = getUser();
        const authenticated = isAuthenticated();

        if (user && authenticated) {
          // Add avatar if not present
          const userWithAvatar = {
            ...user,
            avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`,
            lastLogin: user.lastLogin || new Date(),
            preferences: user.preferences || {
              theme: 'system',
              notifications: true,
            },
          };

          setAuthState({
            user: userWithAvatar,
            isLoading: false,
            error: null,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          isLoading: false,
          error: 'Failed to initialize auth',
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const updateUserPreferences = (preferences: Partial<User['preferences']>) => {
    if (authState.user) {
      const updatedUser = {
        ...authState.user,
        preferences: {
          ...authState.user.preferences!,
          ...preferences,
        },
      };
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    }
  };

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    isAuthenticated: authState.isAuthenticated,
    updateUserPreferences,
  };
};

export default useAuth; 
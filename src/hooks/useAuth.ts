import { useState, useEffect } from 'react';
import { getUser, isAuthenticated } from '@/services/auth';
import { User } from '@/types/user';

type UIUser = User & {
  avatar?: string;
  lastLogin?: Date;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
}

interface AuthState {
  user: UIUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
    isAuthenticated: false,
  });

  // Initialize auth state from secure storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (!token || !storedUser) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        try {
          const user = JSON.parse(storedUser) as User;
          const userWithUI = {
            ...user,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstName}-${user.lastName}`,
            lastLogin: new Date(),
            preferences: {
              theme: 'system' as const,
              notifications: true,
            },
          } as UIUser;

          setAuthState({
            user: userWithUI,
            isLoading: false,
            error: null,
            isAuthenticated: true,
          });
        } catch (parseError) {
          console.error('Failed to parse stored user:', parseError);
          // Clear invalid data
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setAuthState({
            user: null,
            isLoading: false,
            error: 'Invalid session data',
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
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

  const updateUserPreferences = (preferences: Partial<UIUser['preferences']>) => {
    if (!authState.user) return;

    try {
      const updatedUser = {
        ...authState.user,
        preferences: {
          ...authState.user.preferences!,
          ...preferences,
        },
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to logout',
      }));
    }
  };

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    isAuthenticated: authState.isAuthenticated,
    updateUserPreferences,
    logout,
  };
};

export type { UIUser as User };
export default useAuth; 
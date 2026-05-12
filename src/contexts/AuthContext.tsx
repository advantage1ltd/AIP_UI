/**
 * Authentication provider: login, 2FA, logout, and session user hydration via `/Auth/me`.
 * Persists tokens and user through sessionStore; axios interceptors in config/api.ts attach the bearer token.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import { User } from '@/types/user';
import { api } from '@/config/api';
import { sessionStore } from '@/state/sessionStore';
import { ApiResponse } from '@/types/api';
import type { BackendApiResponse } from '@/types/backend-api';
import { getApiData, getApiErrors, getApiMessage, getApiSuccess } from '@/types/backend-api';
import { mapRawApiUserToUser } from '@/services/userService';
import { logger } from '@/utils/logger';

type LoginResponsePayload = {
	AccessToken?: string;
	RefreshToken?: string;
	ExpiresAt?: string;
	User?: User;
	accessToken?: string;
	refreshToken?: string;
	expiresAt?: string;
	user?: User;
	RequiresTwoFactor?: boolean;
	TwoFactorToken?: string;
	TwoFactorExpiresAt?: string;
	TwoFactorDestination?: string;
	Success?: boolean;
	Message?: string;
}

export type TwoFactorChallenge = {
	requiresTwoFactor: true;
	twoFactorToken: string;
	twoFactorExpiresAt?: string;
	twoFactorDestination?: string;
};

export type LoginSuccess = {
	requiresTwoFactor: false;
	user: User;
};

export type LoginResult = LoginSuccess | TwoFactorChallenge;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  verifyTwoFactor: (twoFactorToken: string, code: string) => Promise<User>;
  resendTwoFactorCode: (twoFactorToken: string) => Promise<void>;
  logout: () => void;
  /** Re-fetch `/Auth/me` and update session user (does not clear the session on failure). */
  refreshUser: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize user from localStorage immediately to prevent login on refresh
  const [user, setUser] = useState<User | null>(() => sessionStore.getUser());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    const token = sessionStore.getToken();
    if (!token) {
      setUser(null);
      sessionStore.setUser(null);
      setIsLoading(false);
      return;
    }

    // Restore user from session storage first for immediate UI rendering
    const cachedUser = sessionStore.getUser();
    if (cachedUser) {
      setUser(cachedUser);
      setIsLoading(false);
    }

    try {
      setIsLoading(true);
      const response = await api.get<BackendApiResponse<User>>('/Auth/me');
      const apiResponse = response.data;
      const currentUser = getApiData(apiResponse);
      if (getApiSuccess(apiResponse) && currentUser) {
        const normalizedUser = mapRawApiUserToUser(currentUser);
        setUser(normalizedUser);
        sessionStore.setUser(normalizedUser);
        setError(null);
      } else {
        throw new Error(getApiMessage(apiResponse) || 'Failed to fetch user data');
      }
    } catch (err: unknown) {
      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true') {
        const isUnauthorized = isAxiosError(err) && err.response?.status === 401;
        logger.debug(
          isUnauthorized
            ? 'Failed to fetch current user - unauthorized'
            : 'Failed to fetch current user - clearing stale session',
          err
        );
      }
      sessionStore.clearAll();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const token = sessionStore.getToken();
    if (!token) return null;
    try {
      const response = await api.get<BackendApiResponse<User>>('/Auth/me');
      const apiResponse = response.data;
      const currentUser = getApiData(apiResponse);
      if (getApiSuccess(apiResponse) && currentUser) {
        const normalizedUser = mapRawApiUserToUser(currentUser);
        setUser(normalizedUser);
        sessionStore.setUser(normalizedUser);
        setError(null);
        return normalizedUser;
      }
    } catch (err: unknown) {
      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true') {
        logger.debug('[AuthContext] refreshUser: /Auth/me failed', err);
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const handleUserAssignmentsUpdate = (event: CustomEvent<User>) => {
      const updatedUser = event.detail;
      if (updatedUser && updatedUser.id === user?.id) {
        if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true') {
          logger.debug('[AuthContext] Updating user assignments from event');
        }
        setUser(updatedUser);
        sessionStore.setUser(updatedUser);
      }
    };

    window.addEventListener('user-assignments-updated', handleUserAssignmentsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('user-assignments-updated', handleUserAssignmentsUpdate as EventListener);
    };
  }, [user]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      try {
        response = await api.post<BackendApiResponse<LoginResponsePayload>>('/Auth/login', {
          email: username,
          password
        });
      } catch (axiosError: unknown) {
        if (isAxiosError(axiosError)) {
          if (!axiosError.response || axiosError.code === 'ERR_NETWORK') {
            const networkMessage = 'Unable to reach the server. Please ensure the backend is running and try again.';
            setError(networkMessage);
            throw new Error(networkMessage);
          }
          const errorData = axiosError.response?.data as BackendApiResponse<unknown> | undefined;
          const errorMessage = getApiMessage(errorData) || 'Invalid email or password';
          setError(errorMessage);
          throw new Error(errorMessage);
        }
        throw axiosError;
      }

      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true') {
        logger.debug('[AuthContext] Login response meta', {
          status: response.status,
          keys: response.data ? Object.keys(response.data) : [],
          hasSuccess: response.data ? 'Success' in response.data || 'success' in response.data : false,
          hasData: response.data ? 'Data' in response.data || 'data' in response.data : false
        });
      }

      // Backend returns ApiResponseDto<LoginResponseDto> with capital Data property
      // Handle both capital and lowercase properties for compatibility
      const apiResponse = response.data;
      const isSuccess = apiResponse?.Success ?? apiResponse?.success ?? false;
      const responseData = apiResponse?.Data ?? apiResponse?.data;
      const message = apiResponse?.Message ?? apiResponse?.message ?? 'Invalid response from server';

      if (!isSuccess || !responseData) {
        if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true') {
          logger.debug('[AuthContext] Login failed shape', {
            isSuccess,
            hasResponseData: !!responseData,
            message,
          });
        }
        throw new Error(message);
      }

      // Backend LoginResponseDto has AccessToken (capital A) and User (capital U)
      // Handle both capital and lowercase for compatibility
      const loginData = responseData;
      const accessToken = loginData?.AccessToken ?? loginData?.accessToken;
      const refreshToken = loginData?.RefreshToken ?? loginData?.refreshToken;
      const expiresAt = loginData?.ExpiresAt ?? loginData?.expiresAt;
      const rawUser = loginData?.User ?? loginData?.user;
      const requiresTwoFactor = Boolean(loginData?.RequiresTwoFactor ?? loginData?.requiresTwoFactor);
      const twoFactorToken = loginData?.TwoFactorToken ?? loginData?.twoFactorToken;
      const twoFactorExpiresAt = loginData?.TwoFactorExpiresAt ?? loginData?.twoFactorExpiresAt;
      const twoFactorDestination = loginData?.TwoFactorDestination ?? loginData?.twoFactorDestination;

      if (requiresTwoFactor) {
        if (!twoFactorToken) {
          throw new Error('Two-factor sign-in session is invalid. Please try again.');
        }
        return {
          requiresTwoFactor: true,
          twoFactorToken,
          twoFactorExpiresAt,
          twoFactorDestination
        };
      }

      if (!accessToken || !rawUser) {
        if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true') {
          logger.debug('[AuthContext] Missing token or user in login payload', {
            hasAccessToken: !!accessToken,
            hasUser: !!rawUser,
          });
        }
        throw new Error('Invalid response from server: missing token or user data');
      }

      const user = mapRawApiUserToUser(rawUser);

      sessionStore.setToken(accessToken);
      if (refreshToken) {
        sessionStore.setRefreshToken(refreshToken);
      }
      if (expiresAt) {
        sessionStore.setTokenExpiresAt(expiresAt);
      }
      setUser(user);
      sessionStore.setUser(user);
      setError(null);
      
      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true') {
        logger.debug('[AuthContext] Login successful', {
          userId: user.id,
          role: user.role
        });
      }
      
      return {
        requiresTwoFactor: false,
        user
      };
    } catch (err: unknown) {
      // If error is already an Error with a message, use it
      if (err instanceof Error && err.message && !err.message.includes('Invalid response from server')) {
        const errorMessage = err.message;
        setError(errorMessage);
        if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true') {
          logger.debug('[AuthContext] Login error', err);
        }
        throw err;
      }
      
      // Otherwise, try to extract error message from response
      const axiosError = isAxiosError(err) ? err : null;
      const errorData = axiosError?.response?.data as BackendApiResponse<unknown> | undefined;
      const errorMessage = getApiErrors(errorData)[0]
        ?? getApiMessage(errorData)
        ?? (err instanceof Error ? err.message : undefined)
        ?? 'An error occurred during login';
      
      setError(errorMessage);
      
      if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true') {
        logger.debug('[AuthContext] Login error detail', {
          message: errorMessage,
          status: isAxiosError(err) ? err.response?.status : undefined,
        });
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTwoFactor = async (twoFactorToken: string, code: string): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post<BackendApiResponse<LoginResponsePayload>>('/Auth/verify-two-factor', {
        twoFactorToken,
        code
      });

      const apiResponse = response.data;
      const loginData = apiResponse?.Data ?? apiResponse?.data;
      const accessToken = loginData?.AccessToken ?? loginData?.accessToken;
      const refreshToken = loginData?.RefreshToken ?? loginData?.refreshToken;
      const expiresAt = loginData?.ExpiresAt ?? loginData?.expiresAt;
      const rawUser = loginData?.User ?? loginData?.user;

      if (!accessToken || !rawUser) {
        throw new Error('Invalid two-factor verification response');
      }

      const user = mapRawApiUserToUser(rawUser);

      sessionStore.setToken(accessToken);
      if (refreshToken) {
        sessionStore.setRefreshToken(refreshToken);
      }
      if (expiresAt) {
        sessionStore.setTokenExpiresAt(expiresAt);
      }
      setUser(user);
      sessionStore.setUser(user);
      return user;
    } catch (err: unknown) {
      const axiosError = isAxiosError(err) ? err : null;
      const errorData = axiosError?.response?.data as BackendApiResponse<unknown> | undefined;
      const errorMessage = getApiMessage(errorData)
        ?? (err instanceof Error ? err.message : undefined)
        ?? 'Unable to verify two-factor code';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendTwoFactorCode = async (twoFactorToken: string): Promise<void> => {
    try {
      await api.post('/Auth/resend-two-factor', { twoFactorToken });
    } catch (err: unknown) {
      const axiosError = isAxiosError(err) ? err : null;
      const errorData = axiosError?.response?.data as BackendApiResponse<unknown> | undefined;
      const errorMessage = getApiMessage(errorData)
        ?? (err instanceof Error ? err.message : undefined)
        ?? 'Unable to resend verification code';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    sessionStore.clearAll();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isLoading, error, login, verifyTwoFactor, resendTwoFactorCode, logout, refreshUser }}>
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
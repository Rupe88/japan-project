'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import type {
  User,
  AuthContextType,
  ApiResponse,
} from '@/lib/types/auth';
import { API_ROUTES } from '../api/routes';

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    const token = apiClient.getAccessToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<User>>(
        API_ROUTES.auth.profile,
        true
      );

      if (response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid profile response');
      }
    } catch (error) {
      console.error('[Auth] Check failed:', error);
      apiClient.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial auth check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Register
  const register = useCallback(
    async (email: string, password: string, phoneNumber?: string) => {
      try {
        const response = await apiClient.post<
          ApiResponse<{ userId: string; message: string }>
        >(API_ROUTES.auth.register, { email, password, phoneNumber }, false);

        console.log('[Auth] Registration successful:', response);
        return response.data || { userId: '', message: '' };
      } catch (error) {
        console.error('[Auth] Registration failed:', error);
        throw error;
      }
    },
    []
  );

  // Login
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.post<
        ApiResponse<{
          user: User;
          accessToken: string;
          refreshToken: string;
        }>
      >(API_ROUTES.auth.login, { email, password }, false);

      if (response.data) {
        const { user, accessToken, refreshToken } = response.data;

        apiClient.setTokens({ accessToken, refreshToken });
        setUser(user);
        setIsAuthenticated(true);

        console.log('[Auth] Login successful');
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('[Auth] Login failed:', error);
      apiClient.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    const refreshToken = apiClient.getRefreshToken();

    try {
      // Send refresh token to backend for deletion
      if (refreshToken) {
        await apiClient.post(
          API_ROUTES.auth.logout,
          { refreshToken },
          true
        );
        console.log('[Auth] Logout successful, token deleted from DB');
      }
    } catch (error) {
      console.error('[Auth] Logout API call failed:', error);
    } finally {
      // Clear local tokens regardless of API call success
      apiClient.clearTokens();
      setUser(null);
      setIsAuthenticated(false);

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, []);

  // Verify Email
  const verifyEmail = useCallback(async (email: string, code: string) => {
    try {
      const response = await apiClient.post<
        ApiResponse<{
          accessToken: string;
          refreshToken: string;
        }>
      >(API_ROUTES.auth.verifyEmail, { email, code }, false);

      if (response.data) {
        // Auto-login after email verification
        apiClient.setTokens(response.data);
        
        // Fetch user profile
        const profileResponse = await apiClient.get<ApiResponse<User>>(
          API_ROUTES.auth.profile,
          true
        );

        if (profileResponse.data) {
          setUser(profileResponse.data);
          setIsAuthenticated(true);
        }
      }

      console.log('[Auth] Email verification successful');
      return response;
    } catch (error) {
      console.error('[Auth] Email verification failed:', error);
      throw error;
    }
  }, []);

  // Resend Verification
  const resendVerification = useCallback(async (email: string) => {
    try {
      const response = await apiClient.post<
        ApiResponse<{ message: string }>
      >(API_ROUTES.auth.resendVerification, { email }, false);

      console.log('[Auth] Verification code resent');
      return response;
    } catch (error) {
      console.error('[Auth] Resend verification failed:', error);
      throw error;
    }
  }, []);

  // Refresh Tokens
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    const refreshToken = apiClient.getRefreshToken();

    if (!refreshToken) {
      console.log('[Auth] No refresh token available');
      return false;
    }

    try {
      const response = await apiClient.post<
        ApiResponse<{
          accessToken: string;
          refreshToken: string;
        }>
      >(API_ROUTES.auth.refresh, { refreshToken }, false);

      if (response.data) {
        apiClient.setTokens(response.data);
        console.log('[Auth] Tokens refreshed successfully');
        return true;
      }

      console.error('[Auth] Invalid refresh response');
      return false;
    } catch (error) {
      console.error('[Auth] Token refresh failed:', error);
      apiClient.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    refreshTokens,
    checkAuth,
  };
}
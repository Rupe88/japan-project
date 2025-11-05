import type { AuthTokens } from '@/lib/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface ApiError {
  message: string;
  status?: number;
  [key: string]: any;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  private isRefreshing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadTokensFromStorage();
    }
  }

  private loadTokensFromStorage(): void {
    try {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    } catch (error) {
      console.error('[API] Failed to load tokens from storage:', error);
    }
  }

  setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      } catch (error) {
        console.error('[API] Failed to save tokens:', error);
      }
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.isRefreshing = false;
    this.refreshPromise = null;

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('selectedPlatform');
      } catch (error) {
        console.error('[API] Failed to clear tokens:', error);
      }
    }
  }

  private async handleRefresh(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken || this.isRefreshing) {
      return false;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        console.log('[API] Attempting to refresh token...');

        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: this.refreshToken,
          }),
        });

        if (!response.ok) {
          console.error(
            '[API] Token refresh failed with status:',
            response.status
          );
          this.clearTokens();
          return false;
        }

        const data = await response.json();

        if (data.data?.accessToken && data.data?.refreshToken) {
          this.setTokens(data.data);
          console.log('[API] Token refreshed successfully');
          return true;
        }

        console.error('[API] Invalid refresh response format');
        this.clearTokens();
        return false;
      } catch (error) {
        console.error('[API] Token refresh error:', error);
        this.clearTokens();
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit & { includeAuth?: boolean } = {}
  ): Promise<T> {
    const { includeAuth = true, ...fetchOptions } = options;
    const headers = new Headers(fetchOptions.headers || {});

    headers.set('Content-Type', 'application/json');

    if (includeAuth && this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 Unauthorized - try to refresh token
    if (
      response.status === 401 &&
      includeAuth &&
      this.refreshToken &&
      !this.isRefreshing
    ) {
      console.log('[API] Received 401, attempting token refresh...');

      const refreshed = await this.handleRefresh();

      if (refreshed && this.accessToken) {
        // Retry the request with new token
        headers.set('Authorization', `Bearer ${this.accessToken}`);
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...fetchOptions,
          headers,
        });
      } else {
        // Refresh failed, redirect to login
        console.log('[API] Refresh failed, redirecting to login');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Authentication required');
      }
    }

    // Handle other error responses
    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: `API Error: ${response.statusText}`,
          status: response.status,
        };
      }

      const error = new Error(
        errorData.message || `API Error: ${response.statusText}`
      ) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  async post<T>(endpoint: string, body?: any, includeAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      includeAuth,
    });
  }

  async get<T>(endpoint: string, includeAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      includeAuth,
    });
  }

  async put<T>(endpoint: string, body?: any, includeAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      includeAuth,
    });
  }

  async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      includeAuth,
    });
  }

  // Platform selection methods
  setSelectedPlatform(platformId: string): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('selectedPlatform', platformId);
      } catch (error) {
        console.error('[API] Failed to save selected platform:', error);
      }
    }
  }

  getSelectedPlatform(): string | null {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('selectedPlatform');
      } catch (error) {
        console.error('[API] Failed to get selected platform:', error);
        return null;
      }
    }
    return null;
  }
}

export const apiClient = new ApiClient();

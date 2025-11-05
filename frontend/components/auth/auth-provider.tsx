'use client';

import {
  createContext,
  type ReactNode,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useAuth } from '@/lib/hooks/use-auth';

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all timers helper
  const clearAllTimers = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  // Schedule token refresh
  const scheduleTokenRefresh = useCallback(() => {
    clearAllTimers();

    if (auth.isAuthenticated && auth.user) {
      console.log('[AuthProvider] Scheduling token refresh');

      // Refresh token 2 minutes before expiry (13 minutes for 15min tokens)
      refreshTimeoutRef.current = setTimeout(
        async () => {
          console.log('[AuthProvider] Executing scheduled token refresh');
          try {
            const success = await auth.refreshTokens();
            if (success) {
              console.log('[AuthProvider] Token refresh successful');
              // Schedule next refresh
              scheduleTokenRefresh();
            } else {
              console.error('[AuthProvider] Token refresh failed');
              // Clear auth state on failure
              auth.logout();
            }
          } catch (error) {
            console.error('[AuthProvider] Token refresh error:', error);
            auth.logout();
          }
        },
        13 * 60 * 1000 // 13 minutes
      );

      // Also set up a backup interval check every 5 minutes
      refreshIntervalRef.current = setInterval(
        async () => {
          if (auth.isAuthenticated) {
            console.log('[AuthProvider] Periodic token check');
            try {
              await auth.refreshTokens();
            } catch (error) {
              console.error('[AuthProvider] Periodic refresh error:', error);
            }
          }
        },
        5 * 60 * 1000 // 5 minutes
      );
    }
  }, [auth, clearAllTimers]);

  // Set up token refresh on auth state change
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      scheduleTokenRefresh();
    } else {
      clearAllTimers();
    }

    return () => {
      clearAllTimers();
    };
  }, [auth.isAuthenticated, auth.user, scheduleTokenRefresh, clearAllTimers]);

  // Handle visibility change to refresh on tab focus
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && auth.isAuthenticated) {
        console.log('[AuthProvider] Tab focused, checking token validity');
        try {
          await auth.refreshTokens();
          scheduleTokenRefresh();
        } catch (error) {
          console.error('[AuthProvider] Token check on focus failed:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [auth, scheduleTokenRefresh]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

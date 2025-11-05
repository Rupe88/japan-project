
/**
 * Auth Token Pair
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * JWT Payload Structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * User Model
 */
export interface User {
  id: string;
  email: string;
  isEmailVerified: boolean;
  phoneNumber?: string;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

/**
 * Generic API Response Wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Registration Request
 */
export interface RegisterRequest {
  email: string;
  password: string;
  phoneNumber?: string;
}

/**
 * Registration Response
 */
export interface RegisterResponse {
  userId: string;
  message: string;
}

/**
 * Login Request
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Login Response
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Verify Email Request
 */
export interface VerifyEmailRequest {
  email: string;
  code: string;
}

/**
 * Resend Verification Request
 */
export interface ResendVerificationRequest {
  email: string;
}

/**
 * Refresh Token Request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Logout Request
 */
export interface LogoutRequest {
  refreshToken?: string;
}

/**
 * Auth Context Type (for useAuth hook)
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    phoneNumber?: string
  ) => Promise<{ userId: string; message: string }>;
  logout: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<any>;
  resendVerification: (email: string) => Promise<any>;
  refreshTokens: () => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

/**
 * API Error Type
 */
export interface ApiError extends Error {
  status?: number;
  response?: {
    data?: {
      message?: string;
      error?: string;
      errors?: Record<string, string[]>;
    };
  };
}

/**
 * Type Guards
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 'status' in error;
}

export function hasApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return obj && typeof obj === 'object' && 'success' in obj;
}

/**
 * Token Statistics (for admin)
 */
export interface TokenStats {
  activeTokens: number;
  expiredTokens: number;
  tokensPerUser: Array<{
    email: string;
    tokenCount: number;
  }>;
}

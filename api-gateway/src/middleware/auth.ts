
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createErrorResponse } from '../../../shared/utils';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Public routes that don't require authentication
 */
const publicRoutes = [
  '/health',
  '/status',
  '/',
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
  '/api/auth/password-reset/request',
  '/api/auth/password-reset/verify',
  '/api/auth/validate',
  '/api/hr/jobs', // Public job listings
  '/api/hr/training/courses', // Public training courses
  '/api/hr/events', // Public events
  '/api/hr/dashboard/trending/jobs',
  '/api/hr/dashboard/trending/skills',
  '/api/hr/certifications/verify', // Public certificate verification
];

/**
 * Check if a route is public (doesn't require authentication)
 */
export function isPublicRoute(path: string): boolean {
  // Exact match
  if (publicRoutes.includes(path)) {
    return true;
  }

  // Pattern matching for routes with parameters
  return publicRoutes.some((route) => {
    // Handle wildcard routes
    if (route.endsWith('*')) {
      return path.startsWith(route.slice(0, -1));
    }
    
    // Handle routes with parameters (e.g., /api/hr/certifications/verify/:code)
    if (route.includes(':')) {
      const routePattern = route.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(path);
    }
    
    // Handle routes that might have query parameters or trailing slashes
    return path === route || path.startsWith(route + '/') || path.startsWith(route + '?');
  });
}

/**
 * Check if a route is a GET request to a potentially public resource
 */
function isPublicGetRoute(method: string, path: string): boolean {
  if (method !== 'GET') return false;

  const publicGetPatterns = [
    '/api/hr/jobs',
    '/api/hr/training/courses',
    '/api/hr/events',
    '/api/hr/dashboard/trending',
    '/api/hr/certifications/verify',
  ];

  return publicGetPatterns.some(pattern => path.startsWith(pattern));
}

/**
 * JWT Authentication Middleware for API Gateway
 */
export function gatewayAuth(req: Request, res: Response, next: NextFunction) {
  // Skip authentication for public routes
  if (isPublicRoute(req.path)) {
    console.log(`✅ Public route: ${req.method} ${req.path}`);
    return next();
  }

  // Skip authentication for public GET routes
  if (isPublicGetRoute(req.method, req.path)) {
    console.log(`✅ Public GET route: ${req.method} ${req.path}`);
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    console.log(`🔒 Auth required for: ${req.method} ${req.path}`);
    return res.status(401).json(createErrorResponse('Access token required'));
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('❌ JWT_SECRET not configured in API Gateway');
    return res
      .status(500)
      .json(createErrorResponse('Server configuration error'));
  }

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err) {
      console.log(`❌ Invalid token for: ${req.method} ${req.path}`);
      return res
        .status(403)
        .json(createErrorResponse('Invalid or expired token'));
    }

    // Add user info to request for forwarding to services
    req.user = decoded;

    // Add user info to headers for service communication
    req.headers['x-user-id'] = decoded.userId;
    req.headers['x-user-email'] = decoded.email;

    console.log(`✅ Authenticated user: ${decoded.email} for ${req.method} ${req.path}`);
    next();
  });
}

/**
 * Optional Authentication Middleware
 * Adds user to request if token is valid, but doesn't require it
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return next();
  }

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (!err) {
      req.user = decoded;
      req.headers['x-user-id'] = decoded.userId;
      req.headers['x-user-email'] = decoded.email;
    }
    next();
  });
}
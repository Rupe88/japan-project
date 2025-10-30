
import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { servicesConfig } from '../config/services';

const router = Router();

function createServiceProxy(
  targetUrl: string,
  pathRewrite?: Record<string, string>
): any {
  const options = {
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: pathRewrite || {},
    timeout: 30000,
    proxyTimeout: 30000,
    onError: (err: any, req: any, res: any) => {
      console.error(`Proxy error: ${err.message}`);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: 'Service unavailable. Please try again later.',
        });
      }
    },
    onProxyReq: (proxyReq: any, req: any) => {
      console.log(
        `Proxying request: ${req.method} ${req.originalUrl} to ${targetUrl}`
      );

      // Forward user information if available
      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.userId);
        proxyReq.setHeader('x-user-email', req.user.email);
      }

      // Ensure content type for POST/PUT requests
      if (
        req.body &&
        (req.method === 'POST' ||
          req.method === 'PUT' ||
          req.method === 'PATCH')
      ) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes: any, req: any) => {
      console.log(
        `Received response from ${targetUrl}: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`
      );
    },
  };

  return createProxyMiddleware(options);
}

// Auth Service Routes
router.use(
  '/api/auth',
  createServiceProxy(servicesConfig.auth.url, {
    '^/api/auth': '/auth',
  })
);

// User Service Routes
router.use(
  '/api/users',
  createServiceProxy(servicesConfig.users.url, {
    '^/api/users': '/users',
  })
);

// HR Service Routes
router.use(
  '/api/hr',
  createServiceProxy(servicesConfig.hr.url, {
    '^/api/hr': '/hr',
  })
);

export default router;
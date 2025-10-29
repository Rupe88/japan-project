import { Router } from 'express';
import * as authController from './auth-controller';
import { authenticateToken, validateRequest } from '../../../shared/middleware';
import {
  registerSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  loginSchema,
  refreshTokenSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from './validation';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/verify-email', validateRequest(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-verification', validateRequest(resendVerificationSchema), authController.resendVerification);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh', validateRequest(refreshTokenSchema), authController.refreshTokens);
router.post('/logout', validateRequest(refreshTokenSchema), authController.logout);
router.post('/validate', authController.validateToken);
router.post('/password-reset/request', validateRequest(requestPasswordResetSchema), authController.requestPasswordReset);
router.post('/password-reset/verify', validateRequest(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.delete('/profile', authenticateToken, authController.deleteAccount);

export default router;
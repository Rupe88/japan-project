import { Router } from 'express';
import * as userController from './user-controller';
import { authenticateToken, validateRequest } from '../../../shared/middleware';
import { updateProfileSchema, platformAccessSchema } from './validation';

const router = Router();

// All routes require authentication
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, validateRequest(updateProfileSchema), userController.updateProfile);
router.delete('/profile', authenticateToken, userController.deleteProfile);

// Platform access routes
router.post('/platforms', authenticateToken, validateRequest(platformAccessSchema), userController.addPlatformAccess);
router.get('/platforms', authenticateToken, userController.getPlatformAccess);
router.put('/platforms/:platform', authenticateToken, userController.updatePlatformAccess);
router.delete('/platforms/:platform', authenticateToken, userController.deletePlatformAccess);

export default router;
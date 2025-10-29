import { asyncHandler } from '../../../shared/middleware';
import { Request, Response } from 'express';
import {
  createErrorResponse,
  createSuccessResponse,
} from '../../../shared/utils';
import { UserService } from './user-service';

const userService = new UserService();

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(createErrorResponse('User not authenticated'));
  }

  const profile = await userService.getProfile(userId);
  res.status(200).json(createSuccessResponse(profile, 'Profile retrieved'));
});

export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const profile = await userService.updateProfile(userId, req.body);
    res.status(200).json(createSuccessResponse(profile, 'Profile updated'));
  }
);

export const deleteProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    await userService.deleteProfile(userId);
    res.status(200).json(createSuccessResponse(null, 'Profile deleted'));
  }
);

export const addPlatformAccess = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const platformAccess = await userService.addPlatformAccess(
      userId,
      req.body
    );
    res
      .status(201)
      .json(createSuccessResponse(platformAccess, 'Platform access added'));
  }
);

export const getPlatformAccess = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const platforms = await userService.getPlatformAccess(userId);
    res
      .status(200)
      .json(createSuccessResponse(platforms, 'Platform access retrieved'));
  }
);

export const updatePlatformAccess = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { platform } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const updated = await userService.updatePlatformAccess(
      userId,
      platform,
      req.body
    );
    res
      .status(200)
      .json(createSuccessResponse(updated, 'Platform access updated'));
  }
);

export const deletePlatformAccess = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { platform } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    await userService.deletePlatformAccess(userId, platform);
    res
      .status(200)
      .json(createSuccessResponse(null, 'Platform access deleted'));
  }
);

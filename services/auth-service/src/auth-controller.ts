import { AuthService } from './auth-service';
import { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/middleware';
import {
  createErrorResponse,
  createSuccessResponse,
} from '../../../shared/utils';

const authService = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, phoneNumber } = req.body;
  const result = await authService.register(email, password, phoneNumber);

  res.status(201).json(createSuccessResponse(result, result.message));
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const tokens = await authService.verifyEmail(email, code);

  res
    .status(200)
    .json(createSuccessResponse(tokens, 'Email verified successfully'));
});

export const resendVerification = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.resendVerificationEmail(email);

    res.status(200).json(createSuccessResponse(result, result.message));
  }
);

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const tokens = await authService.login(email, password);

  res.status(200).json(createSuccessResponse(tokens, 'Login successful'));
});

export const refreshTokens = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);

    res.status(200).json(createSuccessResponse(tokens, 'Tokens refreshed'));
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);

  res.status(200).json(createSuccessResponse(null, 'Logout successful'));
});

export const validateToken = asyncHandler(
  async (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json(createErrorResponse('No token provided'));
    }

    const payload = await authService.validateToken(token);
    res.status(200).json(createSuccessResponse(payload, 'Token is valid'));
  }
);

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(createErrorResponse('Unauthorized'));
  }

  const user = await authService.getUserById(userId);
  res.status(200).json(createSuccessResponse(user, 'Profile retrieved'));
});

export const deleteAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json(createErrorResponse('Unauthorized'));
    }

    await authService.deleteUser(userId);
    res.status(200).json(createSuccessResponse(null, 'Account deleted'));
  }
);

export const requestPasswordReset = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);

    res.status(200).json(createSuccessResponse(result, result.message));
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body;
    const result = await authService.resetPassword(email, code, newPassword);

    res.status(200).json(createSuccessResponse(result, result.message));
  }
);

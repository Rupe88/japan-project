import { AuthTokens, JWTPayload } from '../../../shared/types';
import prisma from './database';
import { createServiceError } from '../../../shared/utils';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;
  private readonly bcryptRounds: number;
  private transporter: nodemailer.Transporter;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET!;
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

    if (!this.jwtSecret || !this.jwtRefreshSecret) {
      throw new Error('JWT secrets are not defined in environment variables');
    }

    // Initialize nodemailer
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async register(
    email: string,
    password: string,
    phoneNumber?: string
  ): Promise<{ userId: string; message: string }> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createServiceError('User already exists', 409);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, this.bcryptRounds);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        phoneNumber,
      },
    });

    // Generate and send OTP
    await this.sendVerificationEmail(user.id, email);

    return {
      userId: user.id,
      message:
        'Registration successful. Please verify your email with the OTP sent.',
    };
  }

  async verifyEmail(email: string, code: string): Promise<AuthTokens> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createServiceError('User not found', 404);
    }

    if (user.isEmailVerified) {
      throw createServiceError('Email already verified', 400);
    }

    // Find valid verification code
    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code,
        type: 'EMAIL_VERIFY',
        isUsed: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!verificationCode) {
      throw createServiceError('Invalid or expired verification code', 400);
    }

    // Mark code as used and verify email
    await prisma.$transaction([
      prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { isUsed: true },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      }),
    ]);

    // Generate tokens
    return this.generateTokens(user.id, user.email);
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createServiceError('User not found', 404);
    }

    if (user.isEmailVerified) {
      throw createServiceError('Email already verified', 400);
    }

    await this.sendVerificationEmail(user.id, email);

    return { message: 'Verification email sent successfully' };
  }

  private async sendVerificationEmail(
    userId: string,
    email: string
  ): Promise<void> {
    // Generate 6-digit OTP
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiry

    // Save verification code
    await prisma.verificationCode.create({
      data: {
        userId,
        email,
        code,
        type: 'EMAIL_VERIFY',
        expiresAt,
      },
    });

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@yourapp.com',
      to: email,
      subject: 'Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`[Auth] Verification email sent to ${email}`);
    } catch (error) {
      console.error('[Auth] Error sending email:', error);
      // Don't throw error to prevent user registration failure
      // Log the code for development
      console.log(`[Auth] Verification code for ${email}: ${code}`);
    }
  }

  async login(email: string, password: string): Promise<AuthTokens & { user: any }> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        isEmailVerified: true,
        phoneNumber: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw createServiceError('Invalid email or password', 401);
    }

    if (!user.isEmailVerified) {
      throw createServiceError('Please verify your email first', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createServiceError('Invalid email or password', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      ...tokens,
      user: userWithoutPassword,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw createServiceError('Refresh token is required', 400);
    }

    try {
      // Verify the JWT
      const decoded = jwt.verify(
        refreshToken,
        this.jwtRefreshSecret
      ) as JWTPayload;

      // Check if token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken) {
        throw createServiceError('Refresh token not found or already used', 401);
      }

      // Check if token is expired
      if (storedToken.expiresAt < new Date()) {
        // Delete expired token
        await prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
        throw createServiceError('Refresh token has expired', 401);
      }

      // Verify user still exists and is verified
      if (!storedToken.user || !storedToken.user.isEmailVerified) {
        // Delete token if user is invalid
        await prisma.refreshToken.delete({
          where: { id: storedToken.id },
        });
        throw createServiceError('User not found or not verified', 401);
      }

      // ✅ DELETE OLD REFRESH TOKEN (Critical for security)
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      console.log(`[Auth] Old refresh token deleted for user: ${storedToken.user.email}`);

      // Generate new tokens
      const tokens = await this.generateTokens(
        storedToken.user.id,
        storedToken.user.email
      );

      console.log(`[Auth] New tokens generated for user: ${storedToken.user.email}`);

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw createServiceError('Invalid refresh token', 401);
      }
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      console.log('[Auth] Logout called without refresh token');
      return; // Silently return if no token provided
    }

    try {
      // Delete the refresh token from database
      const result = await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });

      if (result.count > 0) {
        console.log('[Auth] Refresh token deleted on logout');
      } else {
        console.log('[Auth] Refresh token not found (may have been already deleted)');
      }
    } catch (error) {
      console.error('[Auth] Error during logout:', error);
      // Don't throw error - logout should always succeed on client side
    }
  }

  /**
   * ✅ NEW: Logout from all devices
   */
  async logoutAllDevices(userId: string): Promise<void> {
    const result = await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    console.log(`[Auth] Deleted ${result.count} refresh tokens for user: ${userId}`);
  }

  /**
   * ✅ NEW: Clean up expired tokens (for cron job)
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      console.log(`[Auth] Cleaned up ${result.count} expired refresh tokens`);
      return result.count;
    } catch (error) {
      console.error('[Auth] Error cleaning up expired tokens:', error);
      return 0;
    }
  }

  /**
   * ✅ NEW: Clean up expired verification codes
   */
  async cleanupExpiredVerificationCodes(): Promise<number> {
    try {
      const result = await prisma.verificationCode.deleteMany({
        where: {
          OR: [
            {
              expiresAt: {
                lt: new Date(),
              },
            },
            {
              isUsed: true,
              createdAt: {
                lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Older than 7 days
              },
            },
          ],
        },
      });

      console.log(`[Auth] Cleaned up ${result.count} expired/used verification codes`);
      return result.count;
    } catch (error) {
      console.error('[Auth] Error cleaning up verification codes:', error);
      return 0;
    }
  }

  /**
   * ✅ NEW: Get token statistics (for monitoring)
   */
  async getTokenStats(): Promise<{
    activeTokens: number;
    expiredTokens: number;
    tokensPerUser: { email: string; tokenCount: number }[];
  }> {
    const [activeTokens, expiredTokens, tokensPerUser] = await Promise.all([
      prisma.refreshToken.count({
        where: {
          expiresAt: {
            gte: new Date(),
          },
        },
      }),
      prisma.refreshToken.count({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      }),
      prisma.refreshToken.groupBy({
        by: ['userId'],
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    // Get user emails for the top users
    const userIds = tokensPerUser.map((t) => t.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u.email]));

    return {
      activeTokens,
      expiredTokens,
      tokensPerUser: tokensPerUser.map((t) => ({
        email: userMap.get(t.userId) || 'Unknown',
        tokenCount: t._count.id,
      })),
    };
  }

  async validateToken(token: string): Promise<JWTPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw createServiceError('User not found', 404);
      }

      if (!user.isEmailVerified) {
        throw createServiceError('Email not verified', 403);
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw createServiceError('Invalid token', 401);
      }
      throw error;
    }
  }

  private async generateTokens(
    userId: string,
    email: string
  ): Promise<AuthTokens> {
    const payload = { userId, email };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as StringValue,
    });

    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiresIn as StringValue,
    });

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        phoneNumber: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw createServiceError('User not found', 404);
    }

    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    // This will cascade delete refresh tokens and verification codes
    await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`[Auth] User deleted: ${userId}`);
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists (security best practice)
      return { message: 'If the email exists, a reset code has been sent' };
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        email,
        code,
        type: 'PASSWORD_RESET',
        expiresAt,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@yourapp.com',
      to: email,
      subject: 'Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>Your password reset code is:</p>
          <h1 style="color: #FF5722; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`[Auth] Password reset email sent to ${email}`);
    } catch (error) {
      console.error('[Auth] Error sending password reset email:', error);
      console.log(`[Auth] Password reset code for ${email}: ${code}`);
    }

    return { message: 'If the email exists, a reset code has been sent' };
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw createServiceError('Invalid reset code', 400);
    }

    const verificationCode = await prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code,
        type: 'PASSWORD_RESET',
        isUsed: false,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    if (!verificationCode) {
      throw createServiceError('Invalid or expired reset code', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, this.bcryptRounds);

    await prisma.$transaction([
      prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { isUsed: true },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      // ✅ Delete all refresh tokens to force re-login (security best practice)
      prisma.refreshToken.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    console.log(`[Auth] Password reset successful for user: ${email}`);

    return { message: 'Password reset successful' };
  }
}
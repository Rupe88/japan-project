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
    } catch (error) {
      console.error('Error sending email:', error);
      throw createServiceError('Failed to send verification email', 500);
    }
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await prisma.user.findUnique({
      where: { email },
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
    return this.generateTokens(user.id, user.email);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        this.jwtRefreshSecret
      ) as JWTPayload;

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw createServiceError('Invalid or expired refresh token', 401);
      }

      // Generate new tokens
      const tokens = await this.generateTokens(
        storedToken.user.id,
        storedToken.user.email
      );

      // Delete old refresh token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw createServiceError('Invalid refresh token', 401);
      }
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
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

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

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
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
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

    await this.transporter.sendMail(mailOptions);

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
      // Delete all refresh tokens to force re-login
      prisma.refreshToken.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    return { message: 'Password reset successful' };
  }
}

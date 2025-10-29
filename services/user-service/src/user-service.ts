import {
  UpdateProfileRequest,
  UserProfile,
  PlatformAccessRequest,
} from '../../../shared/types';
import prisma from './database';
import { createServiceError, sanitizeInput } from '../../../shared/utils';

export class UserService {
  async createProfile(
    userId: string,
    profileData: Partial<UpdateProfileRequest>
  ): Promise<any> {
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw createServiceError('User profile already exists', 409);
    }

    const sanitizedData = this.sanitizeProfileData(profileData);

    const profile = await prisma.userProfile.create({
      data: {
        userId,
        ...sanitizedData,
      },
      include: {
        platformAccess: true,
      },
    });

    return profile;
  }

  async getProfile(userId: string): Promise<any> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        platformAccess: true,
      },
    });

    if (!profile) {
      throw createServiceError('User profile not found', 404);
    }

    return profile;
  }

  async updateProfile(
    userId: string,
    profileData: Partial<UpdateProfileRequest>
  ): Promise<any> {
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      return this.createProfile(userId, profileData);
    }

    const sanitizedData = this.sanitizeProfileData(profileData);

    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: sanitizedData,
      include: {
        platformAccess: true,
      },
    });

    return updatedProfile;
  }

  async deleteProfile(userId: string): Promise<void> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw createServiceError('User profile not found', 404);
    }

    await prisma.userProfile.delete({
      where: { userId },
    });
  }

  async addPlatformAccess(
    userId: string,
    platformData: PlatformAccessRequest
  ): Promise<any> {
    // Check if profile exists
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw createServiceError(
        'User profile not found. Please create profile first',
        404
      );
    }

    // Check if platform access already exists
    const existingAccess = await prisma.platformAccess.findUnique({
      where: {
        userId_platform: {
          userId,
          platform: platformData.platform,
        },
      },
    });

    if (existingAccess) {
      throw createServiceError('Platform access already exists', 409);
    }

    const platformAccess = await prisma.platformAccess.create({
      data: {
        userId,
        platform: platformData.platform,
        role: platformData.role,
      },
    });

    return platformAccess;
  }

  async getPlatformAccess(userId: string): Promise<any[]> {
    const platforms = await prisma.platformAccess.findMany({
      where: { userId },
    });

    return platforms;
  }

  async updatePlatformAccess(
    userId: string,
    platform: string,
    updateData: any
  ): Promise<any> {
    const existingAccess = await prisma.platformAccess.findUnique({
      where: {
        userId_platform: {
          userId,
          platform: platform as any,
        },
      },
    });

    if (!existingAccess) {
      throw createServiceError('Platform access not found', 404);
    }

    const updated = await prisma.platformAccess.update({
      where: {
        userId_platform: {
          userId,
          platform: platform as any,
        },
      },
      data: updateData,
    });

    return updated;
  }

  async deletePlatformAccess(userId: string, platform: string): Promise<void> {
    const existingAccess = await prisma.platformAccess.findUnique({
      where: {
        userId_platform: {
          userId,
          platform: platform as any,
        },
      },
    });

    if (!existingAccess) {
      throw createServiceError('Platform access not found', 404);
    }

    await prisma.platformAccess.delete({
      where: {
        userId_platform: {
          userId,
          platform: platform as any,
        },
      },
    });
  }

  private sanitizeProfileData(data: Partial<UpdateProfileRequest>): any {
    const sanitized: any = {};

    if (data.userType !== undefined) {
      sanitized.userType = data.userType;
    }

    if (data.firstName !== undefined) {
      sanitized.firstName = data.firstName
        ? sanitizeInput(data.firstName)
        : null;
    }

    if (data.lastName !== undefined) {
      sanitized.lastName = data.lastName ? sanitizeInput(data.lastName) : null;
    }

    if (data.bio !== undefined) {
      sanitized.bio = data.bio ? sanitizeInput(data.bio) : null;
    }

    if (data.avatarUrl !== undefined) {
      sanitized.avatarUrl = data.avatarUrl
        ? sanitizeInput(data.avatarUrl)
        : null;
    }

    if (data.country !== undefined) {
      sanitized.country = data.country;
    }

    if (data.province !== undefined) {
      sanitized.province = data.province ? sanitizeInput(data.province) : null;
    }

    if (data.district !== undefined) {
      sanitized.district = data.district ? sanitizeInput(data.district) : null;
    }

    if (data.city !== undefined) {
      sanitized.city = data.city ? sanitizeInput(data.city) : null;
    }

    if (data.addressLine !== undefined) {
      sanitized.addressLine = data.addressLine
        ? sanitizeInput(data.addressLine)
        : null;
    }

    if (data.postalCode !== undefined) {
      sanitized.postalCode = data.postalCode
        ? sanitizeInput(data.postalCode)
        : null;
    }

    if (data.preferences !== undefined) {
      sanitized.preferences = data.preferences;
    }

    return sanitized;
  }
}

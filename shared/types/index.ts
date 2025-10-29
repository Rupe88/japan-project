export interface User {
  id: string;
  email: string;
  isEmailVerified: boolean;
  phoneNumber?: string;
  isPhoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  userType:
    | 'INDIVIDUAL'
    | 'GOVERNMENT_ORG'
    | 'NONPROFIT_ORG'
    | 'PRODUCTION_COMPANY'
    | 'SERVICE_COMPANY'
    | 'TRADING_COMPANY';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  country: string;
  province?: string | null;
  district?: string | null;
  city?: string | null;
  addressLine?: string | null;
  postalCode?: string | null;
  preferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileRequest {
  userType?:
    | 'INDIVIDUAL'
    | 'GOVERNMENT_ORG'
    | 'NONPROFIT_ORG'
    | 'PRODUCTION_COMPANY'
    | 'SERVICE_COMPANY'
    | 'TRADING_COMPANY';
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  country?: string;
  province?: string | null;
  district?: string | null;
  city?: string | null;
  addressLine?: string | null;
  postalCode?: string | null;
  preferences?: Record<string, any>;
}

export interface PlatformAccess {
  id: string;
  userId: string;
  platform:
    | 'PRODUCT_MARKETPLACE'
    | 'SERVICE_MARKETPLACE'
    | 'TENDER_SYSTEM'
    | 'HR_PLATFORM';
  role:
    | 'BUYER'
    | 'SELLER'
    | 'PROVIDER'
    | 'CLIENT'
    | 'BIDDER'
    | 'ISSUER'
    | 'APPLICANT'
    | 'EMPLOYER'
    | 'BOTH';
  enabled: boolean;
  kycCompleted: boolean;
  kycSubmittedAt?: Date;
  totalListings: number;
  totalPurchases: number;
  totalApplications: number;
  totalBids: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PlatformAccessRequest {
  platform:
    | 'PRODUCT_MARKETPLACE'
    | 'SERVICE_MARKETPLACE'
    | 'TENDER_SYSTEM'
    | 'HR_PLATFORM';
  role:
    | 'BUYER'
    | 'SELLER'
    | 'PROVIDER'
    | 'CLIENT'
    | 'BIDDER'
    | 'ISSUER'
    | 'APPLICANT'
    | 'EMPLOYER'
    | 'BOTH';
}
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export class ServiceError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'ServiceError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function logError(error: Error, context?: Record<string, any>): void {
  console.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
}


//individual kyc types
// HR Types
export interface IndividualKYC {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: Date;
  idType: string;
  idNumber?: string;
  idFrontImage: string;
  idBackImage: string;
  panCardFront?: string;
  panCardBack?: string;
  country: string;
  province: string;
  district: string;
  city: string;
  addressLine?: string;
  postalCode?: string;
  currentLocation?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMITTED';
  submittedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IndustrialKYC {
  id: string;
  userId: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  registrationNumber?: string;
  yearsInBusiness?: number;
  registrationCertificate: string;
  taxClearanceCertificate: string;
  panCertificate: string;
  vatCertificate?: string;
  country: string;
  province: string;
  district: string;
  city: string;
  addressLine?: string;
  postalCode?: string;
  currentLocation?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESUBMITTED';
  submittedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobPosting {
  id: string;
  employerId: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary?: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicantId: string;
  coverLetter?: string;
  resumeUrl: string;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}
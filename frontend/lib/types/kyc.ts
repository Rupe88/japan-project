export enum KYCStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RESUBMITTED = "RESUBMITTED",
}

export interface IndividualKYC {
  id?: string
  userId?: string

  // Basic Info
  fullName: string
  gender: string
  dateOfBirth: string
  nationalId: string

  // Address
  country: string
  province: string
  district: string
  municipality: string
  ward: string
  city?: string

  // Contact
  email: string
  phone: string

  // Media
  profilePhotoUrl?: string

  // Education & Skills
  highestQualification: string
  fieldOfStudy: string
  languagesKnown: string[]
  technicalSkills: string[]
  softSkills: string[]

  // Employment
  employmentStatus: string
  expectedSalaryMin?: number
  expectedSalaryMax?: number

  // Career
  careerGoals?: string
  preferredIndustry?: string
}

export interface IndustrialKYC {
  id?: string
  userId?: string

  // Company Info
  companyName: string
  companyEmail: string
  companyPhone: string
  registrationNumber: string
  yearsInBusiness: number
  companySize: string
  industrySector: string

  // Address
  country: string
  province: string
  district: string
  municipality: string
  ward: string
  street?: string

  // Contact Person
  contactPersonName?: string
  contactPersonDesignation?: string
}

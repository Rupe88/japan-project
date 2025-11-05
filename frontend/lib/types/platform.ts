export enum PlatformType {
  HR = "HR_PLATFORM",
  TENDER = "TENDER_SYSTEM",
  MARKETPLACE = "PRODUCT_MARKETPLACE",
  ECOMMERCE = "SERVICE_MARKETPLACE",
}

export enum UserType {
  INDIVIDUAL = "INDIVIDUAL",
  INDUSTRIAL = "GOVERNMENT_ORG",
  NONPROFIT = "NONPROFIT_ORG",
  PRODUCTION = "PRODUCTION_COMPANY",
  SERVICE = "SERVICE_COMPANY",
  TRADING = "TRADING_COMPANY",
}


export interface Platform {
  id: PlatformType
  name: string
  description: string
  icon: string
  color: "cyan" | "pink" | "purple" | "orange"
  gradient: string
  userTypes: UserType[]
  features: string[]
}
export interface PlatformAccessResponse {
  id: string
  userId: string
  platform: PlatformType
  kycCompleted: boolean
  kycSubmittedAt?: string
  enabled: boolean
}

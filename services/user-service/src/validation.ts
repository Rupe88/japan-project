import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  userType: Joi.string()
    .valid(
      'INDIVIDUAL',
      'GOVERNMENT_ORG',
      'NONPROFIT_ORG',
      'PRODUCTION_COMPANY',
      'SERVICE_COMPANY',
      'TRADING_COMPANY'
    )
    .optional(),
  firstName: Joi.string().min(1).max(50).optional().allow(''),
  lastName: Joi.string().min(1).max(50).optional().allow(''),
  bio: Joi.string().max(500).optional().allow(''),
  avatarUrl: Joi.string().uri().optional().allow(''),
  country: Joi.string().optional(),
  province: Joi.string().optional().allow(''),
  district: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  addressLine: Joi.string().optional().allow(''),
  postalCode: Joi.string().optional().allow(''),
  preferences: Joi.object().optional(),
});

export const platformAccessSchema = Joi.object({
  platform: Joi.string()
    .valid(
      'PRODUCT_MARKETPLACE',
      'SERVICE_MARKETPLACE',
      'TENDER_SYSTEM',
      'HR_PLATFORM'
    )
    .required()
    .messages({
      'any.required': 'Platform is required',
      'any.only': 'Invalid platform type',
    }),
  role: Joi.string()
    .valid(
      'BUYER',
      'SELLER',
      'PROVIDER',
      'CLIENT',
      'BIDDER',
      'ISSUER',
      'APPLICANT',
      'EMPLOYER',
      'BOTH'
    )
    .required()
    .messages({
      'any.required': 'Role is required',
      'any.only': 'Invalid role type',
    }),
});

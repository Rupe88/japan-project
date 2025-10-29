
import Joi from 'joi';


export const individualKYCSchema = Joi.object({
  fullName: Joi.string().required(),
  gender: Joi.string().required(),
  pronouns: Joi.string().optional().allow(''),
  dateOfBirth: Joi.date().required(),
  nationalId: Joi.string().required(),
  passportNumber: Joi.string().optional().allow(''),
  
  // Address
  country: Joi.string().default('Nepal'),
  province: Joi.string().required(),
  district: Joi.string().required(),
  municipality: Joi.string().required(),
  ward: Joi.string().required(),
  street: Joi.string().optional().allow(''),
  
  // Contact
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  emergencyContact: Joi.string().optional().allow(''),
  
  // Education
  highestQualification: Joi.string().required(),
  fieldOfStudy: Joi.string().required(),
  schoolUniversity: Joi.string().optional().allow(''),
  languagesKnown: Joi.array().items(Joi.string()).optional(),
  certifications: Joi.array().optional(),
  
  // Professional
  employmentStatus: Joi.string().required(),
  experience: Joi.array().optional(),
  expectedSalaryMin: Joi.number().optional().allow(null),
  expectedSalaryMax: Joi.number().optional().allow(null),
  willingRelocate: Joi.boolean().optional(),
  
  // Skills & Interests
  technicalSkills: Joi.object().optional(),
  softSkills: Joi.object().optional(),
  physicalSkills: Joi.object().optional(),
  interestDomains: Joi.array().optional(),
  workStylePrefs: Joi.object().optional(),
  
  // Psychometric
  psychometricData: Joi.object().optional(),
  motivationTriggers: Joi.object().optional(),
  learningPrefs: Joi.object().optional(),
  
  // Growth
  trainingWillingness: Joi.number().min(1).max(5).optional(),
  availableHoursWeek: Joi.number().optional(),
  careerGoals: Joi.string().optional().allow(''),
  areasImprovement: Joi.array().optional(),
  digitalLiteracy: Joi.string().optional().allow(''),
  preferredIndustry: Joi.string().optional().allow(''),
  
  // Social Proof
  references: Joi.array().optional(),
  portfolioUrls: Joi.array().optional(),
  videoIntroUrl: Joi.string().optional().allow(''),
  socialMediaUrls: Joi.object().optional(),
});

export const industrialKYCSchema = Joi.object({
  companyName: Joi.string().required(),
  companyEmail: Joi.string().email().required(),
  companyPhone: Joi.string().required(),
  registrationNumber: Joi.string().optional().allow(''),
  yearsInBusiness: Joi.number().integer().min(0).optional().allow(null),
  companySize: Joi.string().optional().allow(''),
  industrySector: Joi.string().optional().allow(''),
  
  // Address
  country: Joi.string().default('Nepal'),
  province: Joi.string().required(),
  district: Joi.string().required(),
  municipality: Joi.string().required(),
  ward: Joi.string().required(),
  street: Joi.string().optional().allow(''),
  
  // Contact Person
  contactPersonName: Joi.string().optional().allow(''),
  contactPersonDesignation: Joi.string().optional().allow(''),
  contactPersonPhone: Joi.string().optional().allow(''),
});

// ========== TRAINING Validation ==========

export const trainingCourseSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  duration: Joi.number().required(),
  mode: Joi.string().valid('PHYSICAL', 'ONLINE', 'HYBRID').required(),
  price: Joi.number().required(),
  isFree: Joi.boolean().optional(),
  syllabus: Joi.array().optional(),
  prerequisites: Joi.array().optional(),
  learningOutcomes: Joi.array().optional(),
  startDate: Joi.date().optional().allow(null),
  endDate: Joi.date().optional().allow(null),
  seats: Joi.number().optional().allow(null),
});

export const trainingProgressSchema = Joi.object({
  progress: Joi.number().min(0).max(100).optional(),
  status: Joi.string().valid('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED').optional(),
  practiceHours: Joi.number().optional(),
});

export const trainingRequestSchema = Joi.object({
  requestedDomain: Joi.string().required(),
  description: Joi.string().required(),
});

// ========== EVENT Validation ==========

export const eventSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().valid('WEBINAR', 'SEMINAR', 'WORKSHOP', 'VIRTUAL_CONFERENCE').required(),
  mode: Joi.string().valid('PHYSICAL', 'ONLINE', 'HYBRID').required(),
  isFree: Joi.boolean().optional(),
  price: Joi.number().optional().allow(null),
  eventDate: Joi.date().required(),
  duration: Joi.number().required(),
  meetingLink: Joi.string().optional().allow(''),
  venue: Joi.string().optional().allow(''),
  maxAttendees: Joi.number().optional().allow(null),
});

// ========== EXAM Validation ==========

export const examSchema = Joi.object({
  courseId: Joi.string().optional().allow(null),
  title: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  mode: Joi.string().valid('PHYSICAL', 'ONLINE', 'HYBRID').required(),
  duration: Joi.number().required(),
  passingScore: Joi.number().required(),
  totalMarks: Joi.number().required(),
  examFee: Joi.number().required(),
});

export const examBookingSchema = Joi.object({
  examDate: Joi.date().required(),
  interviewDate: Joi.date().optional().allow(null),
});

export const examResultSchema = Joi.object({
  score: Joi.number().required(),
  passingScore: Joi.number().required(),
  status: Joi.string().valid('PASSED', 'FAILED').optional(),
});

// ========== JOB Validation ==========

export const jobPostingSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  requirements: Joi.string().required(),
  responsibilities: Joi.string().optional().allow(''),
  jobType: Joi.string().valid(
    'INTERNSHIP',
    'PART_TIME',
    'HOURLY_PAY',
    'DAILY_PAY',
    'FULL_TIME_1YEAR',
    'FULL_TIME_2YEAR',
    'FULL_TIME_2YEAR_PLUS'
  ).required(),
  
  // Location
  country: Joi.string().default('Nepal'),
  province: Joi.string().required(),
  district: Joi.string().required(),
  city: Joi.string().required(),
  isRemote: Joi.boolean().optional(),
  
  // Compensation
  salaryMin: Joi.number().optional().allow(null),
  salaryMax: Joi.number().optional().allow(null),
  salaryType: Joi.string().valid('MONTHLY', 'HOURLY', 'DAILY').optional().allow(''),
  contractDuration: Joi.number().optional().allow(null),
  
  // Requirements
  requiredSkills: Joi.array().items(Joi.string()).required(),
  experienceYears: Joi.number().optional().allow(null),
  educationLevel: Joi.string().optional().allow(''),
  
  // Vacancies
  totalPositions: Joi.number().min(1).default(1),
  expiresAt: Joi.date().optional().allow(null),
});

export const jobApplicationSchema = Joi.object({
  coverLetter: Joi.string().optional().allow(''),
  portfolioUrl: Joi.string().optional().allow(''),
});

export const applicationStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'REVIEWED', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED').required(),
  interviewDate: Joi.date().optional().allow(null),
  interviewNotes: Joi.string().optional().allow(''),
});

// ========== EMPLOYMENT Validation ==========

export const employmentStatusSchema = Joi.object({
  employmentStatus: Joi.string().valid(
    'INTERNSHIP',
    'PART_TIME',
    'HOURLY_PAY',
    'PROBATION',
    'FULLY_EMPLOYED',
    'LOOKING_CHANGE',
    'LOOKING_NEW',
    'PARTNERSHIP_SEEKING',
    'PARTNERSHIP_AND_JOB'
  ).optional(),
  endDate: Joi.date().optional().allow(null),
  isCurrent: Joi.boolean().optional(),
  reasonLeaving: Joi.string().optional().allow(''),
});

// ========== COIN Validation ==========

export const coinTransferSchema = Joi.object({
  toUserId: Joi.string().required(),
  amount: Joi.number().min(1).required(),
  description: Joi.string().required(),
});
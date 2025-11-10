
import { Router } from 'express';
import * as hrController from './hr-controller';
import { authenticateToken, validateRequest } from '../../../shared/middleware';
import {
  individualKYCSchema,
  industrialKYCSchema,
  trainingCourseSchema,
  trainingProgressSchema,
  trainingRequestSchema,
  eventSchema,
  examSchema,
  examBookingSchema,
  examResultSchema,
  jobPostingSchema,
  jobApplicationSchema,
  applicationStatusSchema,
  employmentStatusSchema,
  coinTransferSchema,
} from './validation';
import {
  uploadIndividualKYC,
  uploadIndustrialKYC,
  uploadTrainingMaterials,
  uploadPracticeMedia,
  uploadExamMedia,
  uploadJobApplication,
  uploadOrientation,
} from './middleware/upload';

const router = Router();


router.post(
  '/kyc/individual',
  authenticateToken,
  uploadIndividualKYC,
  validateRequest(individualKYCSchema),
  hrController.submitIndividualKYC
);

router.post(
  '/kyc/industrial',
  authenticateToken,
  uploadIndustrialKYC,
  validateRequest(industrialKYCSchema),
  hrController.submitIndustrialKYC
);

router.get('/kyc/status', authenticateToken, hrController.getKYCStatus);

router.get(
  '/kyc/individual/details',
  authenticateToken,
  hrController.getIndividualKYCDetails
);


// Skill Hunt Section
router.post(
  '/training/courses',
  authenticateToken,
  uploadTrainingMaterials,
  validateRequest(trainingCourseSchema),
  hrController.createTrainingCourse
);

router.get(
  '/training/courses',
  hrController.getTrainingCourses // Public - browse training
);

router.post(
  '/training/courses/:courseId/enroll',
  authenticateToken,
  hrController.enrollInTraining
);

router.put(
  '/training/enrollments/:enrollmentId/progress',
  authenticateToken,
  validateRequest(trainingProgressSchema),
  hrController.updateTrainingProgress
);

router.post(
  '/training/request',
  authenticateToken,
  validateRequest(trainingRequestSchema),
  hrController.requestTraining
);

// ========== EVENT ROUTES ==========

router.post(
  '/events',
  authenticateToken,
  validateRequest(eventSchema),
  hrController.createEvent
);

router.get(
  '/events',
  hrController.getEvents // Public - browse events
);

router.post(
  '/events/:eventId/register',
  authenticateToken,
  hrController.registerForEvent
);

// ========== EXAM & CERTIFICATION ROUTES ==========

router.post(
  '/exams',
  authenticateToken,
  validateRequest(examSchema),
  hrController.createExam
);

router.post(
  '/exams/:examId/book',
  authenticateToken,
  validateRequest(examBookingSchema),
  hrController.bookExam
);

router.put(
  '/exams/bookings/:bookingId/result',
  authenticateToken,
  validateRequest(examResultSchema),
  hrController.updateExamResult
);

router.post(
  '/exams/bookings/:bookingId/retotaling',
  authenticateToken,
  hrController.requestRetotaling
);

router.get(
  '/certifications',
  authenticateToken,
  hrController.getCertifications
);

router.get(
  '/certifications/verify/:verificationCode',
  hrController.verifyCertification // Public - verify certificates
);

// ========== JOB HUNTING ROUTES ==========

// Job Hunt Section
router.post(
  '/jobs',
  authenticateToken,
  validateRequest(jobPostingSchema),
  hrController.createJobPosting
);

router.get(
  '/jobs',
  hrController.getJobPostings // Public - job radar/hunting
);

router.post(
  '/jobs/:jobId/apply',
  authenticateToken,
  uploadJobApplication,
  validateRequest(jobApplicationSchema),
  hrController.applyForJob
);

router.get(
  '/jobs/applications',
  authenticateToken,
  hrController.getJobApplications
);

router.put(
  '/jobs/applications/:applicationId/status',
  authenticateToken,
  validateRequest(applicationStatusSchema),
  hrController.updateApplicationStatus
);

// ========== ORIENTATION ROUTES ==========

router.get('/orientations', authenticateToken, hrController.getOrientations);

router.post(
  '/orientations/:orientationId/complete',
  authenticateToken,
  uploadOrientation,
  hrController.completeOrientation
);

// ========== EMPLOYMENT ROUTES ==========

router.get(
  '/employment/history',
  authenticateToken,
  hrController.getEmploymentHistory
);

router.put(
  '/employment/history/:historyId',
  authenticateToken,
  validateRequest(employmentStatusSchema),
  hrController.updateEmploymentStatus
);

// ========== PLATFORM COIN ROUTES ==========

router.get('/coins/balance', authenticateToken, hrController.getCoinBalance);

router.post(
  '/coins/transfer',
  authenticateToken,
  validateRequest(coinTransferSchema),
  hrController.transferCoins
);


// Talent Radar (for companies)
router.get(
  '/dashboard/talent-radar',
  authenticateToken,
  hrController.getTalentRadar
);

// Trending Data (for analysis)
router.get(
  '/dashboard/trending/jobs',
  hrController.getTrendingJobs // Public - see market trends
);

router.get(
  '/dashboard/trending/skills',
  hrController.getTrendingSkills // Public - see skill demand
);

// ========== SUPPORT ROUTES ==========
// These would integrate with a separate support/chat service
// Placeholder routes for documentation

router.post('/support/ticket', authenticateToken, (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Support ticketing system to be implemented',
  });
});

router.get('/support/chatbot', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'AI chatbot integration to be implemented',
  });
});

export default router;

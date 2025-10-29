import { asyncHandler } from '../../../shared/middleware';
import { Request, Response } from 'express';
import {
  createErrorResponse,
  createSuccessResponse,
} from '../../../shared/utils';
import { HRService } from './hr-service';
import { getFileUrls, deleteUploadedFiles } from './middleware/upload';

const hrService = new HRService();


export const submitIndividualKYC = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      if (req.files) deleteUploadedFiles(req.files);
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    try {
      const kyc = await hrService.submitIndividualKYC(
        userId,
        req.body,
        req.files
      );
      res
        .status(201)
        .json(
          createSuccessResponse(kyc, 'Individual KYC submitted successfully')
        );
    } catch (error: any) {
      if (req.files) deleteUploadedFiles(req.files);
      throw error;
    }
  }
);

export const submitIndustrialKYC = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      if (req.files) deleteUploadedFiles(req.files);
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    try {
      const kyc = await hrService.submitIndustrialKYC(
        userId,
        req.body,
        req.files
      );
      res
        .status(201)
        .json(
          createSuccessResponse(kyc, 'Industrial KYC submitted successfully')
        );
    } catch (error: any) {
      if (req.files) deleteUploadedFiles(req.files);
      throw error;
    }
  }
);

export const getKYCStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const status = await hrService.getKYCStatus(userId);
    res.status(200).json(createSuccessResponse(status, 'KYC status retrieved'));
  }
);

export const getIndividualKYCDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const kyc = await hrService.getIndividualKYCById(userId);
    res.status(200).json(createSuccessResponse(kyc, 'KYC details retrieved'));
  }
);

// ========== TRAINING Controllers ==========

export const createTrainingCourse = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      if (req.files) deleteUploadedFiles(req.files);
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    try {
      const course = await hrService.createTrainingCourse(
        userId,
        req.body,
        req.files
      );
      res
        .status(201)
        .json(createSuccessResponse(course, 'Training course created'));
    } catch (error: any) {
      if (req.files) deleteUploadedFiles(req.files);
      throw error;
    }
  }
);

export const getTrainingCourses = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      category: req.query.category as string,
      mode: req.query.mode as string,
      isFree: req.query.isFree === 'true',
      isActive: req.query.isActive !== 'false',
      limit: parseInt(req.query.limit as string) || 20,
      offset: parseInt(req.query.offset as string) || 0,
    };

    const result = await hrService.getTrainingCourses(filters);
    res
      .status(200)
      .json(createSuccessResponse(result, 'Training courses retrieved'));
  }
);

export const enrollInTraining = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { courseId } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const enrollment = await hrService.enrollInTraining(userId, courseId);
    res
      .status(201)
      .json(createSuccessResponse(enrollment, 'Enrolled successfully'));
  }
);

export const updateTrainingProgress = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { enrollmentId } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const enrollment = await hrService.updateTrainingProgress(
      enrollmentId,
      userId,
      req.body
    );
    res.status(200).json(createSuccessResponse(enrollment, 'Progress updated'));
  }
);

export const requestTraining = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const request = await hrService.requestTraining(userId, req.body);
    res
      .status(201)
      .json(createSuccessResponse(request, 'Training request submitted'));
  }
);

// ========== EVENT Controllers ==========

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(createErrorResponse('User not authenticated'));
  }

  const event = await hrService.createEvent(userId, req.body);
  res.status(201).json(createSuccessResponse(event, 'Event created'));
});

export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    type: req.query.type as string,
    isFree: req.query.isFree === 'true',
    upcoming: req.query.upcoming !== 'false',
    limit: parseInt(req.query.limit as string) || 20,
    offset: parseInt(req.query.offset as string) || 0,
  };

  const result = await hrService.getEvents(filters);
  res.status(200).json(createSuccessResponse(result, 'Events retrieved'));
});

export const registerForEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { eventId } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const registration = await hrService.registerForEvent(userId, eventId);
    res
      .status(201)
      .json(createSuccessResponse(registration, 'Registered for event'));
  }
);

// ========== EXAM Controllers ==========

export const createExam = asyncHandler(async (req: Request, res: Response) => {
  const exam = await hrService.createExam(req.body);
  res.status(201).json(createSuccessResponse(exam, 'Exam created'));
});

export const bookExam = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { examId } = req.params;
  const { examDate } = req.body;

  if (!userId) {
    return res.status(401).json(createErrorResponse('User not authenticated'));
  }

  const booking = await hrService.bookExam(userId, examId, new Date(examDate));
  res.status(201).json(createSuccessResponse(booking, 'Exam booked'));
});

export const updateExamResult = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookingId } = req.params;

    const result = await hrService.updateExamResult(bookingId, req.body);
    res.status(200).json(createSuccessResponse(result, 'Exam result updated'));
  }
);

export const requestRetotaling = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { bookingId } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const result = await hrService.requestRetotaling(bookingId, userId);
    res.status(200).json(createSuccessResponse(result, 'Retotaling requested'));
  }
);

// ========== CERTIFICATION Controllers ==========

export const getCertifications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const certifications = await hrService.getCertifications(userId);
    res
      .status(200)
      .json(createSuccessResponse(certifications, 'Certifications retrieved'));
  }
);

export const verifyCertification = asyncHandler(
  async (req: Request, res: Response) => {
    const { verificationCode } = req.params;

    const certification = await hrService.verifyCertification(verificationCode);
    res
      .status(200)
      .json(createSuccessResponse(certification, 'Certification verified'));
  }
);

// ========== JOB POSTING Controllers ==========

export const createJobPosting = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const job = await hrService.createJobPosting(userId, req.body);
    res.status(201).json(createSuccessResponse(job, 'Job posted'));
  }
);

export const getJobPostings = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      jobType: req.query.jobType as string,
      province: req.query.province as string,
      district: req.query.district as string,
      isActive: req.query.isActive !== 'false',
      isRemote: req.query.isRemote === 'true',
      salaryMin: req.query.salaryMin
        ? parseInt(req.query.salaryMin as string)
        : undefined,
      limit: parseInt(req.query.limit as string) || 20,
      offset: parseInt(req.query.offset as string) || 0,
    };

    const result = await hrService.getJobPostings(filters);
    res.status(200).json(createSuccessResponse(result, 'Jobs retrieved'));
  }
);

export const applyForJob = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { jobId } = req.params;

  if (!userId) {
    if (req.files) deleteUploadedFiles(req.files);
    return res.status(401).json(createErrorResponse('User not authenticated'));
  }

  try {
    const application = await hrService.applyForJob(
      jobId,
      userId,
      req.body,
      req.files
    );
    res
      .status(201)
      .json(createSuccessResponse(application, 'Application submitted'));
  } catch (error: any) {
    if (req.files) deleteUploadedFiles(req.files);
    throw error;
  }
});

export const getJobApplications = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const filters = {
      jobId: req.query.jobId as string,
      applicantId: (req.query.applicantId as string) || userId,
      status: req.query.status as string,
      limit: parseInt(req.query.limit as string) || 20,
      offset: parseInt(req.query.offset as string) || 0,
    };

    const result = await hrService.getJobApplications(filters);
    res
      .status(200)
      .json(createSuccessResponse(result, 'Applications retrieved'));
  }
);

export const updateApplicationStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { applicationId } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const application = await hrService.updateApplicationStatus(
      applicationId,
      userId,
      req.body
    );
    res
      .status(200)
      .json(createSuccessResponse(application, 'Application status updated'));
  }
);

// ========== ORIENTATION Controllers ==========

export const getOrientations = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const filters = {
      userId: (req.query.userId as string) || userId,
      companyId: req.query.companyId as string,
      isCompleted: req.query.isCompleted === 'true',
      limit: parseInt(req.query.limit as string) || 20,
      offset: parseInt(req.query.offset as string) || 0,
    };

    const result = await hrService.getOrientations(filters);
    res
      .status(200)
      .json(createSuccessResponse(result, 'Orientations retrieved'));
  }
);

export const completeOrientation = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { orientationId } = req.params;

    if (!userId) {
      if (req.files) deleteUploadedFiles(req.files);
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    try {
      const orientation = await hrService.completeOrientation(
        orientationId,
        userId,
        req.files
      );
      res
        .status(200)
        .json(createSuccessResponse(orientation, 'Orientation completed'));
    } catch (error: any) {
      if (req.files) deleteUploadedFiles(req.files);
      throw error;
    }
  }
);

// ========== EMPLOYMENT Controllers ==========

export const getEmploymentHistory = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const history = await hrService.getEmploymentHistory(userId);
    res
      .status(200)
      .json(createSuccessResponse(history, 'Employment history retrieved'));
  }
);

export const updateEmploymentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { historyId } = req.params;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const history = await hrService.updateEmploymentStatus(
      historyId,
      userId,
      req.body
    );
    res
      .status(200)
      .json(createSuccessResponse(history, 'Employment status updated'));
  }
);

// ========== PLATFORM COIN Controllers ==========

export const getCoinBalance = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    const balance = await hrService.getCoinBalance(userId);
    res
      .status(200)
      .json(createSuccessResponse(balance, 'Coin balance retrieved'));
  }
);

export const transferCoins = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { toUserId, amount, description } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse('User not authenticated'));
    }

    await hrService.transferCoins(userId, toUserId, amount, description);
    res.status(200).json(createSuccessResponse(null, 'Coins transferred'));
  }
);

// ========== ANALYTICS Controllers ==========

export const getTalentRadar = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      province: req.query.province as string,
      district: req.query.district as string,
      category: req.query.category as string,
      experienceMin: req.query.experienceMin
        ? parseInt(req.query.experienceMin as string)
        : undefined,
      salaryMax: req.query.salaryMax
        ? parseInt(req.query.salaryMax as string)
        : undefined,
      limit: parseInt(req.query.limit as string) || 50,
      offset: parseInt(req.query.offset as string) || 0,
    };

    const talents = await hrService.getTalentRadar(filters);
    res
      .status(200)
      .json(createSuccessResponse(talents, 'Talent radar data retrieved'));
  }
);

export const getTrendingJobs = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;

    const trending = await hrService.getTrendingJobs(limit);
    res
      .status(200)
      .json(createSuccessResponse(trending, 'Trending jobs retrieved'));
  }
);

export const getTrendingSkills = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;

    const trending = await hrService.getTrendingSkills(limit);
    res
      .status(200)
      .json(createSuccessResponse(trending, 'Trending skills retrieved'));
  }
);

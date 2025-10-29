
import prisma from './database';
import { createServiceError } from '../../../shared/utils';
import crypto from 'crypto';

export class HRService {
  
  async submitIndividualKYC(userId: string, kycData: any, files: any) {
    const existing = await prisma.individualKYC.findUnique({
      where: { userId },
    });

    if (existing && existing.status === 'APPROVED') {
      throw createServiceError('KYC already approved', 400);
    }

    const fileUrls: any = {};
    if (files) {
      if (files.profilePhoto) fileUrls.profilePhotoUrl = files.profilePhoto[0].path;
      if (files.videoKYC) fileUrls.videoKYCUrl = files.videoKYC[0].path;
      if (files.idFront) fileUrls.idFrontImage = files.idFront[0].path;
      if (files.idBack) fileUrls.idBackImage = files.idBack[0].path;
      if (files.panCardFront) fileUrls.panCardFront = files.panCardFront[0].path;
      if (files.panCardBack) fileUrls.panCardBack = files.panCardBack[0].path;
    }

    // Calculate AI scores (placeholder - implement actual AI logic)
    const scores = this.calculateAIScores(kycData);

    const kyc = await prisma.individualKYC.upsert({
      where: { userId },
      create: {
        userId,
        ...kycData,
        ...fileUrls,
        ...scores,
        status: 'PENDING',
        consentGiven: true,
        consentDate: new Date(),
      },
      update: {
        ...kycData,
        ...fileUrls,
        ...scores,
        status: existing?.status === 'REJECTED' ? 'RESUBMITTED' : 'PENDING',
        submittedAt: new Date(),
      },
    });

    return kyc;
  }

  async submitIndustrialKYC(userId: string, kycData: any, files: any) {
    const existing = await prisma.industrialKYC.findUnique({
      where: { userId },
    });

    if (existing && existing.status === 'APPROVED') {
      throw createServiceError('KYC already approved', 400);
    }

    const fileUrls: any = {};
    if (files) {
      if (files.registrationCertificate) 
        fileUrls.registrationCertificate = files.registrationCertificate[0].path;
      if (files.taxClearanceCertificate) 
        fileUrls.taxClearanceCertificate = files.taxClearanceCertificate[0].path;
      if (files.panCertificate) 
        fileUrls.panCertificate = files.panCertificate[0].path;
      if (files.vatCertificate) 
        fileUrls.vatCertificate = files.vatCertificate[0].path;
    }

    const kyc = await prisma.industrialKYC.upsert({
      where: { userId },
      create: {
        userId,
        ...kycData,
        ...fileUrls,
        status: 'PENDING',
      },
      update: {
        ...kycData,
        ...fileUrls,
        status: existing?.status === 'REJECTED' ? 'RESUBMITTED' : 'PENDING',
        submittedAt: new Date(),
      },
    });

    return kyc;
  }

  private calculateAIScores(kycData: any) {
    // Placeholder AI scoring logic
    // In production, implement proper ML models
    let talentScore = 0;
    let careerScore = 0;
    let readinessScore = 0;

    // Calculate based on completeness
    const fields = Object.keys(kycData);
    const completeness = fields.length / 30; // Assuming 30 key fields
    
    talentScore = Math.min(completeness * 100, 100);
    careerScore = Math.min((completeness + 0.1) * 90, 100);
    readinessScore = Math.min(completeness * 85, 100);

    return {
      talentConfidenceScore: talentScore,
      careerFitScore: careerScore,
      readinessScore: readinessScore,
    };
  }

  async getKYCStatus(userId: string) {
    const individual = await prisma.individualKYC.findUnique({
      where: { userId },
    });

    const industrial = await prisma.industrialKYC.findUnique({
      where: { userId },
    });

    return { individual, industrial };
  }

  async getIndividualKYCById(userId: string) {
    const kyc = await prisma.individualKYC.findUnique({
      where: { userId },
      include: {
        trainings: {
          include: { course: true },
          orderBy: { enrolledAt: 'desc' },
        },
        certifications: {
          orderBy: { issuedDate: 'desc' },
        },
      },
    });

    if (!kyc) {
      throw createServiceError('KYC not found', 404);
    }

    return kyc;
  }

  // ========== TRAINING MANAGEMENT ==========

  async createTrainingCourse(providerId: string, courseData: any, files: any) {
    // Verify provider has approved KYC
    const kycStatus = await this.getKYCStatus(providerId);
    if (kycStatus.industrial?.status !== 'APPROVED') {
      throw createServiceError('Industrial KYC must be approved to create courses', 403);
    }

    const fileUrls: any = {};
    if (files) {
      if (files.readingMaterials) {
        fileUrls.readingMaterials = files.readingMaterials.map((f: any) => f.path);
      }
      if (files.videoMaterials) {
        fileUrls.videoMaterials = files.videoMaterials.map((f: any) => f.path);
      }
    }

    const course = await prisma.trainingCourse.create({
      data: {
        providerId,
        ...courseData,
        ...fileUrls,
      },
    });

    return course;
  }

  async getTrainingCourses(filters?: any) {
    const { category, mode, isFree, isActive = true, limit = 20, offset = 0 } = filters || {};

    const where: any = { isActive };
    if (category) where.category = category;
    if (mode) where.mode = mode;
    if (isFree !== undefined) where.isFree = isFree;

    const [courses, total] = await Promise.all([
      prisma.trainingCourse.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.trainingCourse.count({ where }),
    ]);

    return { courses, total, limit, offset };
  }

  async enrollInTraining(userId: string, courseId: string) {
    // Check KYC
    const kyc = await prisma.individualKYC.findUnique({
      where: { userId },
    });

    if (!kyc || kyc.status !== 'APPROVED') {
      throw createServiceError('KYC must be approved to enroll', 403);
    }

    // Check course availability
    const course = await prisma.trainingCourse.findUnique({
      where: { id: courseId },
    });

    if (!course || !course.isActive) {
      throw createServiceError('Course not available', 404);
    }

    if (course.seats && course.bookedSeats >= course.seats) {
      throw createServiceError('Course is full', 400);
    }

    // Check existing enrollment
    const existing = await prisma.trainingEnrollment.findUnique({
      where: {
        courseId_userId: { courseId, userId },
      },
    });

    if (existing) {
      throw createServiceError('Already enrolled', 409);
    }

    // Create enrollment and update booked seats
    const [enrollment] = await prisma.$transaction([
      prisma.trainingEnrollment.create({
        data: { courseId, userId },
      }),
      prisma.trainingCourse.update({
        where: { id: courseId },
        data: { bookedSeats: { increment: 1 } },
      }),
    ]);

    return enrollment;
  }

  async updateTrainingProgress(enrollmentId: string, userId: string, updateData: any) {
    const enrollment = await prisma.trainingEnrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment || enrollment.userId !== userId) {
      throw createServiceError('Enrollment not found', 404);
    }

    const updated = await prisma.trainingEnrollment.update({
      where: { id: enrollmentId },
      data: updateData,
    });

    return updated;
  }

  async requestTraining(userId: string, requestData: any) {
    const request = await prisma.trainingRequest.create({
      data: {
        userId,
        ...requestData,
      },
    });

    return request;
  }

  // ========== EVENTS ==========

  async createEvent(organizerId: string, eventData: any) {
    const event = await prisma.event.create({
      data: {
        organizerId,
        ...eventData,
      },
    });

    return event;
  }

  async getEvents(filters?: any) {
    const { type, isFree, upcoming = true, limit = 20, offset = 0 } = filters || {};

    const where: any = { isActive: true };
    if (type) where.type = type;
    if (isFree !== undefined) where.isFree = isFree;
    if (upcoming) {
      where.eventDate = { gte: new Date() };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { eventDate: 'asc' },
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total, limit, offset };
  }

  async registerForEvent(userId: string, eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event || !event.isActive) {
      throw createServiceError('Event not available', 404);
    }

    if (event.maxAttendees && event.registeredCount >= event.maxAttendees) {
      throw createServiceError('Event is full', 400);
    }

    const existing = await prisma.eventRegistration.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (existing) {
      throw createServiceError('Already registered', 409);
    }

    const [registration] = await prisma.$transaction([
      prisma.eventRegistration.create({
        data: { eventId, userId },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: { registeredCount: { increment: 1 } },
      }),
    ]);

    return registration;
  }

  // ========== EXAM & CERTIFICATION ==========

  async createExam(examData: any) {
    const exam = await prisma.exam.create({
      data: examData,
    });

    return exam;
  }

  async bookExam(userId: string, examId: string, examDate: Date) {
    const kyc = await prisma.individualKYC.findUnique({
      where: { userId },
    });

    if (!kyc || kyc.status !== 'APPROVED') {
      throw createServiceError('KYC must be approved', 403);
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam || !exam.isActive) {
      throw createServiceError('Exam not available', 404);
    }

    const booking = await prisma.examBooking.create({
      data: {
        examId,
        userId,
        bookedDate: new Date(),
        examDate,
      },
    });

    return booking;
  }

  async updateExamResult(bookingId: string, resultData: any) {
    const booking = await prisma.examBooking.update({
      where: { id: bookingId },
      data: {
        ...resultData,
        resultDate: new Date(),
        status: resultData.score >= resultData.passingScore ? 'PASSED' : 'FAILED',
      },
    });

    // If passed, create certification
    if (booking.status === 'PASSED') {
      await this.generateCertification(booking.userId, bookingId);
    }

    return booking;
  }

  async requestRetotaling(bookingId: string, userId: string) {
    const booking = await prisma.examBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.userId !== userId) {
      throw createServiceError('Booking not found', 404);
    }

    if (booking.status !== 'FAILED') {
      throw createServiceError('Can only request retotaling for failed exams', 400);
    }

    const updated = await prisma.examBooking.update({
      where: { id: bookingId },
      data: {
        retotalingRequested: true,
        retotalingDate: new Date(),
      },
    });

    return updated;
  }

  async generateCertification(userId: string, examBookingId: string) {
    const booking = await prisma.examBooking.findUnique({
      where: { id: examBookingId },
      include: { exam: true },
    });

    if (!booking) {
      throw createServiceError('Exam booking not found', 404);
    }

    const certificateNumber = `CERT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const verificationCode = crypto.randomBytes(8).toString('hex').toUpperCase();

    const certification = await prisma.certification.create({
      data: {
        userId,
        examBookingId,
        certificateNumber,
        verificationCode,
        title: booking.exam.title,
        category: booking.exam.category,
        issuedDate: new Date(),
        certificateUrl: `certificates/${certificateNumber}.pdf`, // Generate PDF separately
      },
    });

    // Update KYC with verification badge
    await this.updateKYCWithCertification(userId, certification.id);

    return certification;
  }

  private async updateKYCWithCertification(userId: string, certId: string) {
    // Logic to update KYC profile with certification badge
    // This can trigger UI updates showing verified skills
  }

  async getCertifications(userId: string) {
    const certifications = await prisma.certification.findMany({
      where: { userId },
      orderBy: { issuedDate: 'desc' },
    });

    return certifications;
  }

  async verifyCertification(verificationCode: string) {
    const cert = await prisma.certification.findUnique({
      where: { verificationCode },
    });

    if (!cert) {
      throw createServiceError('Certificate not found', 404);
    }

    return cert;
  }

  // ========== JOB POSTING ==========

  async createJobPosting(employerId: string, jobData: any) {
    const kyc = await prisma.industrialKYC.findUnique({
      where: { userId: employerId },
    });

    if (!kyc || kyc.status !== 'APPROVED') {
      throw createServiceError('Industrial KYC must be approved', 403);
    }

    const job = await prisma.jobPosting.create({
      data: {
        employerId,
        ...jobData,
      },
    });

    return job;
  }

  async getJobPostings(filters?: any) {
    const {
      jobType,
      province,
      district,
      isActive = true,
      isRemote,
      salaryMin,
      category,
      limit = 20,
      offset = 0,
    } = filters || {};

    const where: any = { isActive };
    if (jobType) where.jobType = jobType;
    if (province) where.province = province;
    if (district) where.district = district;
    if (isRemote !== undefined) where.isRemote = isRemote;
    if (salaryMin) where.salaryMin = { gte: salaryMin };

    const [jobs, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          employer: {
            select: {
              companyName: true,
              companyEmail: true,
              industrySector: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.jobPosting.count({ where }),
    ]);

    return { jobs, total, limit, offset };
  }

  async applyForJob(jobId: string, userId: string, applicationData: any, files: any) {
    const kyc = await prisma.individualKYC.findUnique({
      where: { userId },
    });

    if (!kyc || kyc.status !== 'APPROVED') {
      throw createServiceError('KYC must be approved', 403);
    }

    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
    });

    if (!job || !job.isActive) {
      throw createServiceError('Job not available', 404);
    }

    const existing = await prisma.jobApplication.findUnique({
      where: {
        jobId_applicantId: { jobId, applicantId: userId },
      },
    });

    if (existing) {
      throw createServiceError('Already applied', 409);
    }

    const fileUrls: any = {};
    if (files) {
      if (files.resume) fileUrls.resumeUrl = files.resume[0].path;
      if (files.portfolio) fileUrls.portfolioUrl = files.portfolio[0].path;
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        applicantId: userId,
        ...applicationData,
        ...fileUrls,
      },
    });

    return application;
  }

  async getJobApplications(filters?: any) {
    const { jobId, applicantId, status, limit = 20, offset = 0 } = filters || {};

    const where: any = {};
    if (jobId) where.jobId = jobId;
    if (applicantId) where.applicantId = applicantId;
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { appliedAt: 'desc' },
        include: {
          job: {
            select: {
              title: true,
              jobType: true,
              salaryMin: true,
              salaryMax: true,
            },
          },
          applicant: {
            select: {
              fullName: true,
              email: true,
              phone: true,
              technicalSkills: true,
              experience: true,
            },
          },
        },
      }),
      prisma.jobApplication.count({ where }),
    ]);

    return { applications, total, limit, offset };
  }

  async updateApplicationStatus(applicationId: string, employerId: string, statusData: any) {
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      throw createServiceError('Application not found', 404);
    }

    if (application.job.employerId !== employerId) {
      throw createServiceError('Unauthorized', 403);
    }

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        ...statusData,
        reviewedAt: new Date(),
      },
    });

    // If accepted, create orientation
    if (statusData.status === 'ACCEPTED') {
      await this.scheduleOrientation(application.applicantId, employerId, applicationId);
    }

    return updated;
  }

  // ========== ORIENTATION ==========

  private async scheduleOrientation(userId: string, companyId: string, applicationId: string) {
    const orientation = await prisma.orientation.create({
      data: {
        jobApplicationId: applicationId,
        userId,
        companyId,
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });

    return orientation;
  }

  async getOrientations(filters?: any) {
    const { userId, companyId, isCompleted, limit = 20, offset = 0 } = filters || {};

    const where: any = {};
    if (userId) where.userId = userId;
    if (companyId) where.companyId = companyId;
    if (isCompleted !== undefined) where.isCompleted = isCompleted;

    const [orientations, total] = await Promise.all([
      prisma.orientation.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { scheduledDate: 'desc' },
      }),
      prisma.orientation.count({ where }),
    ]);

    return { orientations, total, limit, offset };
  }

  async completeOrientation(orientationId: string, userId: string, files: any) {
    const orientation = await prisma.orientation.findUnique({
      where: { id: orientationId },
    });

    if (!orientation || orientation.userId !== userId) {
      throw createServiceError('Orientation not found', 404);
    }

    const fileUrls: any = {};
    if (files) {
      if (files.orientationVideos) {
        fileUrls.orientationVideos = files.orientationVideos.map((f: any) => f.path);
      }
      if (files.orientationPhotos) {
        fileUrls.orientationPhotos = files.orientationPhotos.map((f: any) => f.path);
      }
    }

    const updated = await prisma.orientation.update({
      where: { id: orientationId },
      data: {
        ...fileUrls,
        completedDate: new Date(),
        isCompleted: true,
      },
    });

    // Create employment history
    await this.createEmploymentHistory(userId, orientation.jobApplicationId);

    return updated;
  }

  // ========== EMPLOYMENT HISTORY ==========

  private async createEmploymentHistory(userId: string, applicationId: string) {
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) return;

    await prisma.employmentHistory.create({
      data: {
        userId,
        jobApplicationId: applicationId,
        companyName: 'Company Name', // Get from job details
        position: application.job.title,
        employmentStatus: 'PROBATION',
        startDate: new Date(),
      },
    });
  }

  async updateEmploymentStatus(historyId: string, userId: string, statusData: any) {
    const history = await prisma.employmentHistory.findUnique({
      where: { id: historyId },
    });

    if (!history || history.userId !== userId) {
      throw createServiceError('Employment history not found', 404);
    }

    const updated = await prisma.employmentHistory.update({
      where: { id: historyId },
      data: statusData,
    });

    return updated;
  }

  async getEmploymentHistory(userId: string) {
    const history = await prisma.employmentHistory.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });

    return history;
  }

  // ========== PLATFORM COINS ==========

  async getCoinBalance(userId: string) {
    let coin = await prisma.platformCoin.findUnique({
      where: { userId },
    });

    if (!coin) {
      coin = await prisma.platformCoin.create({
        data: { userId },
      });
    }

    return coin;
  }

  async addCoins(userId: string, amount: number, source: string, description: string) {
    const coin = await this.getCoinBalance(userId);

    const [updated] = await prisma.$transaction([
      prisma.platformCoin.update({
        where: { userId },
        data: {
          balance: { increment: amount },
          totalEarned: { increment: amount },
        },
      }),
      prisma.coinTransaction.create({
        data: {
          userId,
          type: 'EARN',
          amount,
          source,
          description,
          balanceBefore: coin.balance,
          balanceAfter: Number(coin.balance) + amount,
        },
      }),
    ]);

    return updated;
  }

  async spendCoins(userId: string, amount: number, description: string) {
    const coin = await this.getCoinBalance(userId);

    if (Number(coin.balance) < amount) {
      throw createServiceError('Insufficient balance', 400);
    }

    const [updated] = await prisma.$transaction([
      prisma.platformCoin.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
          totalSpent: { increment: amount },
        },
      }),
      prisma.coinTransaction.create({
        data: {
          userId,
          type: 'SPEND',
          amount,
          description,
          balanceBefore: coin.balance,
          balanceAfter: Number(coin.balance) - amount,
        },
      }),
    ]);

    return updated;
  }

  async transferCoins(fromUserId: string, toUserId: string, amount: number, description: string) {
    const fromCoin = await this.getCoinBalance(fromUserId);

    if (Number(fromCoin.balance) < amount) {
      throw createServiceError('Insufficient balance', 400);
    }

    const toCoin = await this.getCoinBalance(toUserId);

    await prisma.$transaction([
      // Deduct from sender
      prisma.platformCoin.update({
        where: { userId: fromUserId },
        data: { balance: { decrement: amount } },
      }),
      prisma.coinTransaction.create({
        data: {
          userId: fromUserId,
          type: 'TRANSFER_OUT',
          amount,
          recipientId: toUserId,
          description,
          balanceBefore: fromCoin.balance,
          balanceAfter: Number(fromCoin.balance) - amount,
        },
      }),
      // Add to recipient
      prisma.platformCoin.update({
        where: { userId: toUserId },
        data: {
          balance: { increment: amount },
          totalEarned: { increment: amount },
        },
      }),
      prisma.coinTransaction.create({
        data: {
          userId: toUserId,
          type: 'TRANSFER_IN',
          amount,
          source: fromUserId,
          description,
          balanceBefore: toCoin.balance,
          balanceAfter: Number(toCoin.balance) + amount,
        },
      }),
    ]);
  }

  // ========== ANALYTICS & TRENDING ==========

  async getTalentRadar(filters?: any) {
    const {
      province,
      district,
      category,
      experienceMin,
      salaryMax,
      limit = 50,
      offset = 0,
    } = filters || {};

    const where: any = {
      status: 'APPROVED',
    };

    if (province) where.province = province;
    if (district) where.district = district;

    const talents = await prisma.individualKYC.findMany({
      where,
      take: limit,
      skip: offset,
      select: {
        userId: true,
        fullName: true,
        province: true,
        district: true,
        city: true,
        technicalSkills: true,
        experience: true,
        expectedSalaryMin: true,
        expectedSalaryMax: true,
        readinessScore: true,
        talentConfidenceScore: true,
        certifications: {
          select: {
            title: true,
            category: true,
          },
        },
      },
    });

    return talents;
  }

  async updateTrendingData() {
    // This should be called periodically (cron job)
    // Calculate trending jobs and skills based on current data
    
    // Count job postings by title
    const jobCounts = await prisma.jobPosting.groupBy({
      by: ['title'],
      where: { isActive: true },
      _count: true,
    });

    // Update trending jobs
    for (const job of jobCounts) {
      await prisma.trendingJob.upsert({
        where: { id: job.title }, // This needs proper unique constraint
        create: {
          jobTitle: job.title,
          category: 'General',
          demandScore: job._count,
          totalOpenings: job._count,
        },
        update: {
          demandScore: job._count,
          totalOpenings: job._count,
        },
      });
    }
  }

  async getTrendingJobs(limit: number = 10) {
    const trending = await prisma.trendingJob.findMany({
      take: limit,
      orderBy: { demandScore: 'desc' },
    });

    return trending;
  }

  async getTrendingSkills(limit: number = 10) {
    const trending = await prisma.trendingSkill.findMany({
      take: limit,
      orderBy: { demandScore: 'desc' },
    });

    return trending;
  }
}
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { createServiceError } from '../../../../shared/utils';

// Ensure upload directories exist
const uploadDirs = [
  'uploads/kyc/ids',
  'uploads/kyc/pan',
  'uploads/kyc/certificates',
  'uploads/kyc/videos',
  'uploads/kyc/photos',
  'uploads/training/materials',
  'uploads/training/practice',
  'uploads/exams/media',
  'uploads/certifications',
  'uploads/resumes',
  'uploads/portfolios',
  'uploads/orientation',
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let uploadPath = 'uploads/';

    // Determine upload path based on field name
    if (file.fieldname.includes('id')) {
      uploadPath = 'uploads/kyc/ids/';
    } else if (file.fieldname.includes('pan')) {
      uploadPath = 'uploads/kyc/pan/';
    } else if (file.fieldname.includes('certificate')) {
      uploadPath = 'uploads/kyc/certificates/';
    } else if (file.fieldname.includes('video')) {
      if (file.fieldname.includes('kyc')) {
        uploadPath = 'uploads/kyc/videos/';
      } else if (file.fieldname.includes('practice')) {
        uploadPath = 'uploads/training/practice/';
      } else if (file.fieldname.includes('exam')) {
        uploadPath = 'uploads/exams/media/';
      } else if (file.fieldname.includes('orientation')) {
        uploadPath = 'uploads/orientation/';
      }
    } else if (file.fieldname.includes('photo')) {
      if (file.fieldname.includes('profile')) {
        uploadPath = 'uploads/kyc/photos/';
      } else if (file.fieldname.includes('practice')) {
        uploadPath = 'uploads/training/practice/';
      } else if (file.fieldname.includes('exam')) {
        uploadPath = 'uploads/exams/media/';
      } else if (file.fieldname.includes('orientation')) {
        uploadPath = 'uploads/orientation/';
      }
    } else if (file.fieldname.includes('resume')) {
      uploadPath = 'uploads/resumes/';
    } else if (file.fieldname.includes('portfolio')) {
      uploadPath = 'uploads/portfolios/';
    } else if (file.fieldname.includes('material')) {
      uploadPath = 'uploads/training/materials/';
    }

    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const userId = req.user?.userId || 'anonymous';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${userId}_${timestamp}_${file.fieldname}${ext}`;
    cb(null, filename);
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  // Allowed file types
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|webm/;

  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  const mimetype = file.mimetype;

  // Check based on file field
  if (file.fieldname.includes('video')) {
    if (allowedVideoTypes.test(ext) && mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(createServiceError('Only video files are allowed', 400), false);
    }
  } else if (file.fieldname.includes('photo') || file.fieldname.includes('profile')) {
    if (allowedImageTypes.test(ext) && mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(createServiceError('Only image files are allowed', 400), false);
    }
  } else if (file.fieldname.includes('certificate') || file.fieldname.includes('resume') || file.fieldname.includes('material')) {
    if ((allowedDocTypes.test(ext) || allowedImageTypes.test(ext)) && 
        (mimetype.startsWith('application/') || mimetype.startsWith('image/'))) {
      cb(null, true);
    } else {
      cb(createServiceError('Only document or image files are allowed', 400), false);
    }
  } else {
    cb(null, true);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// Middleware exports for different upload scenarios

// Individual KYC uploads
export const uploadIndividualKYC = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'videoKYC', maxCount: 1 },
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 },
  { name: 'panCardFront', maxCount: 1 },
  { name: 'panCardBack', maxCount: 1 },
  { name: 'certifications', maxCount: 10 },
]);

// Industrial KYC uploads
export const uploadIndustrialKYC = upload.fields([
  { name: 'registrationCertificate', maxCount: 1 },
  { name: 'taxClearanceCertificate', maxCount: 1 },
  { name: 'panCertificate', maxCount: 1 },
  { name: 'vatCertificate', maxCount: 1 },
]);

// Training materials uploads
export const uploadTrainingMaterials = upload.fields([
  { name: 'readingMaterials', maxCount: 20 },
  { name: 'videoMaterials', maxCount: 10 },
]);

// Practice uploads
export const uploadPracticeMedia = upload.fields([
  { name: 'practiceVideos', maxCount: 5 },
  { name: 'practicePhotos', maxCount: 10 },
]);

// Exam media uploads
export const uploadExamMedia = upload.fields([
  { name: 'examVideos', maxCount: 3 },
  { name: 'examPhotos', maxCount: 5 },
  { name: 'interviewVideos', maxCount: 2 },
  { name: 'interviewPhotos', maxCount: 5 },
]);

// Job application uploads
export const uploadJobApplication = upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'portfolio', maxCount: 1 },
]);

// Orientation uploads
export const uploadOrientation = upload.fields([
  { name: 'orientationVideos', maxCount: 3 },
  { name: 'orientationPhotos', maxCount: 10 },
]);

// Single file upload (generic)
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Multiple files upload (generic)
export const uploadMultiple = (fieldName: string, maxCount: number) => 
  upload.array(fieldName, maxCount);

// Helper function to get file URLs
export const getFileUrls = (files: any, baseUrl: string = ''): Record<string, string | string[]> => {
  const fileUrls: Record<string, string | string[]> = {};

  if (!files) return fileUrls;

  // Handle multer fields format
  if (typeof files === 'object' && !Array.isArray(files)) {
    Object.keys(files).forEach((fieldName) => {
      const fieldFiles = files[fieldName];
      if (Array.isArray(fieldFiles)) {
        if (fieldFiles.length === 1) {
          fileUrls[fieldName] = `${baseUrl}/${fieldFiles[0].path}`;
        } else {
          fileUrls[fieldName] = fieldFiles.map(f => `${baseUrl}/${f.path}`);
        }
      }
    });
  }

  return fileUrls;
};

// Helper function to delete uploaded files (in case of error)
export const deleteUploadedFiles = (files: any) => {
  if (!files) return;

  const deleteFile = (filePath: string) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  };

  if (Array.isArray(files)) {
    files.forEach(file => deleteFile(file.path));
  } else if (typeof files === 'object') {
    Object.values(files).forEach((fileArray: any) => {
      if (Array.isArray(fileArray)) {
        fileArray.forEach(file => deleteFile(file.path));
      }
    });
  }
};

export default upload;
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import hrRoutes from './routes';
import {
  corsOptions,
  errorHandler,
  healthCheck,
} from '../../../shared/middleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Trust proxy (important for reverse proxies)
app.set('trust proxy', 1);

// Setup middlewares
app.use(cors(corsOptions()));
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded documents)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/hr', hrRoutes);

// Health check
app.get('/health', healthCheck);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'TalentRadar.ai HR Platform Service',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      kyc: '/hr/kyc/*',
      training: '/hr/training/*',
      events: '/hr/events/*',
      exams: '/hr/exams/*',
      certifications: '/hr/certifications/*',
      jobs: '/hr/jobs/*',
      orientations: '/hr/orientations/*',
      employment: '/hr/employment/*',
      coins: '/hr/coins/*',
      dashboard: '/hr/dashboard/*',
    },
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ======================================');
  console.log('   TalentRadar.ai HR Platform Service');
  console.log('   ======================================');
  console.log('');
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Service URL: http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('📋 Available features:');
  console.log('   ✓ Enhanced KYC with AI scoring');
  console.log('   ✓ Training & Skill Hunt');
  console.log('   ✓ Events (Webinars, Seminars)');
  console.log('   ✓ Exam & Certification');
  console.log('   ✓ Job Hunting Radar');
  console.log('   ✓ Employment Tracking');
  console.log('   ✓ Platform Coin Economy');
  console.log('   ✓ Talent Analytics Dashboard');
  console.log('');
  console.log('🌐 Access via API Gateway:');
  console.log(`   http://localhost:8080/api/hr/*`);
  console.log('');
  console.log('📁 Upload directories ready at ./uploads/');
  console.log('');
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('');
  console.log('🚦 Shutting down HR Service...');
  server.close(() => {
    console.log('✅ HR Service shut down gracefully.');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

export default app;

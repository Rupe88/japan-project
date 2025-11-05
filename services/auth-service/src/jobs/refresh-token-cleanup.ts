import cron from 'node-cron';
import { AuthService } from '@/auth-service';

const authService = new AuthService();

/**
 * Start automated token cleanup job
 * Runs daily at 2:00 AM
 */
export function startTokenCleanupJob() {
  // Schedule: Run every day at 2:00 AM
  // Format: minute hour day month weekday
  // "0 2 * * *" = At 02:00 every day
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('[Cron] Starting daily token cleanup...');
      const startTime = Date.now();

      // Cleanup expired refresh tokens
      const expiredTokens = await authService.cleanupExpiredTokens();

      // Cleanup expired verification codes
      const expiredCodes = await authService.cleanupExpiredVerificationCodes();

      const duration = Date.now() - startTime;

      console.log(
        `[Cron] Token cleanup completed in ${duration}ms:`,
        `\n  - Deleted ${expiredTokens} expired refresh tokens`,
        `\n  - Deleted ${expiredCodes} expired verification codes`
      );
    } catch (error) {
      console.error('[Cron] Token cleanup job failed:', error);
    }
  });

  console.log('[Cron] Token cleanup job scheduled (daily at 2:00 AM)');
}

export function startTokenCleanupJobWithSchedule(schedule: string) {
  cron.schedule(schedule, async () => {
    try {
      console.log('[Cron] Starting token cleanup...');
      await authService.cleanupExpiredTokens();
      await authService.cleanupExpiredVerificationCodes();
      console.log('[Cron] Token cleanup completed');
    } catch (error) {
      console.error('[Cron] Token cleanup failed:', error);
    }
  });

  console.log(`[Cron] Token cleanup job scheduled with custom schedule: ${schedule}`);
}

/**
 * Manual cleanup function (for testing or admin endpoint)
 */
export async function runTokenCleanupNow(): Promise<{
  expiredTokens: number;
  expiredCodes: number;
}> {
  console.log('[Manual] Starting token cleanup...');

  try {
    const expiredTokens = await authService.cleanupExpiredTokens();
    const expiredCodes = await authService.cleanupExpiredVerificationCodes();

    console.log(
      `[Manual] Cleanup completed:`,
      `\n  - Deleted ${expiredTokens} expired refresh tokens`,
      `\n  - Deleted ${expiredCodes} expired verification codes`
    );

    return { expiredTokens, expiredCodes };
  } catch (error) {
    console.error('[Manual] Token cleanup failed:', error);
    throw error;
  }
}

// ============================================
// CRON SCHEDULE EXAMPLES
// ============================================
// 
// "0 2 * * *"      - Every day at 2:00 AM
// "0 */6 * * *"    - Every 6 hours
// "0 0 * * 0"      - Every Sunday at midnight
// "*/30 * * * *"   - Every 30 minutes
// "0 0 1 * *"      - First day of every month at midnight
// 
// ============================================
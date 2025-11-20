/**
 * Audit Log Archival Service
 * 
 * Manages automatic archival of old audit logs based on:
 * 1. Age threshold (90 days)
 * 2. Record count threshold (1 million records)
 * 
 * Requirements: 5.5
 */

import cron from 'node-cron';
import { getAuditLoggerService } from './audit-logger-service';

class AuditLogArchivalService {
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning: boolean = false;
  private lastArchivalDate: Date | null = null;
  private totalArchived: number = 0;
  private archivalCount: number = 0;

  /**
   * Start scheduled archival job
   * Runs daily at 2 AM to archive old logs
   */
  startScheduledArchival(): void {
    if (this.cronJob) {
      console.log('[AuditLogArchival] Archival job already running');
      return;
    }

    // Schedule daily at 2 AM
    this.cronJob = cron.schedule('0 2 * * *', async () => {
      await this.performArchival();
    });

    this.isRunning = true;
    console.log('[AuditLogArchival] Scheduled archival job started (daily at 2 AM)');
  }

  /**
   * Stop scheduled archival job
   */
  stopScheduledArchival(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      this.isRunning = false;
      console.log('[AuditLogArchival] Scheduled archival job stopped');
    }
  }

  /**
   * Perform archival of old audit logs
   * Archives logs older than 90 days
   */
  async performArchival(): Promise<void> {
    const auditLogger = getAuditLoggerService();
    
    try {
      console.log('[AuditLogArchival] Starting audit log archival...');
      
      // Check if archival is needed based on threshold
      const { shouldArchive, totalRecords } = await auditLogger.checkThreshold();
      
      console.log(`[AuditLogArchival] Current audit log count: ${totalRecords}`);
      console.log(`[AuditLogArchival] Should archive: ${shouldArchive}`);
      
      // Calculate cutoff date (90 days ago)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      
      // Perform archival
      const archivedCount = await auditLogger.archiveOldLogs(cutoffDate);
      
      // Update statistics
      this.lastArchivalDate = new Date();
      this.totalArchived += archivedCount;
      this.archivalCount++;
      
      console.log(`[AuditLogArchival] Archived ${archivedCount} audit log records`);
      console.log(`[AuditLogArchival] Total archived to date: ${this.totalArchived}`);
      
      // If threshold is still exceeded, log a warning
      if (shouldArchive && archivedCount === 0) {
        console.warn('[AuditLogArchival] WARNING: Audit logs exceed threshold but no records were archived');
        console.warn('[AuditLogArchival] Consider adjusting archival policy or investigating data growth');
      }
    } catch (error) {
      console.error('[AuditLogArchival] Error during archival:', error);
      // Don't throw - archival failures should not crash the application
    }
  }

  /**
   * Manually trigger archival (for testing or admin actions)
   */
  async triggerArchival(): Promise<{ success: boolean; archivedCount: number; error?: string }> {
    try {
      const auditLogger = getAuditLoggerService();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);
      
      const archivedCount = await auditLogger.archiveOldLogs(cutoffDate);
      
      // Update statistics
      this.lastArchivalDate = new Date();
      this.totalArchived += archivedCount;
      this.archivalCount++;
      
      return {
        success: true,
        archivedCount,
      };
    } catch (error) {
      console.error('[AuditLogArchival] Manual archival failed:', error);
      return {
        success: false,
        archivedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if archival is needed based on threshold
   */
  async checkArchivalNeeded(): Promise<{
    needed: boolean;
    totalRecords: number;
    threshold: number;
  }> {
    try {
      const auditLogger = getAuditLoggerService();
      const { shouldArchive, totalRecords } = await auditLogger.checkThreshold();
      
      return {
        needed: shouldArchive,
        totalRecords,
        threshold: 1000000, // 1 million
      };
    } catch (error) {
      console.error('[AuditLogArchival] Error checking archival threshold:', error);
      return {
        needed: false,
        totalRecords: 0,
        threshold: 1000000,
      };
    }
  }

  /**
   * Get archival statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      lastArchivalDate: this.lastArchivalDate,
      totalArchived: this.totalArchived,
      archivalCount: this.archivalCount,
    };
  }

  /**
   * Check if archival job is running
   */
  isArchivalRunning(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
export const auditLogArchivalService = new AuditLogArchivalService();

// Export class for testing
export default AuditLogArchivalService;

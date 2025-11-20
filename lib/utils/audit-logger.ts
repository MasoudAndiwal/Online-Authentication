/**
 * Audit Logger Utility
 * Simple logging utility for rate limit violations and other audit events
 * This is a basic implementation that logs to console and can be extended
 * to write to database when the full AuditLoggerService is implemented
 */

export type AuditAction = 
  | 'rate_limit_violation'
  | 'data_export'
  | 'file_upload'
  | 'file_download'
  | 'login_success'
  | 'login_failure'
  | 'password_change'
  | 'profile_update'
  | 'notification_sent';

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  metadata: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

/**
 * Generate unique audit log ID
 */
function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Log an audit entry
 * Currently logs to console, will be extended to write to database
 * 
 * @param entry - Audit log entry
 */
export async function logAuditEntry(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
  const fullEntry: AuditLogEntry = {
    ...entry,
    id: generateAuditId(),
    timestamp: new Date(),
  };

  // Log to console with structured format
  console.log('[AUDIT]', JSON.stringify({
    id: fullEntry.id,
    action: fullEntry.action,
    userId: fullEntry.userId,
    resource: fullEntry.resource,
    resourceId: fullEntry.resourceId,
    success: fullEntry.success,
    timestamp: fullEntry.timestamp.toISOString(),
    metadata: fullEntry.metadata,
  }));

  // TODO: Write to audit_logs table when database schema is ready
  // This will be implemented in task 7.2 (Implement AuditLoggerService class)
  
  // For now, we can also write to a file in production if needed
  if (process.env.NODE_ENV === 'production' && process.env.AUDIT_LOG_FILE) {
    try {
      const fs = await import('fs/promises');
      const logLine = JSON.stringify(fullEntry) + '\n';
      await fs.appendFile(process.env.AUDIT_LOG_FILE, logLine);
    } catch (error) {
      console.error('Failed to write audit log to file:', error);
    }
  }
}

/**
 * Log rate limit violation
 * 
 * @param userId - User identifier
 * @param endpoint - API endpoint
 * @param ipAddress - Client IP address
 * @param userAgent - Client user agent
 * @param metadata - Additional metadata
 */
export async function logRateLimitViolation(
  userId: string,
  endpoint: string,
  ipAddress: string,
  userAgent: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  await logAuditEntry({
    userId,
    action: 'rate_limit_violation',
    resource: 'api_endpoint',
    resourceId: endpoint,
    metadata: {
      endpoint,
      ...metadata,
    },
    ipAddress,
    userAgent,
    success: false,
    errorMessage: 'Rate limit exceeded',
  });
}

/**
 * Log data export action
 * 
 * @param userId - User identifier
 * @param format - Export format (CSV, PDF, etc.)
 * @param scope - Data scope
 * @param ipAddress - Client IP address
 * @param userAgent - Client user agent
 */
export async function logDataExport(
  userId: string,
  format: string,
  scope: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await logAuditEntry({
    userId,
    action: 'data_export',
    resource: 'attendance_data',
    metadata: {
      format,
      scope,
    },
    ipAddress,
    userAgent,
    success: true,
  });
}

/**
 * Log file upload action
 * 
 * @param userId - User identifier
 * @param fileName - Uploaded file name
 * @param fileSize - File size in bytes
 * @param fileType - MIME type
 * @param ipAddress - Client IP address
 * @param userAgent - Client user agent
 */
export async function logFileUpload(
  userId: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await logAuditEntry({
    userId,
    action: 'file_upload',
    resource: 'medical_certificate',
    metadata: {
      fileName,
      fileSize,
      fileType,
    },
    ipAddress,
    userAgent,
    success: true,
  });
}

/**
 * Log authentication failure
 * 
 * @param username - Attempted username
 * @param reason - Failure reason
 * @param ipAddress - Client IP address
 * @param userAgent - Client user agent
 */
export async function logAuthenticationFailure(
  username: string,
  reason: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  await logAuditEntry({
    userId: username, // Use username as userId for failed attempts
    action: 'login_failure',
    resource: 'authentication',
    metadata: {
      username,
      reason,
    },
    ipAddress,
    userAgent,
    success: false,
    errorMessage: reason,
  });
}

export default logAuditEntry;

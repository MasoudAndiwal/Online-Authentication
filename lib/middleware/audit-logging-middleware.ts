import { NextRequest, NextResponse } from 'next/server';
import { getAuditLoggerService } from '../services/audit-logger-service';

/**
 * Extract IP address from request
 */
export function getClientIp(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback to unknown if we can't determine IP
  return 'unknown';
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Middleware to log data exports
 */
export async function logDataExport(
  userId: string,
  exportFormat: string,
  dateRange: { start: Date; end: Date },
  request: NextRequest
): Promise<void> {
  const auditLogger = getAuditLoggerService();
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);
  
  await auditLogger.logDataExport(
    userId,
    exportFormat,
    dateRange,
    ipAddress,
    userAgent
  );
}

/**
 * Middleware to log file uploads
 */
export async function logFileUpload(
  userId: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  request: NextRequest,
  success: boolean = true,
  errorMessage?: string
): Promise<void> {
  const auditLogger = getAuditLoggerService();
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);
  
  await auditLogger.logFileUpload(
    userId,
    fileName,
    fileSize,
    fileType,
    ipAddress,
    userAgent,
    success,
    errorMessage
  );
}

/**
 * Middleware to log authentication attempts
 */
export async function logAuthenticationAttempt(
  userId: string,
  success: boolean,
  request: NextRequest,
  errorReason?: string
): Promise<void> {
  const auditLogger = getAuditLoggerService();
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);
  
  if (success) {
    await auditLogger.logAuthenticationSuccess(userId, ipAddress, userAgent);
  } else {
    await auditLogger.logAuthenticationFailure(
      userId,
      errorReason || 'Authentication failed',
      ipAddress,
      userAgent
    );
  }
}

/**
 * Higher-order function to wrap API routes with audit logging
 */
export function withAuditLogging<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  options: {
    action: 'data_export' | 'file_upload' | 'authentication';
    extractUserId?: (request: NextRequest) => Promise<string | null>;
  }
): T {
  return (async (...args: any[]) => {
    const request = args[0] as NextRequest;
    const response = await handler(...args);
    
    // Extract user ID if provided
    let userId: string | null = null;
    if (options.extractUserId) {
      userId = await options.extractUserId(request);
    }
    
    // Log based on action type and response status
    if (userId && response.status >= 200 && response.status < 300) {
      const auditLogger = getAuditLoggerService();
      const ipAddress = getClientIp(request);
      const userAgent = getUserAgent(request);
      
      // Log successful action
      await auditLogger.log({
        userId,
        action: options.action,
        resource: request.url,
        ipAddress,
        userAgent,
        success: true,
      });
    }
    
    return response;
  }) as T;
}

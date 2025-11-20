/**
 * Custom error class for rate limiting
 */
export class RateLimitError extends Error {
  public readonly statusCode: number = 429;
  public readonly code: string = 'RATE_LIMIT_EXCEEDED';
  public readonly retryAfter?: number;

  constructor(message: string = 'Too many requests. Please try again later.', retryAfter?: number) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitError);
    }
  }
}

export default RateLimitError;

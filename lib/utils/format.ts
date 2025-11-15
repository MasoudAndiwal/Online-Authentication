/**
 * Format utilities for displaying numbers, percentages, and other data
 */

/**
 * Format a percentage value to a readable string
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "85.5%")
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0%';
  }
  
  // Round to specified decimal places
  const rounded = Number(value.toFixed(decimals));
  
  // If decimals is 0, return whole number
  if (decimals === 0) {
    return `${Math.round(value)}%`;
  }
  
  // Return with specified decimals
  return `${rounded}%`;
}

/**
 * Format a progress percentage (0-1 or 0-100) to a readable string
 * @param progress - Progress value (can be 0-1 or 0-100)
 * @param decimals - Number of decimal places (default: 0 for whole numbers)
 * @returns Formatted percentage string
 */
export function formatProgress(progress: number, decimals: number = 0): string {
  // Detect if progress is in 0-1 range or 0-100 range
  const percentage = progress <= 1 ? progress * 100 : progress;
  
  return formatPercentage(percentage, decimals);
}

/**
 * Format a number with thousand separators
 * @param value - The number to format
 * @returns Formatted number string (e.g., "1,234")
 */
export function formatNumber(value: number): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0';
  }
  
  return value.toLocaleString('en-US');
}

/**
 * Format a decimal number to a specific number of decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatDecimal(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0';
  }
  
  return value.toFixed(decimals);
}

/**
 * Format bytes to human-readable size
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

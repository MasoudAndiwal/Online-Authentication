/**
 * Color Contrast Utilities
 * Ensures WCAG 2.1 Level AA compliance (4.5:1 for normal text, 3:1 for large text)
 */

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Use hex format (#RRGGBB)');
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 * @param ratio - Contrast ratio
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns true if contrast meets WCAG AA standards
 */
export function meetsWCAGAA(ratio: number, isLargeText = false): boolean {
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 * @param ratio - Contrast ratio
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns true if contrast meets WCAG AAA standards
 */
export function meetsWCAGAAA(ratio: number, isLargeText = false): boolean {
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Validate color combinations used in the dashboard
 * Returns a report of all color combinations and their contrast ratios
 */
export function validateDashboardColors() {
  const colorCombinations = [
    // Text on backgrounds
    { name: 'Primary text on white', fg: '#0F172A', bg: '#FFFFFF', isLarge: false },
    { name: 'Secondary text on white', fg: '#475569', bg: '#FFFFFF', isLarge: false },
    { name: 'Tertiary text on white', fg: '#94A3B8', bg: '#FFFFFF', isLarge: false },
    
    // Status colors
    { name: 'Present text on present bg', fg: '#065F46', bg: '#D1FAE5', isLarge: false },
    { name: 'Absent text on absent bg', fg: '#991B1B', bg: '#FEE2E2', isLarge: false },
    { name: 'Sick text on sick bg', fg: '#92400E', bg: '#FEF3C7', isLarge: false },
    { name: 'Leave text on leave bg', fg: '#164E63', bg: '#CFFAFE', isLarge: false },
    
    // Buttons and CTAs
    { name: 'White text on blue button', fg: '#FFFFFF', bg: '#3B82F6', isLarge: false },
    { name: 'White text on violet button', fg: '#FFFFFF', bg: '#8B5CF6', isLarge: false },
    
    // Alert banners
    { name: 'White text on red alert', fg: '#FFFFFF', bg: '#EF4444', isLarge: false },
    { name: 'White text on amber alert', fg: '#FFFFFF', bg: '#F59E0B', isLarge: false },
    
    // Large text (headings)
    { name: 'Primary text on white (large)', fg: '#0F172A', bg: '#FFFFFF', isLarge: true },
    { name: 'Blue heading on white', fg: '#3B82F6', bg: '#FFFFFF', isLarge: true },
  ];

  const results = colorCombinations.map((combo) => {
    const ratio = getContrastRatio(combo.fg, combo.bg);
    const meetsAA = meetsWCAGAA(ratio, combo.isLarge);
    const meetsAAA = meetsWCAGAAA(ratio, combo.isLarge);

    return {
      ...combo,
      ratio: ratio.toFixed(2),
      meetsAA,
      meetsAAA,
      status: meetsAA ? '✓ Pass' : '✗ Fail',
    };
  });

  return results;
}

/**
 * Get accessible text color for a given background
 * Returns either black or white depending on which has better contrast
 */
export function getAccessibleTextColor(backgroundColor: string): '#000000' | '#FFFFFF' {
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundColor);
  const blackContrast = getContrastRatio('#000000', backgroundColor);

  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
}

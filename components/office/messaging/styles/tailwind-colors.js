/**
 * Tailwind Color Extensions for Office Messaging
 * 
 * Professional blue color scheme for the messaging system
 * Requirements: 22.6, 22.7
 * 
 * Usage: Add to tailwind.config.ts extend.colors
 */

module.exports = {
  // Primary Blues (Professional Theme)
  'messaging-blue': {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main brand blue
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Status Colors
  'messaging-status': {
    sent: '#90CAF9',
    delivered: '#64B5F6',
    read: '#2196F3',
    failed: '#F44336',
  },

  // Priority Colors
  'messaging-priority': {
    normal: '#9E9E9E',
    important: '#FF9800',
    urgent: '#F44336',
  },

  // Background Colors
  'messaging-bg': {
    primary: '#FFFFFF',
    secondary: '#F5F7FA',
    glass: 'rgba(255, 255, 255, 0.7)',
    'glass-dark': 'rgba(0, 0, 0, 0.05)',
  },

  // Text Colors
  'messaging-text': {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
  },
};

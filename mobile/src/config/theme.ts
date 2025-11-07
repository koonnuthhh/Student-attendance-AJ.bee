/**
 * Theme Configuration
 * 
 * This file centralizes all UI styling constants for easy customization.
 * Modify values here to change the entire app's appearance.
 */

export const theme = {
  // Color Palette - Easily customize your brand colors
  colors: {
    // Primary colors
    primary: '#2196F3',        // Main brand color
    primaryDark: '#1976D2',    // Darker shade for pressed states
    primaryLight: '#BBDEFB',   // Lighter shade for backgrounds
    
    // Secondary colors
    secondary: '#4CAF50',      // Accent color
    secondaryDark: '#388E3C',
    secondaryLight: '#C8E6C9',
    
    // Status colors
    success: '#4CAF50',        // Success messages/indicators
    warning: '#FF9800',        // Warning messages
    error: '#F44336',          // Error messages
    info: '#2196F3',           // Info messages
    
    // Attendance status colors (for easy customization)
    attendancePresent: '#4CAF50',
    attendanceAbsent: '#F44336',
    attendanceLate: '#FF9800',
    attendanceExcused: '#9C27B0',
    attendanceLeave: '#607D8B',
    
    // Neutral colors
    background: '#F5F5F5',     // App background
    surface: '#FFFFFF',        // Card/surface background
    text: '#212121',           // Primary text
    textSecondary: '#757575',  // Secondary text
    textLight: '#BDBDBD',      // Disabled/placeholder text
    border: '#E0E0E0',         // Border color
    divider: '#EEEEEE',        // Divider lines
    
    // Overlay colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.15)',
  },

  // Typography - Font sizes and weights
  typography: {
    // Font sizes
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 28,
      display: 32,
    },
    
    // Font weights
    fontWeight: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    
    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
    },
  },

  // Spacing - Consistent spacing throughout the app
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  // Border radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  // Shadows
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },

  // Component-specific sizes
  components: {
    button: {
      height: {
        sm: 32,
        md: 44,
        lg: 52,
      },
      paddingHorizontal: {
        sm: 12,
        md: 16,
        lg: 24,
      },
    },
    input: {
      height: {
        sm: 36,
        md: 44,
        lg: 52,
      },
      paddingHorizontal: 12,
    },
    card: {
      padding: 16,
      borderRadius: 12,
    },
    listItem: {
      height: 60,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
  },

  // Animation durations (in milliseconds)
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
  },

  // Layout constants
  layout: {
    screenPadding: 16,
    maxContentWidth: 800,
    headerHeight: 56,
    tabBarHeight: 60,
  },
};

// Type for TypeScript autocomplete
export type Theme = typeof theme;

// Helper function to get color with opacity
export const withOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export default theme;

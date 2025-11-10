/**
 * Theme Configuration with Dark Mode Support
 * 
 * This file centralizes all UI styling constants for easy customization.
 * Modify values here to change the entire app's appearance.
 * Supports both light and dark mode with your custom brand colors.
 */

// Your custom brand colors
const brandColors = {
  primary: 'rgb(130, 23, 25)',     // Your main brand color
  primaryDark: 'rgb(100, 18, 20)',  // Darker shade for pressed states
  primaryLight: 'rgb(160, 28, 30)', // Lighter shade for hover states
  secondary: '#FFFFFF',              // White as secondary
  white: '#FFFFFF',
  black: '#000000',
} as const;

// Light theme colors
const lightColors = {
  // Primary colors
  primary: brandColors.primary,
  primaryDark: brandColors.primaryDark,
  primaryLight: brandColors.primaryLight,
  
  // Secondary colors
  secondary: brandColors.secondary,
  secondaryDark: '#F5F5F5',
  secondaryLight: '#FAFAFA',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Attendance status colors (easy to customize)
  attendancePresent: '#4CAF50',
  attendanceAbsent: '#F44336',
  attendanceLate: '#FF9800',
  attendanceExcused: '#9C27B0',
  attendanceLeave: '#607D8B',
  
  // Neutral colors for light theme
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F5',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textLight: '#999999',
  textInverse: '#FFFFFF',
  border: '#E5E5E5',
  divider: '#F0F0F0',
  
  // Interactive states
  hover: 'rgba(130, 23, 25, 0.08)',
  pressed: 'rgba(130, 23, 25, 0.12)',
  disabled: '#CCCCCC',
  disabledText: '#AAAAAA',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.15)',
} as const;

// Dark theme colors
const darkColors = {
  // Primary colors (same as light)
  primary: brandColors.primary,
  primaryDark: brandColors.primaryDark,
  primaryLight: brandColors.primaryLight,
  
  // Secondary colors
  secondary: brandColors.secondary,
  secondaryDark: '#E0E0E0',
  secondaryLight: '#F5F5F5',
  
  // Status colors (same as light)
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Attendance status colors (same as light)
  attendancePresent: '#4CAF50',
  attendanceAbsent: '#F44336',
  attendanceLate: '#FF9800',
  attendanceExcused: '#9C27B0',
  attendanceLeave: '#607D8B',
  
  // Neutral colors for dark theme
  background: '#121212',
  surface: '#1E1E1E',
  surfaceSecondary: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textLight: '#808080',
  textInverse: '#ffffffff',  // Added textInverse for dark theme
  border: '#333333',
  divider: '#2A2A2A',
  
  // Interactive states
  hover: 'rgba(255, 255, 255, 0.08)',
  pressed: 'rgba(255, 255, 255, 0.12)',
  disabled: '#444444',
  disabledText: '#666666',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
} as const;

// Typography configuration
const typography = {
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
} as const;

// Spacing configuration
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// Border radius configuration
const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Shadow configuration
const shadows = {
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
} as const;

// Component sizing configuration
const components = {
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
} as const;

// Animation configuration
const animation = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// Layout configuration
const layout = {
  screenPadding: 16,
  maxContentWidth: 800,
  headerHeight: 56,
  tabBarHeight: 60,
} as const;

// Theme creator function
export const createTheme = (isDark: boolean = false) => ({
  colors: isDark ? darkColors : lightColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  components,
  animation,
  layout,
  isDark,
});

// Default themes
export const lightTheme = createTheme(false);
export const darkTheme = createTheme(true);

// Default theme (light)
export const theme = lightTheme;

// Type for TypeScript autocomplete
export type Theme = typeof theme;

// Helper functions for easy color manipulation
export const withOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  if (color.startsWith('rgb(')) {
    const values = color.match(/\d+/g);
    if (values && values.length >= 3) {
      return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`;
    }
  }
  return color;
};

// Get contrasting text color
export const getContrastColor = (backgroundColor: string, theme: Theme): string => {
  if (backgroundColor === theme.colors.primary) {
    return theme.colors.textInverse;
  }
  return theme.colors.text;
};

// Easy color customization - modify these to change the entire app's appearance
export const EASY_CUSTOMIZATION = {
  // Main brand color - change this to update your primary color everywhere
  PRIMARY_COLOR: brandColors.primary,
  
  // Secondary color - change this to update your secondary color everywhere  
  SECONDARY_COLOR: brandColors.secondary,
  
  // Quick color overrides - uncomment and modify to customize specific colors
  // ATTENDANCE_PRESENT_COLOR: '#4CAF50',
  // ATTENDANCE_ABSENT_COLOR: '#F44336',
  // ATTENDANCE_LATE_COLOR: '#FF9800',
  // SUCCESS_COLOR: '#4CAF50',
  // ERROR_COLOR: '#F44336',
  // WARNING_COLOR: '#FF9800',
} as const;

export default theme;

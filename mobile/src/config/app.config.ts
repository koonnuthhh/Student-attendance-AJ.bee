/**
 * Application Configuration
 * 
 * This file contains all configurable settings for the mobile app.
 * Modify these values to customize the app behavior without changing code.
 */

export const APP_CONFIG = {
  // API Configuration
  api: {
    // Base URL for the backend API (change this to your server URL)
    baseURL: 'http://localhost:3000/api',
    
    // Request timeout in milliseconds
    timeout: 30000,
    
    // Enable request/response logging in development
    enableLogging: __DEV__,
  },

  // WebSocket Configuration
  websocket: {
    // WebSocket server URL (usually same as API base URL)
    url: 'http://localhost:3000',
    
    // Enable WebSocket connection
    enabled: true,
    
    // Reconnection settings
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  },

  // Authentication Configuration
  auth: {
    // Storage keys for AsyncStorage
    tokenKey: '@attendance_token',
    userKey: '@attendance_user',
    
    // Auto-logout on 401 responses
    autoLogoutOn401: true,
  },

  // Attendance Configuration
  attendance: {
    // Default status options
    statusOptions: [
      { value: 'present', label: 'Present', color: '#4caf50', icon: '✅' },
      { value: 'absent', label: 'Absent', color: '#f44336', icon: '❌' },
      { value: 'late', label: 'Late', color: '#ff9800', icon: '🕐' },
      { value: 'excused', label: 'Excused', color: '#2196f3', icon: '📋' },
    ],
    
    // QR code settings
    qr: {
      // Enable geolocation capture when scanning QR
      captureLocation: true,
      
      // Show success message after marking attendance
      showSuccessAlert: true,
    },
  },

  // UI Configuration
  ui: {
    // Enable pull-to-refresh on lists
    enablePullToRefresh: true,
    
    // Animation duration for transitions
    animationDuration: 300,
    
    // Show loading indicators
    showLoadingIndicators: true,
    
    // Date format for display
    dateFormat: 'MMM dd, yyyy',
    
    // Time format for display
    timeFormat: 'HH:mm',
  },

  // Feature Flags
  features: {
    // Enable offline mode (requires offline support implementation)
    offlineMode: false,
    
    // Enable push notifications
    pushNotifications: false,
    
    // Enable biometric authentication
    biometricAuth: false,
    
    // Enable dark mode
    darkMode: false,
  },

  // Validation Rules
  validation: {
    // Email regex pattern
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    
    // Minimum password length
    minPasswordLength: 6,
    
    // Date format for inputs (YYYY-MM-DD)
    datePattern: /^\d{4}-\d{2}-\d{2}$/,
    
    // Time format for inputs (HH:MM)
    timePattern: /^([01]\d|2[0-3]):([0-5]\d)$/,
  },

  // Error Messages
  errorMessages: {
    network: 'Network error. Please check your internet connection.',
    unauthorized: 'Session expired. Please login again.',
    serverError: 'Server error. Please try again later.',
    validationError: 'Please check your input and try again.',
    genericError: 'Something went wrong. Please try again.',
  },

  // Success Messages
  successMessages: {
    loginSuccess: 'Login successful!',
    registerSuccess: 'Registration successful! Please verify your email.',
    attendanceMarked: 'Attendance marked successfully!',
    classCreated: 'Class created successfully!',
    sessionCreated: 'Session created successfully!',
  },
};

// Export individual configurations for convenience
export const { api, websocket, auth, attendance, ui, features, validation, errorMessages, successMessages } = APP_CONFIG;

// Helper function to get API URL
export const getApiUrl = () => APP_CONFIG.api.baseURL;

// Helper function to get WebSocket URL
export const getWebSocketUrl = () => APP_CONFIG.websocket.url;

// Helper function to check if feature is enabled
export const isFeatureEnabled = (feature: keyof typeof APP_CONFIG.features) => {
  return APP_CONFIG.features[feature];
};

// Helper function to validate email
export const validateEmail = (email: string): boolean => {
  return APP_CONFIG.validation.emailPattern.test(email);
};

// Helper function to validate password
export const validatePassword = (password: string): boolean => {
  return password.length >= APP_CONFIG.validation.minPasswordLength;
};

// Helper function to validate date
export const validateDate = (date: string): boolean => {
  return APP_CONFIG.validation.datePattern.test(date);
};

// Helper function to validate time
export const validateTime = (time: string): boolean => {
  return APP_CONFIG.validation.timePattern.test(time);
};

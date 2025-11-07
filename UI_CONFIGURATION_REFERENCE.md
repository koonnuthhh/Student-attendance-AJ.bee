# UI Configuration Reference

Complete reference for customizing the mobile app UI without code changes.

## Table of Contents
1. [Theme Configuration](#theme-configuration)
2. [App Configuration](#app-configuration)
3. [Component Customization](#component-customization)
4. [Color Schemes](#color-schemes)
5. [Typography](#typography)
6. [Spacing & Layout](#spacing--layout)
7. [Common Customizations](#common-customizations)

---

## Theme Configuration

**File**: `mobile/src/config/theme.ts`

### Colors

```typescript
colors: {
  // Primary colors
  primary: '#4A90E2',           // Main brand color
  primaryLight: '#7FB3F0',      // Lighter variant
  primaryDark: '#2E5A8E',       // Darker variant
  
  // Secondary colors
  secondary: '#50E3C2',         // Accent color
  secondaryLight: '#7FEDD5',    // Lighter variant
  secondaryDark: '#2BA589',     // Darker variant
  
  // Semantic colors
  success: '#4CAF50',           // Success states
  warning: '#FF9800',           // Warning states
  error: '#F44336',             // Error states
  info: '#2196F3',              // Info states
  
  // Neutral colors
  background: '#F5F7FA',        // App background
  surface: '#FFFFFF',           // Card/surface background
  text: '#1A202C',              // Primary text
  textSecondary: '#718096',     // Secondary text
  textDisabled: '#CBD5E0',      // Disabled text
  border: '#E2E8F0',            // Border color
  divider: '#EDF2F7',           // Divider lines
  
  // Attendance status colors
  attendancePresent: '#4CAF50',
  attendanceAbsent: '#F44336',
  attendanceLate: '#FF9800',
  attendanceExcused: '#2196F3',
}
```

### Typography

```typescript
typography: {
  fontSize: {
    xs: 10,                     // Extra small text
    sm: 12,                     // Small text
    base: 14,                   // Base text
    md: 16,                     // Medium text
    lg: 18,                     // Large text
    xl: 20,                     // Extra large text
    xxl: 24,                    // 2X large text
    xxxl: 32,                   // 3X large text
    display: 48,                // Display text
  },
  
  fontWeight: {
    light: '300',               // Light weight
    regular: '400',             // Regular weight
    medium: '500',              // Medium weight
    semibold: '600',            // Semibold weight
    bold: '700',                // Bold weight
  },
  
  lineHeight: {
    tight: 1.2,                 // Tight line height
    normal: 1.5,                // Normal line height
    relaxed: 1.75,              // Relaxed line height
  },
}
```

### Spacing

```typescript
spacing: {
  xs: 4,                        // Extra small spacing
  sm: 8,                        // Small spacing
  md: 16,                       // Medium spacing
  lg: 24,                       // Large spacing
  xl: 32,                       // Extra large spacing
  xxl: 48,                      // 2X large spacing
  xxxl: 64,                     // 3X large spacing
}
```

### Border Radius

```typescript
borderRadius: {
  none: 0,                      // No rounding
  sm: 4,                        // Small rounding
  md: 8,                        // Medium rounding
  lg: 12,                       // Large rounding
  xl: 16,                       // Extra large rounding
  full: 9999,                   // Fully rounded (circle)
}
```

### Shadows

```typescript
shadows: {
  none: {                       // No shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  sm: {                         // Small shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  
  md: {                         // Medium shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  
  lg: {                         // Large shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
}
```

### Animation

```typescript
animation: {
  duration: {
    fast: 150,                  // Fast animation (ms)
    normal: 300,                // Normal animation (ms)
    slow: 500,                  // Slow animation (ms)
  },
}
```

---

## App Configuration

**File**: `mobile/src/config/app.config.ts`

### API Configuration

```typescript
api: {
  baseURL: 'http://localhost:3000',  // Backend API URL
  timeout: 30000,                     // Request timeout (ms)
  enableLogging: __DEV__,             // Log requests in dev
}
```

### WebSocket Configuration

```typescript
websocket: {
  url: 'http://localhost:3000',      // WebSocket server URL
  enabled: true,                      // Enable WebSocket
  reconnectionAttempts: 5,            // Max reconnect attempts
  reconnectionDelay: 1000,            // Delay between attempts (ms)
}
```

### Authentication

```typescript
auth: {
  tokenKey: '@attendance_token',     // Storage key for token
  userKey: '@attendance_user',       // Storage key for user
  autoLogoutOn401: true,              // Auto-logout on 401
}
```

### Attendance Configuration

```typescript
attendance: {
  statusOptions: [
    { 
      value: 'present',               // Status value
      label: 'Present',               // Display label
      color: '#4caf50',               // Status color
      icon: '✅'                      // Status icon
    },
    { value: 'absent', label: 'Absent', color: '#f44336', icon: '❌' },
    { value: 'late', label: 'Late', color: '#ff9800', icon: '🕐' },
    { value: 'excused', label: 'Excused', color: '#2196f3', icon: '📋' },
  ],
  
  qr: {
    captureLocation: true,            // Capture GPS on QR scan
    showSuccessAlert: true,           // Show success message
  },
}
```

### UI Preferences

```typescript
ui: {
  enablePullToRefresh: true,          // Enable pull-to-refresh
  animationDuration: 300,             // Animation duration (ms)
  showLoadingIndicators: true,        // Show loading spinners
  dateFormat: 'MMM dd, yyyy',         // Date display format
  timeFormat: 'HH:mm',                // Time display format
}
```

### Feature Flags

```typescript
features: {
  offlineMode: false,                 // Enable offline support
  pushNotifications: false,           // Enable push notifications
  biometricAuth: false,               // Enable biometric login
  darkMode: false,                    // Enable dark mode
}
```

### Validation Rules

```typescript
validation: {
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,  // Email regex
  minPasswordLength: 6,                         // Min password length
  datePattern: /^\d{4}-\d{2}-\d{2}$/,          // Date format (YYYY-MM-DD)
  timePattern: /^([01]\d|2[0-3]):([0-5]\d)$/,  // Time format (HH:MM)
}
```

### Error Messages

```typescript
errorMessages: {
  network: 'Network error. Please check your internet connection.',
  unauthorized: 'Session expired. Please login again.',
  serverError: 'Server error. Please try again later.',
  validationError: 'Please check your input and try again.',
  genericError: 'Something went wrong. Please try again.',
}
```

### Success Messages

```typescript
successMessages: {
  loginSuccess: 'Login successful!',
  registerSuccess: 'Registration successful! Please verify your email.',
  attendanceMarked: 'Attendance marked successfully!',
  classCreated: 'Class created successfully!',
  sessionCreated: 'Session created successfully!',
}
```

---

## Component Customization

### Button Variants

```tsx
// Primary button (default)
<Button title="Primary" variant="primary" />
// Background: theme.colors.primary
// Text: white

// Secondary button
<Button title="Secondary" variant="secondary" />
// Background: theme.colors.secondary
// Text: white

// Outline button
<Button title="Outline" variant="outline" />
// Background: transparent
// Border: theme.colors.primary
// Text: theme.colors.primary

// Ghost button
<Button title="Ghost" variant="ghost" />
// Background: transparent
// Text: theme.colors.primary

// Danger button
<Button title="Danger" variant="danger" />
// Background: theme.colors.error
// Text: white
```

### Card Variants

```tsx
// Default card
<Card variant="default">
  {/* Content */}
</Card>
// Background: theme.colors.surface
// Border: none
// Shadow: theme.shadows.md

// Outline card
<Card variant="outline">
  {/* Content */}
</Card>
// Background: theme.colors.surface
// Border: 1px solid theme.colors.border
// Shadow: none

// Shadow card
<Card variant="shadow">
  {/* Content */}
</Card>
// Background: theme.colors.surface
// Border: none
// Shadow: theme.shadows.lg
```

### Input Styles

```tsx
// Basic input
<Input 
  label="Email" 
  value={email}
  onChangeText={setEmail}
/>

// Input with error
<Input 
  label="Email" 
  value={email}
  onChangeText={setEmail}
  error="Invalid email format"
/>
// Border: theme.colors.error
// Error text: theme.colors.error

// Secure input (password)
<Input 
  label="Password" 
  value={password}
  onChangeText={setPassword}
  secureTextEntry
/>
```

---

## Color Schemes

### Light Theme (Default)

```typescript
colors: {
  primary: '#4A90E2',
  secondary: '#50E3C2',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#1A202C',
  textSecondary: '#718096',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
}
```

### Dark Theme (Example)

```typescript
colors: {
  primary: '#7FB3F0',
  secondary: '#7FEDD5',
  background: '#1A202C',
  surface: '#2D3748',
  text: '#F7FAFC',
  textSecondary: '#CBD5E0',
  success: '#68D391',
  error: '#FC8181',
  warning: '#F6AD55',
}
```

### Brand Color Schemes

#### Blue & Orange
```typescript
primary: '#2196F3',
secondary: '#FF9800',
```

#### Purple & Green
```typescript
primary: '#9C27B0',
secondary: '#4CAF50',
```

#### Teal & Pink
```typescript
primary: '#009688',
secondary: '#E91E63',
```

---

## Typography

### Font Size Scale

| Size | Value | Use Case |
|------|-------|----------|
| xs | 10px | Captions, labels |
| sm | 12px | Small text, metadata |
| base | 14px | Body text, inputs |
| md | 16px | Emphasized body text |
| lg | 18px | Subheadings |
| xl | 20px | Headings |
| xxl | 24px | Large headings |
| xxxl | 32px | Page titles |
| display | 48px | Display text |

### Font Weight Scale

| Weight | Value | Use Case |
|--------|-------|----------|
| light | 300 | Light text |
| regular | 400 | Body text |
| medium | 500 | Emphasized text |
| semibold | 600 | Subheadings |
| bold | 700 | Headings, buttons |

---

## Spacing & Layout

### Spacing Scale

| Size | Value | Use Case |
|------|-------|----------|
| xs | 4px | Tight spacing |
| sm | 8px | Compact spacing |
| md | 16px | Standard spacing |
| lg | 24px | Loose spacing |
| xl | 32px | Section spacing |
| xxl | 48px | Large gaps |
| xxxl | 64px | Page sections |

### Common Layouts

#### Screen Padding
```typescript
padding: theme.spacing.md // 16px
```

#### Card Padding
```typescript
padding: theme.spacing.lg // 24px
```

#### Button Padding
```typescript
paddingVertical: theme.spacing.sm // 8px
paddingHorizontal: theme.spacing.md // 16px
```

#### List Item Spacing
```typescript
marginBottom: theme.spacing.sm // 8px
```

---

## Common Customizations

### Change Primary Brand Color

```typescript
// theme.ts
colors: {
  primary: '#YOUR_COLOR',
  primaryLight: '#LIGHTER_VARIANT',
  primaryDark: '#DARKER_VARIANT',
}
```

### Change Attendance Status Colors

```typescript
// app.config.ts
attendance: {
  statusOptions: [
    { value: 'present', label: 'Present', color: '#YOUR_COLOR', icon: '✅' },
    // ... more statuses
  ],
}
```

### Add New Attendance Status

```typescript
// app.config.ts
attendance: {
  statusOptions: [
    // ... existing statuses
    { 
      value: 'sick', 
      label: 'Sick', 
      color: '#9C27B0', 
      icon: '🤒' 
    },
  ],
}
```

### Change Font Sizes Globally

```typescript
// theme.ts
typography: {
  fontSize: {
    base: 16, // Increase base font size
    md: 18,
    lg: 20,
    // ... adjust other sizes proportionally
  },
}
```

### Change Spacing Scale

```typescript
// theme.ts
spacing: {
  xs: 6,   // Increase from 4
  sm: 12,  // Increase from 8
  md: 20,  // Increase from 16
  // ... adjust other sizes proportionally
}
```

### Change Border Radius

```typescript
// theme.ts
borderRadius: {
  sm: 6,   // More rounded
  md: 12,
  lg: 18,
  // ... adjust other sizes
}
```

### Change Shadow Intensity

```typescript
// theme.ts
shadows: {
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Increase
    shadowOpacity: 0.25,                    // Increase
    shadowRadius: 8,                        // Increase
    elevation: 5,                           // Increase
  },
}
```

### Change Animation Speed

```typescript
// theme.ts
animation: {
  duration: {
    fast: 100,   // Faster
    normal: 200, // Faster
    slow: 300,   // Faster
  },
}
```

### Change Date/Time Format

```typescript
// app.config.ts
ui: {
  dateFormat: 'dd/MM/yyyy',     // European format
  timeFormat: 'hh:mm a',        // 12-hour format with AM/PM
}
```

### Enable Dark Mode

```typescript
// app.config.ts
features: {
  darkMode: true,
}

// theme.ts - Add dark theme colors
colors: {
  primary: '#7FB3F0',
  background: '#1A202C',
  surface: '#2D3748',
  text: '#F7FAFC',
  // ... more dark colors
}
```

---

## Best Practices

1. **Consistency**: Use theme values instead of hardcoded values
2. **Accessibility**: Ensure sufficient color contrast (WCAG AA: 4.5:1 for text)
3. **Spacing**: Use spacing scale consistently for visual harmony
4. **Typography**: Maintain readable font sizes (14px+ for body text)
5. **Colors**: Limit color palette to 2-3 primary colors + neutrals
6. **Testing**: Test on multiple devices and screen sizes

---

## Quick Reference

### Most Common Changes

| What to Change | File | Property |
|----------------|------|----------|
| Primary Color | theme.ts | colors.primary |
| Background Color | theme.ts | colors.background |
| Base Font Size | theme.ts | typography.fontSize.base |
| Standard Spacing | theme.ts | spacing.md |
| API URL | app.config.ts | api.baseURL |
| WebSocket URL | app.config.ts | websocket.url |
| Attendance Colors | app.config.ts | attendance.statusOptions |
| Error Messages | app.config.ts | errorMessages |
| Date Format | app.config.ts | ui.dateFormat |

---

**Tip**: After changing theme.ts or app.config.ts, restart the Expo dev server for changes to take effect.

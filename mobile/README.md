# Student Attendance Mobile App

A React Native mobile application for student attendance tracking with QR code scanning, real-time updates, and offline support.

## 📱 Features

- **Self-Service Registration**: Students register using their existing university/school Student ID
- **Flexible Student IDs**: Support for any Student ID format (3-20 characters)
- **Authentication**: Login/Register with simplified validation
- **Class Management**: Create and manage classes
- **Session Management**: Create sessions with native date/time pickers
- **Attendance Tracking**: Comprehensive attendance view showing all enrolled students
- **5-Digit QR Codes**: Easy-to-type 5-digit QR codes for quick attendance
- **Real-time Updates**: WebSocket integration for live attendance updates
- **Geolocation**: Capture student location during QR check-in
- **Easy Configuration**: Centralized configuration file for customization

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator
- Backend API running (see backend documentation)

### Installation

```bash
cd mobile
npm install
```

### Configuration

Edit `src/config/app.config.ts` to customize the app:

```typescript
export const APP_CONFIG = {
  api: {
    baseURL: 'http://YOUR_SERVER_IP:3000', // Change to your backend URL
    timeout: 30000,
  },
  websocket: {
    url: 'http://YOUR_SERVER_IP:3000', // Change to your backend URL
    enabled: true,
  },
  // ... more configuration options
};
```

**Important**: For physical devices, replace `localhost` with your computer's IP address.

### Running the App

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web (limited features)
npm run web
```

## 🎨 UI Customization

### Theme Configuration

Edit `src/config/theme.ts` to customize colors, typography, and spacing:

```typescript
export const theme = {
  colors: {
    primary: '#4A90E2',        // Change primary color
    secondary: '#50E3C2',      // Change secondary color
    // ... more colors
  },
  typography: {
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      // ... more sizes
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    // ... more spacing
  },
};
```

### Component Variants

Use built-in component variants:

```tsx
// Button variants
<Button title="Primary" variant="primary" />
<Button title="Secondary" variant="secondary" />
<Button title="Outline" variant="outline" />
<Button title="Ghost" variant="ghost" />
<Button title="Danger" variant="danger" />

// Card variants
<Card variant="default" />
<Card variant="outline" />
<Card variant="shadow" />
```

### Attendance Status Colors

Customize attendance status colors in `app.config.ts`:

```typescript
attendance: {
  statusOptions: [
    { value: 'present', label: 'Present', color: '#4caf50', icon: '✅' },
    { value: 'absent', label: 'Absent', color: '#f44336', icon: '❌' },
    { value: 'late', label: 'Late', color: '#ff9800', icon: '🕐' },
    { value: 'excused', label: 'Excused', color: '#2196f3', icon: '📋' },
  ],
}
```

## 📂 Project Structure

```
mobile/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── client.ts     # Axios configuration
│   │   └── index.ts      # API methods
│   ├── components/       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── ListItem.tsx
│   │   └── Loading.tsx
│   ├── config/          # Configuration files
│   │   ├── theme.ts     # Theme configuration
│   │   └── app.config.ts # App configuration
│   ├── contexts/        # React contexts
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── WebSocketContext.tsx # WebSocket connection
│   └── screens/         # App screens
│       ├── LoginScreen.tsx
│       ├── ClassesScreen.tsx
│       ├── SessionsScreen.tsx
│       ├── AttendanceScreen.tsx
│       └── QRScanScreen.tsx
├── App.tsx              # Root component
└── package.json         # Dependencies
```

## 🔧 Configuration Guide

### API Configuration

```typescript
api: {
  baseURL: 'http://localhost:3000',  // Backend API URL
  timeout: 30000,                    // Request timeout (ms)
  enableLogging: __DEV__,            // Log requests in dev mode
}
```

### WebSocket Configuration

```typescript
websocket: {
  url: 'http://localhost:3000',      // WebSocket server URL
  enabled: true,                     // Enable real-time updates
  reconnectionAttempts: 5,           // Max reconnection attempts
  reconnectionDelay: 1000,           // Delay between attempts (ms)
}
```

### Authentication Configuration

```typescript
auth: {
  tokenKey: '@attendance_token',     // AsyncStorage token key
  userKey: '@attendance_user',       // AsyncStorage user key
  autoLogoutOn401: true,             // Auto-logout on 401 responses
}
```

### UI Configuration

```typescript
ui: {
  enablePullToRefresh: true,         // Enable pull-to-refresh
  animationDuration: 300,            // Transition duration (ms)
  showLoadingIndicators: true,       // Show loading spinners
  dateFormat: 'MMM dd, yyyy',        // Date display format
  timeFormat: 'HH:mm',               // Time display format
}
```

### Feature Flags

```typescript
features: {
  offlineMode: false,                // Enable offline support
  pushNotifications: false,          // Enable push notifications
  biometricAuth: false,              // Enable biometric login
  darkMode: false,                   // Enable dark mode
}
```

## 📱 Screens

### Login Screen
- Login/Register toggle with simplified validation
- Student ID input accepts any format (3-20 characters)
- Students use existing university/school Student IDs
- Email & password validation
- Error handling with helpful guidance
- Auto-navigate on success

### Classes Screen
- List all classes
- Create new class
- Navigate to sessions
- Clean interface without teacher-controlled features

### Sessions Screen
- List class sessions
- Create new session with native date/time pickers
- Navigate to attendance
- 5-digit QR code generation for easy student input

### Attendance Screen
- Comprehensive view showing ALL enrolled students
- Default "Absent" status for students who haven't checked in
- Mark attendance (tap to toggle status)
- Real-time updates via WebSocket
- Visual distinction between checked-in and default statuses

### QR Scan Screen
- Scan 5-digit QR codes for quick attendance
- Manual QR code entry option for easy typing
- Capture geolocation
- Success confirmation

## 🔐 Authentication Flow

1. **Student Registration**:
   - Student enters email, name, password, and their existing Student ID
   - Student ID can be any format between 3-20 characters (e.g., "STU001", "2024-CS-123")
   - No teacher-generated codes required
   - System validates Student ID uniqueness
   - Creates student record with provided Student ID

2. **Login Process**:
   - User enters email and password
   - API call to `/auth/login` 
   - Store token and user data in AsyncStorage
   - Update AuthContext state
   - Auto-navigate to Classes screen

3. **API Security**:
   - JWT tokens auto-attached to requests
   - Automatic logout on 401 responses

## 🌐 API Integration

All API methods are in `src/api/index.ts`:

```typescript
// Authentication
await authAPI.login(email, password);
await authAPI.register(email, name, password, role, studentId); // studentId for students

// Classes
await classesAPI.getAll();
await classesAPI.create(name, subject);

// Sessions
await sessionsAPI.getByClass(classId);
await sessionsAPI.create(classId, date, startTime, endTime);

// Attendance
await attendanceAPI.getBySession(sessionId);
await attendanceAPI.bulkMark(sessionId, defaultStatus, overrides);
await attendanceAPI.qrScan(code, studentId, lat, long, accuracy);
```

## 🎯 Real-time Updates

WebSocket integration for live updates:

```typescript
// Subscribe to session updates
subscribeToSession(sessionId);

// Listen for attendance updates
onAttendanceUpdate((data) => {
  console.log('Attendance updated:', data);
});

// Listen for session stats
onSessionStatsUpdate((data) => {
  console.log('Session stats:', data);
});
```

## 📦 Dependencies

- **React Native**: Mobile app framework
- **Expo**: Development platform
- **React Navigation**: Navigation library
- **Axios**: HTTP client
- **AsyncStorage**: Local storage
- **Socket.IO Client**: WebSocket client
- **Expo BarCode Scanner**: QR code scanning
- **Expo Location**: Geolocation

## 🛠️ Development

### Adding a New Screen

1. Create screen component in `src/screens/`
2. Add navigation route in `App.tsx`
3. Update navigation types if using TypeScript

### Adding a New API Endpoint

1. Add method to appropriate API object in `src/api/index.ts`
2. Use the configured Axios client for requests
3. Handle errors consistently

### Creating a Custom Component

1. Create component in `src/components/`
2. Use theme configuration from `src/config/theme.ts`
3. Export from `src/components/index.ts`

## 🐛 Troubleshooting

### Cannot connect to backend

- Check `baseURL` in `app.config.ts`
- Use your computer's IP address, not `localhost` for physical devices
- Ensure backend is running and accessible
- Check firewall settings

### Student Registration Issues

- Ensure Student ID is between 3-20 characters
- Student ID must be unique across the system
- Use existing university/school Student ID format
- No special characters validation - any format accepted

### QR Scanner not working

- Ensure camera permissions are granted
- Test on physical device (simulator may have issues)
- Try manual QR code entry with 5-digit codes
- Check Expo BarCode Scanner documentation

### Attendance not showing all students

- Check if students are properly enrolled in the class
- Refresh the attendance screen (pull down)
- Verify WebSocket connection for real-time updates
- Default status should show as "Absent" for non-checked students

### WebSocket not connecting

- Ensure `websocket.url` matches backend URL
- Check WebSocket server is running
- Verify token is valid

### AsyncStorage errors

- Clear app data and reinstall
- Check storage permissions
- Use `npx react-native-clean-project` if needed

## � Recent Updates

### Student Registration Overhaul
- **Self-Service Registration**: Students now register using their existing university/school Student IDs
- **Flexible ID Format**: Supports any Student ID format between 3-20 characters
- **Simplified Validation**: Removed complex teacher-generated code system
- **Real-world Ready**: Aligns with actual educational institution workflows

### Enhanced User Experience  
- **Native Date/Time Pickers**: Improved session creation with platform-native controls
- **5-Digit QR Codes**: Simplified from complex UUIDs to easy-to-type 5-digit codes
- **Comprehensive Attendance**: Shows ALL enrolled students with default statuses
- **Removed Teacher Overhead**: Eliminated "Generate Student Code" feature

### Technical Improvements
- **Database Migrations**: Smooth transition to new 5-digit code system
- **Backward Compatibility**: API supports both old and new parameter names
- **Enhanced Validation**: Simple but effective Student ID uniqueness checking
- **Cleaner UI**: Removed unused validation components and styling

## �📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Backend API Documentation](../backend/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test on iOS and Android
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

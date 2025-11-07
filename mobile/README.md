# Student Attendance Mobile App

A React Native mobile application for student attendance tracking with QR code scanning, real-time updates, and offline support.

## 📱 Features

- **Authentication**: Login/Register with email verification
- **Class Management**: Create and manage classes
- **Session Management**: Create sessions with date/time
- **Attendance Tracking**: Mark attendance manually or via QR code
- **Real-time Updates**: WebSocket integration for live attendance updates
- **Geolocation**: Capture student location during QR check-in
- **Offline Support**: Work offline and sync when connected (coming soon)
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
- Login/Register toggle
- Email & password validation
- Error handling
- Auto-navigate on success

### Classes Screen
- List all classes
- Create new class
- Navigate to sessions

### Sessions Screen
- List class sessions
- Create new session with date/time
- Navigate to attendance

### Attendance Screen
- View attendance records
- Mark attendance (tap to toggle)
- Real-time updates via WebSocket
- Bulk marking support

### QR Scan Screen
- Scan QR code for attendance
- Capture geolocation
- Success confirmation

## 🔐 Authentication Flow

1. User enters credentials on Login screen
2. API call to `/auth/login` or `/auth/register`
3. Store token and user data in AsyncStorage
4. Update AuthContext state
5. Auto-navigate to Classes screen
6. API client auto-attaches token to requests

## 🌐 API Integration

All API methods are in `src/api/index.ts`:

```typescript
// Authentication
await authAPI.login(email, password);
await authAPI.register(email, name, password);

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

### QR Scanner not working

- Ensure camera permissions are granted
- Test on physical device (simulator may have issues)
- Check Expo BarCode Scanner documentation

### WebSocket not connecting

- Ensure `websocket.url` matches backend URL
- Check WebSocket server is running
- Verify token is valid

### AsyncStorage errors

- Clear app data and reinstall
- Check storage permissions
- Use `npx react-native-clean-project` if needed

## 📚 Additional Resources

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

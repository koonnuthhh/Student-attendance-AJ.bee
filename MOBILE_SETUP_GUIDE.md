# Mobile App Setup Guide

Quick guide to get the mobile app running.

## Prerequisites

- Node.js 16+ installed
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator

## Step 1: Install Dependencies

```bash
cd mobile
npm install
```

This will install all required packages including:
- React Native and Expo
- React Navigation
- Axios (API client)
- Socket.IO Client (real-time updates)
- AsyncStorage (local storage)
- QR Scanner and Location services

## Step 2: Configure Backend URL

Edit `src/config/app.config.ts`:

```typescript
export const APP_CONFIG = {
  api: {
    baseURL: 'http://YOUR_BACKEND_URL:3000', // Change this!
  },
  websocket: {
    url: 'http://YOUR_BACKEND_URL:3000', // Change this!
  },
};
```

**Important**: 
- For iOS Simulator: Use `http://localhost:3000`
- For Android Emulator: Use `http://10.0.2.2:3000`
- For Physical Device: Use your computer's IP address (e.g., `http://192.168.1.100:3000`)

### Find Your Computer's IP Address:

**Windows:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network connection.

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## Step 3: Start the Backend Server

Before running the mobile app, ensure your backend is running:

```bash
cd backend
npm install
npm run start:dev
```

Backend should be accessible at `http://localhost:3000`.

## Step 4: Run the Mobile App

```bash
cd mobile
npm start
```

This opens the Expo Dev Tools in your browser.

### Run on iOS Simulator:
```bash
npm run ios
```
Or press `i` in the terminal.

### Run on Android Emulator:
```bash
npm run android
```
Or press `a` in the terminal.

### Run on Physical Device:
1. Install "Expo Go" app from App Store or Google Play
2. Scan the QR code shown in terminal/browser
3. Make sure your phone and computer are on the same WiFi network

## Step 5: Test the App

### Default Test Account
Create a test account or use the backend seed data:

```bash
cd backend
npm run seed
```

This creates:
- Test teacher account
- Test student accounts
- Sample classes

### Manual Testing Flow:
1. **Register** a new account on the mobile app
2. **Login** with your credentials
3. **Create a class** on the Classes screen
4. **Create a session** for that class
5. **Mark attendance** on the Attendance screen
6. **Scan QR code** (if QR token is generated)

## Troubleshooting

### Cannot connect to backend
- ✅ Check backend is running (`http://localhost:3000`)
- ✅ Verify `baseURL` in `app.config.ts` matches your setup
- ✅ For physical devices, use your computer's IP address, not `localhost`
- ✅ Ensure firewall allows connections on port 3000

### Expo Go app shows network error
- ✅ Phone and computer must be on same WiFi
- ✅ Try using tunnel mode: `expo start --tunnel`
- ✅ Restart Expo dev server

### QR Scanner not working
- ✅ Grant camera permissions when prompted
- ✅ Test on physical device (simulators may not support camera)
- ✅ Ensure adequate lighting

### App crashes on startup
- ✅ Clear Metro bundler cache: `npm start --clear`
- ✅ Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- ✅ Check for TypeScript errors: `npx tsc --noEmit`

### WebSocket not connecting
- ✅ Ensure WebSocket URL in `app.config.ts` matches backend
- ✅ Check backend has WebSocket gateway enabled
- ✅ Verify token is valid (check AsyncStorage)

### AsyncStorage errors
- ✅ Reset app data: Close app, reopen
- ✅ On iOS Simulator: Device > Erase All Content and Settings
- ✅ On Android Emulator: Settings > Apps > Expo Go > Clear Data

## Configuration Options

### Change Primary Color
```typescript
// src/config/theme.ts
export const theme = {
  colors: {
    primary: '#4A90E2', // Your brand color
  },
};
```

### Enable Offline Mode
```typescript
// src/config/app.config.ts
features: {
  offlineMode: true, // Enable offline support
}
```

### Customize Attendance Status
```typescript
// src/config/app.config.ts
attendance: {
  statusOptions: [
    { value: 'present', label: 'Present', color: '#4caf50', icon: '✅' },
    { value: 'absent', label: 'Absent', color: '#f44336', icon: '❌' },
    { value: 'late', label: 'Late', color: '#ff9800', icon: '🕐' },
    { value: 'excused', label: 'Excused', color: '#2196f3', icon: '📋' },
    // Add your own!
  ],
}
```

### Enable Real-time Updates
```typescript
// src/config/app.config.ts
websocket: {
  enabled: true, // Enable WebSocket connection
  url: 'http://YOUR_BACKEND_URL:3000',
}
```

## Next Steps

- ✅ Read `mobile/README.md` for detailed documentation
- ✅ Read `FRONTEND_IMPLEMENTATION_SUMMARY.md` for architecture overview
- ✅ Customize theme in `src/config/theme.ts`
- ✅ Configure app behavior in `src/config/app.config.ts`
- ✅ Build your own screens using the component library

## Development Tips

### Hot Reload
Changes to code automatically reload the app. Shake device to open developer menu.

### Debugging
- **Console logs**: Appear in terminal running `npm start`
- **React DevTools**: Press `Ctrl+D` (Android) or `Cmd+D` (iOS) > Debug Remote JS
- **Expo DevTools**: Access from browser when running `npm start`

### Component Testing
Test components in isolation:
```tsx
// Example test screen
import { Button, Input, Card } from './src/components';

function TestScreen() {
  return (
    <View>
      <Button title="Test" variant="primary" />
      <Input label="Test Input" />
      <Card variant="shadow">
        <Text>Test Card</Text>
      </Card>
    </View>
  );
}
```

## Build for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

### Expo EAS Build (Recommended)
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

Refer to [Expo documentation](https://docs.expo.dev/build/introduction/) for detailed build instructions.

## Support

- **Backend Issues**: See `backend/README.md`
- **Frontend Issues**: See `mobile/README.md`
- **API Documentation**: See `API_REFERENCE.md`
- **Implementation Details**: See `FRONTEND_IMPLEMENTATION_SUMMARY.md`

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS Simulator |
| `npm run android` | Run on Android Emulator |
| `npm run web` | Run in web browser |
| `npm start --clear` | Clear cache and start |

Happy coding! 🚀

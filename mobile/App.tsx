import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { TouchableOpacity, Text, Alert, View, Modal, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { Loading } from './src/components';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import StudentDashboardScreen from './src/screens/StudentDashboardScreen';
import StudentClassDetailScreen from './src/screens/StudentClassDetailScreen';
import StudentProfileScreen from './src/screens/StudentProfileScreen';
import StudentAttendanceHistoryScreen from './src/screens/StudentAttendanceHistoryScreen';
import ClassesScreen from './src/screens/ClassesScreen';
import ClassDetailsScreen from './src/screens/ClassDetailsScreen';
import SessionsScreen from './src/screens/SessionsScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import QRScanScreen from './src/screens/QRScanScreen';
import QRDisplayScreen from './src/screens/QRDisplayScreen';
import LeaveScreen from './src/screens/LeaveScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  const { user, loading, logout } = useAuth();
  const { theme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (loading) {
    return <Loading message="Loading..." />;
  }

  const handleLogout = () => {
    console.log('Logout button clicked');
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    console.log('Logout confirmed');
    setShowLogoutModal(false);
    try {
      await logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const cancelLogout = () => {
    console.log('Logout cancelled');
    setShowLogoutModal(false);
  };

  const LogoutButton = () => (
    <TouchableOpacity
      onPress={handleLogout}
      style={{ marginRight: 15, padding: 5 }}
      activeOpacity={0.7}
    >
      <Text style={{ color: theme.colors.error, fontSize: 16, fontWeight: '600' }}>
        Logout
      </Text>
    </TouchableOpacity>
  );

  const SettingsButton = ({ navigation }: { navigation: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Settings')}
      style={{
        marginRight: 15,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      activeOpacity={0.8}
    >
      <Text style={{ color: theme.colors.textInverse, fontSize: 16, marginRight: 4 }}>
        ⚙️
      </Text>
      <Text style={{ color: theme.colors.textInverse, fontSize: 14, fontWeight: '600' }}>
        Settings
      </Text>
    </TouchableOpacity>
  );

  // Helper function to extract role names from user roles
  const getRoleNames = (user: any) => {
    if (!user?.roles) return [];
    return user.roles.map((role: any) => {
      const roleName = typeof role === 'string' ? role : role?.name;
      return roleName?.toLowerCase();
    }).filter(Boolean);
  };

  const roleNames = getRoleNames(user);
  const isStudent = roleNames.includes('student');
  const isTeacher = roleNames.includes('teacher') || roleNames.includes('admin');
  
  // Debug logging
  console.log('User data:', user);
  console.log('User roles:', user?.roles);
  console.log('Extracted role names:', roleNames);
  console.log('Is student:', isStudent);
  console.log('Is teacher:', isTeacher);
  console.log('Navigation decision: Should show student dashboard?', isStudent);
  
  // If no valid role detected, default to teacher dashboard
  if (user && !isStudent && !isTeacher) {
    console.warn('No valid role detected, defaulting to teacher dashboard');
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        {!user ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
        ) : (
          <>
            {/* Route based on role - Students get student dashboard, everyone else gets teacher dashboard */}
            {isStudent ? (
              <>
                {/* Student Role Screens */}
                <Stack.Screen 
                  name="Dashboard" 
                  component={StudentDashboardScreen}
                  options={({ navigation }) => ({ 
                    title: 'Student Dashboard',
                    headerRight: () => (
                      <View style={{ flexDirection: 'row' }}>
                        <SettingsButton navigation={navigation} />
                        <LogoutButton />
                      </View>
                    )
                  })}
                />
                <Stack.Screen 
                  name="Settings" 
                  component={SettingsScreen}
                  options={{ 
                    title: 'Settings',
                    headerRight: () => <LogoutButton />
                  }}
                />
                <Stack.Screen 
                  name="StudentProfile" 
                  component={StudentProfileScreen}
                  options={{ 
                    title: 'My Profile',
                    headerRight: () => <LogoutButton />
                  }}
                />
                <Stack.Screen 
                  name="StudentAttendanceHistory" 
                  component={StudentAttendanceHistoryScreen}
                  options={{  
                    title: 'Attendance History',
                    headerRight: () => <LogoutButton />
                  }}
                />
                <Stack.Screen 
                  name="ClassDetail" 
                  component={StudentClassDetailScreen}
                  options={{ 
                    title: 'Class Details',
                    headerRight: () => <LogoutButton />
                  }}
                />
                <Stack.Screen 
                  name="QRScan" 
                  component={QRScanScreen}
                  options={{ 
                    title: 'Scan QR Code',
                    headerRight: () => <LogoutButton />
                  }}
                />
              </>
            ) : (
              <>
                {/* Teacher/Admin Role Screens (Default for non-students) */}
                <Stack.Screen 
                  name="Dashboard" 
                  component={DashboardScreen}
                  options={({ navigation }) => ({ 
                    title: 'Teacher Dashboard',
                    headerRight: () => (
                      <View style={{ flexDirection: 'row' }}>
                        <SettingsButton navigation={navigation} />
                        <LogoutButton />
                      </View>
                    )
                  })}
                />
                <Stack.Screen 
                  name="Settings" 
                  component={SettingsScreen}
                  options={{ 
                    title: 'Settings',
                    headerRight: () => <LogoutButton />
                  }}
                />
                <Stack.Screen 
                  name="Classes" 
                  component={ClassesScreen}
                  options={{ 
                    title: 'My Classes',
                    headerRight: () => <LogoutButton />
                  }}
                />
                <Stack.Screen 
                  name="ClassDetails" 
                  component={ClassDetailsScreen}
                  options={{ 
                    title: 'Class Details',
                    headerRight: () => <LogoutButton />
                  }}
                />
                <Stack.Screen 
                  name="Sessions" 
                  component={SessionsScreen}
                  options={{ title: 'Sessions' }}
                />
                <Stack.Screen 
                  name="Attendance" 
                  component={AttendanceScreen}
                  options={{ title: 'Attendance' }}
                />
                <Stack.Screen 
                  name="QRScan" 
                  component={QRScanScreen}
                  options={{ 
                    title: 'Scan QR Code',
                    headerRight: () => <LogoutButton />
                  }}
                />
                <Stack.Screen 
                  name="QRDisplay" 
                  component={QRDisplayScreen}
                  options={{ title: 'Show QR Code' }}
                />
                <Stack.Screen 
                  name="Leave" 
                  component={LeaveScreen}
                  options={{ 
                    title: 'Leave Requests',
                    headerRight: () => <LogoutButton />
                  }}
                />
              </>
            )}
          </>
        )}
      </Stack.Navigator>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Logout</Text>
            <Text style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>
              Are you sure you want to logout?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.colors.secondaryDark }]}
                onPress={cancelLogout}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.logoutButton, { backgroundColor: theme.colors.error }]}
                onPress={confirmLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    // Background color set dynamically
  },
  logoutButton: {
    // Background color set dynamically
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

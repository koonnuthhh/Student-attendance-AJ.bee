import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TextInput, SafeAreaView, ScrollView } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { attendanceAPI } from '../api';
import * as Location from 'expo-location';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function QRScanScreen({ route, navigation }: any) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = createStyles(theme);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: any) => {
    setScanned(true);
    await handleCheckIn(data);
  };

  const handleManualCheckIn = async () => {
    if (!manualCode.trim()) {
      Alert.alert('Error', 'Please enter a check-in code');
      return;
    }
    await handleCheckIn(manualCode.trim());
  };

  const handleCheckIn = async (code: string) => {
    setLoading(true);
    
    try {
      // Validate required data
      if (!code || !code.trim()) {
        Alert.alert('Error', 'No QR code data found');
        setScanned(false);
        return;
      }

      if (!user?.id) {
        Alert.alert('Error', 'Student ID not found. Please log in again.');
        navigation.goBack();
        return;
      }

      console.log('QR Scan attempt:', { code, studentId: user.id });
      
      let lat: number | undefined, long: number | undefined, accuracy: number | undefined;
      
      // Get location if permission granted
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({});
          lat = location.coords.latitude;
          long = location.coords.longitude;
          // Cap accuracy at 999999 meters (999.99 km) to prevent database overflow
          // Database field is now decimal(8,2) so max value is 999999.99
          const rawAccuracy = location.coords.accuracy;
          accuracy = rawAccuracy ? Math.min(rawAccuracy, 999999) : undefined;
        } catch (locationError) {
          console.warn('Could not get location:', locationError);
          // Continue without location
        }
      }
      
      // Mark attendance via QR scan
      const response = await attendanceAPI.qrScan(code, user.id, lat, long, accuracy);
      
      const message = response.message || 'Attendance marked successfully!';
      Alert.alert('Success', message, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error('QR scan error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to mark attendance';
      Alert.alert('Error', errorMessage);
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }
  
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>📷 Camera Access Required</Text>
          <Text style={styles.permissionSubtext}>
            Camera permission is needed to scan QR codes for attendance.
          </Text>
          <Text style={styles.permissionSubtext}>
            You can use manual code entry below as an alternative.
          </Text>
        </View>

        {/* Manual Input for No Camera Access */}
        <ScrollView style={styles.manualContainer} contentContainerStyle={styles.manualContent}>
          <Card style={styles.manualCard}>
            <Text style={styles.manualTitle}>Manual Check-In</Text>
            <Text style={styles.manualSubtitle}>
              Enter the check-in code provided by your teacher
            </Text>
            
              <Input
                placeholder="Enter check-in code"
                value={manualCode}
                onChangeText={setManualCode}
                icon={<Text>🔑</Text>}
                autoCapitalize="characters"
                autoCorrect={false}
                style={styles.codeInput}
              />
            
            <Button
              title={loading ? "Checking In..." : "Check In"}
              onPress={handleManualCheckIn}
              variant="primary"
              disabled={loading || !manualCode.trim()}
              style={styles.checkInButton}
            />
            
            <View style={styles.helpContainer}>
              <Text style={styles.helpTitle}>💡 Need help?</Text>
              <Text style={styles.helpText}>
                • Ask your teacher for the check-in code{'\n'}
                • Make sure you're in the correct class session{'\n'}
                • Code is usually displayed on the projector or whiteboard
              </Text>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Check In</Text>
        <Text style={styles.subtitle}>
          Scan QR code to mark your attendance
        </Text>
      </View>

      {/* QR Scanner - Only when camera permission is granted */}
      <View style={styles.qrContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />
        
        {/* QR Overlay */}
        <View style={styles.qrOverlay}>
          <View style={styles.qrFrame} />
          <Text style={styles.qrInstructions}>
            Position the QR code within the frame
          </Text>
        </View>

        {scanned && (
          <View style={styles.scanAgainContainer}>
            <Button
              title="Tap to Scan Again"
              onPress={() => setScanned(false)}
              variant="primary"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  
  // Permission states
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  permissionSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  
  // Header
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xl + 20, // Account for status bar
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  // QR Scanner
  qrContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  qrOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  qrFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  qrInstructions: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  scanAgainContainer: {
    position: 'absolute',
    bottom: 50,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  
  // Manual Input
  manualContainer: {
    flex: 1,
  },
  manualContent: {
    padding: theme.spacing.lg,
  },
  manualCard: {
    padding: theme.spacing.xl,
  },
  manualTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  manualSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: theme.spacing.xl,
  },
  codeInput: {
    fontSize: 18,
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 2,
  },
  checkInButton: {
    marginBottom: theme.spacing.xl,
  },
  helpContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  helpText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { sessionsAPI } from '../api';
import { theme } from '../config/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function QRDisplayScreen({ route, navigation }: any) {
  const { sessionId, className, sessionDate } = route.params;
  const [qrToken, setQrToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadQRToken();
    // Refresh QR code every 30 seconds
    const interval = setInterval(loadQRToken, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadQRToken = async () => {
    try {
      const data = await sessionsAPI.getQRToken(sessionId);
      setQrToken(data.token || data.code);
    } catch (error: any) {
      console.error('Failed to load QR token:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load QR code');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadQRToken();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Generating QR Code...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Attendance QR Code</Text>
        <Text style={styles.subtitle}>{className}</Text>
        <Text style={styles.date}>
          📅 {new Date(sessionDate).toLocaleDateString()}
        </Text>
      </View>

      {/* Instructions */}
      <Card style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>📱 How to Use</Text>
        <Text style={styles.instructionsText}>
          1. Students should open the app{'\n'}
          2. Tap "Scan QR" button{'\n'}
          3. Point camera at this QR code{'\n'}
          4. Attendance will be marked automatically
        </Text>
      </Card>

      {/* QR Code Display */}
      <Card style={styles.qrCard}>
        {refreshing ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <>
            {/* Actual QR Code */}
            <View style={styles.qrContainer}>
              <QRCode
                value={qrToken}
                size={280}
                color="black"
                backgroundColor="white"
              />
            </View>
            
            {/* Token Display (for manual entry if needed) */}
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenLabel}>Manual Code:</Text>
              <Text style={styles.tokenCode}>{qrToken}</Text>
            </View>
          </>
        )}
      </Card>

      {/* Status Info */}
      <View style={styles.statusInfo}>
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>🔄</Text>
          <Text style={styles.statusText}>Auto-refreshes every 30s</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>⏱️</Text>
          <Text style={styles.statusText}>Valid for 5 minutes</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="🔄 Refresh QR Code"
          onPress={handleRefresh}
          variant="outline"
          disabled={refreshing}
          style={styles.actionButton}
        />
        <Button
          title="📋 View Attendance"
          onPress={() => navigation.navigate('Attendance', { sessionId, sessionDate })}
          variant="primary"
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  date: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  
  // Instructions
  instructionsCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.primaryLight,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  instructionsText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 22,
  },
  
  // QR Code
  qrCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: theme.spacing.lg,
  },
  tokenInfo: {
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    width: '100%',
  },
  tokenLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  tokenCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  
  // Status
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  
  // Actions
  actions: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    width: '100%',
  },
});

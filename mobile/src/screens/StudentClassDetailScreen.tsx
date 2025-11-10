import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button, Card, Loading } from '../components';
import { APP_CONFIG } from '../config/app.config';

interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  attendanceStatus?: 'present' | 'absent' | 'late' | null;
  checkInTime?: string;
  notes?: string;
}

export default function StudentClassDetailScreen({ route, navigation }: any) {
  const { classId, className } = route.params;
  const { user } = useAuth();
  const { theme } = useTheme();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles(theme);

  useEffect(() => {
    navigation.setOptions({ title: className });
    loadData();
  }, [classId, className]);

  const getToken = async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('accessToken');
  };

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadSessions(), loadStudentAttendance()]);
    } catch (error) {
      Alert.alert('Error', 'Failed to load class data');
      console.error('Error loading class data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadSessions = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${APP_CONFIG.api.baseURL}/classes/${classId}/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Loaded sessions:', data);
        setSessions(data);
      } else {
        console.error('Failed to load sessions:', response.status);
        setSessions([]);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setSessions([]);
    }
  };

  const loadStudentAttendance = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${APP_CONFIG.api.baseURL}/students/attendance/class/${classId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded student attendance:', data);
        setStudentAttendance(data);
      } else {
        console.error('Failed to load student attendance:', response.status);
        setStudentAttendance([]);
      }
    } catch (error) {
      console.error('Failed to load student attendance:', error);
      setStudentAttendance([]);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleQRScan = () => {
    navigation.navigate('QRScan', { classId });
  };

  const handleSessionPress = (session: Session) => {
    const isToday = new Date(session.date).toDateString() === new Date().toDateString();
    const attendanceRecord = studentAttendance.find(att => att.session?.id === session.id);
    
    if (isToday && !attendanceRecord) {
      Alert.alert(
        'Join Session',
        `Join today's session?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Scan QR Code', onPress: handleQRScan },
        ]
      );
    } else if (attendanceRecord) {
      Alert.alert(
        'Session Details',
        `Date: ${new Date(session.date).toLocaleDateString()}\nStatus: ${attendanceRecord.status?.toUpperCase() || 'NO RECORD'}\n${attendanceRecord.checkInTime ? `Checked in: ${new Date(attendanceRecord.checkInTime).toLocaleTimeString()}` : ''}\n${attendanceRecord.notes ? `Notes: ${attendanceRecord.notes}` : ''}`
      );
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'present': return theme.colors.success;
      case 'late': return theme.colors.warning;
      case 'absent': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusBackgroundColor = (status: string | null) => {
    switch (status) {
      case 'present': return theme.colors.attendancePresent + '20';
      case 'late': return theme.colors.attendanceLate + '20';
      case 'absent': return theme.colors.attendanceAbsent + '20';
      default: return theme.colors.surface;
    }
  };

  const getStatusText = (session: Session) => {
    const attendanceRecord = studentAttendance.find(att => att.session?.id === session.id);
    const sessionDate = new Date(session.date);
    const today = new Date();
    const isToday = sessionDate.toDateString() === today.toDateString();
    const isFuture = sessionDate > today;
    
    if (attendanceRecord) {
      return attendanceRecord.status?.toUpperCase() || 'NO RECORD';
    }
    
    if (isFuture) return 'UPCOMING';
    if (isToday) return 'TODAY';
    return 'NO RECORD';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Sessions Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Sessions ({sessions.length})</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Sessions List */}
      <View style={styles.sessionsContainer}>
        {sessions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No sessions yet</Text>
            <Text style={styles.emptySubtext}>
              Sessions will appear here once your teacher creates them
            </Text>
          </Card>
        ) : (
          sessions.map((session) => {
            const attendanceRecord = studentAttendance.find(att => att.session?.id === session.id);
            const sessionDate = new Date(session.date);
            const today = new Date();
            const isToday = sessionDate.toDateString() === today.toDateString();
            
            return (
              <TouchableOpacity
                key={session.id}
                onPress={() => handleSessionPress(session)}
              >
                <Card style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionDate}>
                        📅 {sessionDate.toLocaleDateString()}
                      </Text>
                      {session.startTime && (
                        <Text style={styles.sessionTime}>
                          🕐 {session.startTime}
                          {session.endTime && ` - ${session.endTime}`}
                        </Text>
                      )}
                    </View>
                    <View style={styles.sessionStatus}>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusBackgroundColor(attendanceRecord?.status || null) }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: getStatusColor(attendanceRecord?.status || null) }
                        ]}>
                          {(() => {
                            if (attendanceRecord) {
                              return attendanceRecord.status.toLowerCase() === 'present' ? '✅ Present' 
                                   : attendanceRecord.status.toLowerCase() === 'absent' ? '❌ Absent' 
                                   : '🟡 Late';
                            }
                            const isFuture = sessionDate > today;
                            if (isFuture) return '🔵 Upcoming';
                            if (isToday) return '🟢 Today';
                            return '⚪ No Record';
                          })()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {attendanceRecord?.checkInTime && (
                    <Text style={styles.checkInTime}>
                      ✅ Checked in: {new Date(attendanceRecord.checkInTime).toLocaleTimeString()}
                    </Text>
                  )}
                  
                  {attendanceRecord?.notes && (
                    <Text style={styles.attendanceNotes}>
                      📝 {attendanceRecord.notes}
                    </Text>
                  )}
                  
                  {isToday && !attendanceRecord && (
                    <View style={styles.activeSessionBanner}>
                      <Text style={styles.activeSessionText}>
                        🔴 Session today - Tap to join
                      </Text>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  
  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text,
  },
  refreshButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  refreshIcon: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  
  // Empty state
  emptyCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  
  // Sessions
  sessionsContainer: {
    gap: theme.spacing.md,
  },
  sessionCard: {
    padding: theme.spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sessionTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  sessionStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Attendance status styles
  presentBadge: {
    // Background color set dynamically
  },
  presentText: {
    // Color set dynamically
  },
  absentBadge: {
    // Background color set dynamically
  },
  absentText: {
    // Color set dynamically
  },
  lateBadge: {
    // Background color set dynamically
  },
  lateText: {
    // Color set dynamically
  },
  noRecordBadge: {
    // Background color set dynamically
  },
  noRecordText: {
    color: theme.colors.textSecondary,
  },
  
  checkInTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  attendanceNotes: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
  activeSessionBanner: {
    backgroundColor: theme.colors.primary + '20',
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  activeSessionText: {
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium as any,
  },
});
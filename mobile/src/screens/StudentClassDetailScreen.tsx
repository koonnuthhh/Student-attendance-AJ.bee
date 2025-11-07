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
import { Button, Card, Loading } from '../components';
import { theme } from '../config/theme';

interface Session {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'completed';
  attendanceStatus?: 'present' | 'absent' | 'late' | 'excused';
  qrRequired: boolean;
  location?: string;
}

interface ClassDetail {
  id: string;
  name: string;
  subject: string;
  description: string;
  teacher: {
    name: string;
    email: string;
  };
  schedule: {
    days: string[];
    time: string;
    location: string;
  };
  attendanceRate: number;
  totalSessions: number;
  attendedSessions: number;
}

export default function StudentClassDetailScreen({ route, navigation }: any) {
  const { classId, className } = route.params;
  const { user } = useAuth();
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions'>('overview');

  useEffect(() => {
    navigation.setOptions({ title: className });
    loadClassDetail();
  }, [classId, className]);

  const loadClassDetail = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockClassDetail: ClassDetail = {
        id: classId,
        name: className,
        subject: 'Programming Fundamentals',
        description: 'Introduction to computer programming concepts using modern programming languages.',
        teacher: {
          name: 'Dr. Smith',
          email: 'smith@school.edu',
        },
        schedule: {
          days: ['Monday', 'Wednesday', 'Friday'],
          time: '9:00 AM - 10:30 AM',
          location: 'Room 201, Computer Lab',
        },
        attendanceRate: 85,
        totalSessions: 20,
        attendedSessions: 17,
      };

      const mockSessions: Session[] = [
        {
          id: '1',
          name: 'Introduction to Variables',
          date: '2025-11-07',
          startTime: '09:00',
          endTime: '10:30',
          status: 'active',
          qrRequired: true,
          location: 'Room 201',
        },
        {
          id: '2',
          name: 'Control Structures',
          date: '2025-11-05',
          startTime: '09:00',
          endTime: '10:30',
          status: 'completed',
          attendanceStatus: 'present',
          qrRequired: true,
          location: 'Room 201',
        },
        {
          id: '3',
          name: 'Functions and Methods',
          date: '2025-11-03',
          startTime: '09:00',
          endTime: '10:30',
          status: 'completed',
          attendanceStatus: 'late',
          qrRequired: true,
          location: 'Room 201',
        },
        {
          id: '4',
          name: 'Data Structures',
          date: '2025-11-10',
          startTime: '09:00',
          endTime: '10:30',
          status: 'upcoming',
          qrRequired: true,
          location: 'Room 201',
        },
      ];

      setClassDetail(mockClassDetail);
      setSessions(mockSessions);
    } catch (error) {
      Alert.alert('Error', 'Failed to load class details');
      console.error('Error loading class detail:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadClassDetail();
  };

  const handleQRScan = () => {
    navigation.navigate('QRScan', { classId });
  };

  const handleSessionPress = (session: Session) => {
    if (session.status === 'active') {
      Alert.alert(
        'Join Session',
        `Would you like to join "${session.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Scan QR Code', onPress: handleQRScan },
        ]
      );
    } else if (session.status === 'completed') {
      // Show session details or attendance info
      Alert.alert(
        'Session Details',
        `Session: ${session.name}\nStatus: ${session.attendanceStatus?.toUpperCase()}\nDate: ${session.date}`
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return theme.colors.success;
      case 'late': return theme.colors.warning;
      case 'absent': return theme.colors.error;
      case 'excused': return theme.colors.info;
      case 'active': return theme.colors.primary;
      case 'upcoming': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusText = (session: Session) => {
    if (session.status === 'active') return 'Active Now';
    if (session.status === 'upcoming') return 'Upcoming';
    return session.attendanceStatus?.toUpperCase() || 'COMPLETED';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
        <Text style={styles.loadingText}>Loading class details...</Text>
      </View>
    );
  }

  if (!classDetail) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Class not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
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
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sessions' && styles.activeTab]}
          onPress={() => setActiveTab('sessions')}
        >
          <Text style={[styles.tabText, activeTab === 'sessions' && styles.activeTabText]}>
            Sessions
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'overview' ? (
        <>
          {/* Class Info */}
          <Card style={styles.classInfoCard}>
            <Text style={styles.classTitle}>{classDetail.name}</Text>
            <Text style={styles.classSubject}>{classDetail.subject}</Text>
            <Text style={styles.classDescription}>{classDetail.description}</Text>
            
            <View style={styles.teacherInfo}>
              <Text style={styles.sectionTitle}>Instructor</Text>
              <Text style={styles.teacherName}>{classDetail.teacher.name}</Text>
              <Text style={styles.teacherEmail}>{classDetail.teacher.email}</Text>
            </View>
            
            <View style={styles.scheduleInfo}>
              <Text style={styles.sectionTitle}>Schedule</Text>
              <Text style={styles.scheduleText}>
                {classDetail.schedule.days.join(', ')} • {classDetail.schedule.time}
              </Text>
              <Text style={styles.locationText}>{classDetail.schedule.location}</Text>
            </View>
          </Card>

          {/* Attendance Stats */}
          <Card style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Your Attendance</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{classDetail.attendanceRate}%</Text>
                <Text style={styles.statLabel}>Attendance Rate</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{classDetail.attendedSessions}</Text>
                <Text style={styles.statLabel}>Sessions Attended</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{classDetail.totalSessions}</Text>
                <Text style={styles.statLabel}>Total Sessions</Text>
              </View>
            </View>
          </Card>

          {/* Quick Actions */}
          <Card style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Button
              title="Scan QR Code"
              onPress={handleQRScan}
              style={styles.actionButton}
            />
          </Card>
        </>
      ) : (
        /* Sessions List */
        <View style={styles.sessionsContainer}>
          {sessions.map((session) => (
            <TouchableOpacity
              key={session.id}
              onPress={() => handleSessionPress(session)}
            >
              <Card style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionName}>{session.name}</Text>
                    <Text style={styles.sessionDate}>
                      {session.date} • {session.startTime} - {session.endTime}
                    </Text>
                    {session.location && (
                      <Text style={styles.sessionLocation}>{session.location}</Text>
                    )}
                  </View>
                  <View style={styles.sessionStatus}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(session.attendanceStatus || session.status) + '20' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(session.attendanceStatus || session.status) }
                      ]}>
                        {getStatusText(session)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {session.status === 'active' && (
                  <View style={styles.activeSessionBanner}>
                    <Text style={styles.activeSessionText}>
                      🔴 Session is active - Tap to join
                    </Text>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.error,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.surface,
  },
  classInfoCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  classTitle: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  classSubject: {
    fontSize: 16,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  classDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  teacherInfo: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  teacherName: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  teacherEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  scheduleInfo: {},
  scheduleText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  locationText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statsCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  actionsCard: {
    padding: theme.spacing.lg,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
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
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sessionDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  sessionLocation: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  sessionStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.medium as any,
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
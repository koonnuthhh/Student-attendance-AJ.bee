import React, { useEffect, useState, useCallback } from 'react';
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
import { studentsAPI } from '../api';

interface Class {
  id: string;
  name: string;
  subject: string;
  teacher: {
    name: string;
    email: string;
  };
  sessionsToday: number;
  attendanceRate: number;
}

export default function StudentDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalClasses: 0,
    todaySessions: 0,
    overallAttendance: 0,
  });

  const styles = createStyles(theme);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading student classes...');
      
      const enrolledClasses: Class[] = await studentsAPI.getMyClasses();
      console.log('Loaded classes:', enrolledClasses.length);
      
      setClasses(enrolledClasses);
      setStats({
        totalClasses: enrolledClasses.length,
        todaySessions: enrolledClasses.reduce((sum, cls) => sum + cls.sessionsToday, 0),
        overallAttendance: enrolledClasses.length > 0 
          ? Math.round(enrolledClasses.reduce((sum, cls) => sum + cls.attendanceRate, 0) / enrolledClasses.length)
          : 0,
      });
    } catch (error) {
      console.error('Error loading student data:', error);
      Alert.alert('Error', 'Failed to load your classes. Please try again.');
      setClasses([]);
      setStats({ totalClasses: 0, todaySessions: 0, overallAttendance: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStudentData();
  }, [loadStudentData]);

  const handleClassPress = (classItem: Class) => {
    navigation.navigate('ClassDetail', { 
      classId: classItem.id,
      className: classItem.name,
      isStudent: true 
    });
  };

  const handleQRScan = () => {
    navigation.navigate('QRScan');
  };

  const getDisplayStudentId = () => {
    if (user?.studentCode) {
      return user.studentCode;
    }
    return user?.id ? `STU${user.id.slice(-5).toUpperCase()}` : 'N/A';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
        <Text style={styles.loadingText}>Loading your classes...</Text>
      </View>
    );
  }



  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerInfo}>
          <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>Welcome back,</Text>
          <Text style={[styles.studentName, { color: theme.colors.text }]}>{user?.name || 'Student'}</Text>
          <View style={styles.studentIdContainer}>
            <Text style={[styles.studentIdLabel, { color: theme.colors.textSecondary }]}>Student ID:</Text>
            <Text style={[styles.studentIdCode, { color: theme.colors.primary }]}>{getDisplayStudentId()}</Text>
            {!user?.studentCode && (
              <Text style={[styles.temporaryIdNote, { color: theme.colors.textSecondary }]}>(Temporary)</Text>
            )}
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalClasses}</Text>
          <Text style={styles.statLabel}>My Classes</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.todaySessions}</Text>
          <Text style={styles.statLabel}>Today's Sessions</Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.overallAttendance}%</Text>
          <Text style={styles.statLabel}>Attendance Rate</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Button
          title="📱 Scan QR Code"
          onPress={handleQRScan}
          style={styles.primaryAction}
        />
        
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, { flex: 1 }]} 
            onPress={() => navigation.navigate('StudentAttendanceHistory')}
          >
            <Text style={styles.actionCardIcon}>📊</Text>
            <Text style={styles.actionCardLabel}>Attendance History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Classes List */}
      <View style={styles.classesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Classes</Text>
          <Text style={styles.classCount}>{classes.length}</Text>
        </View>
        
        {classes.length === 0 ? (
          <Card style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎓</Text>
            <Text style={styles.emptyStateText}>
              You're not enrolled in any classes yet
            </Text>
            <Text style={styles.emptyStateSubText}>
              {user?.studentCode 
                ? 'Ask your teacher to enroll you in classes'
                : 'Contact your teacher to get your student code'
              }
            </Text>
          </Card>
        ) : (
          classes.map((classItem) => (
            <TouchableOpacity
              key={classItem.id}
              onPress={() => handleClassPress(classItem)}
            >
              <Card style={styles.classCard}>
                <View style={styles.classHeader}>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{classItem.name}</Text>
                    <Text style={styles.classSubject}>{classItem.subject}</Text>
                    <Text style={styles.teacherName}>👨‍🏫 {classItem.teacher.name}</Text>
                  </View>
                  <View style={styles.classStats}>
                    <Text style={[
                      styles.attendanceRate,
                      { color: classItem.attendanceRate >= 80 ? theme.colors.success : theme.colors.warning }
                    ]}>
                      {classItem.attendanceRate}%
                    </Text>
                    <Text style={styles.attendanceLabel}>Attendance</Text>
                  </View>
                </View>
                
                {classItem.sessionsToday > 0 && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>
                      {classItem.sessionsToday} session{classItem.sessionsToday > 1 ? 's' : ''} today
                    </Text>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
  },
  welcomeText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  studentName: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  studentCode: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: 'monospace',
  },
  logoutButton: {
    paddingHorizontal: theme.spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  studentIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  studentIdLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  studentIdCode: {
    fontSize: 14,
    color: theme.colors.primary,
    fontFamily: 'monospace',
    fontWeight: theme.typography.fontWeight.bold as any,
  },
  noStudentId: {
    fontSize: 14,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  temporaryIdNote: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginLeft: theme.spacing.xs,
  },
  studentIdCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primaryLight + '20',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  idCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idCardIcon: {
    marginRight: theme.spacing.md,
  },
  idCardIconText: {
    fontSize: 32,
  },
  idCardInfo: {
    flex: 1,
  },
  idCardTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  idCardCode: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.primary,
    fontFamily: 'monospace',
    marginBottom: theme.spacing.xs,
  },
  idCardSubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
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
  actionsContainer: {
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
  },
  actionGrid: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionCardIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  actionCardLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  classesSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text,
    flex: 1,
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
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  classCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  classSubject: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  teacherName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  classStats: {
    alignItems: 'center',
  },
  attendanceRate: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.success,
  },
  attendanceLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  todayBadge: {
    backgroundColor: theme.colors.warning + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  todayBadgeText: {
    fontSize: 12,
    color: theme.colors.warning,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  primaryAction: {
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  classCount: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.primary,
    backgroundColor: theme.colors.secondary + '30',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  emptyStateIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
});
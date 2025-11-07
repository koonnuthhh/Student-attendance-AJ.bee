import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Loading } from '../components';
import { theme } from '../config/theme';

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
  const { user, logout, setAuthData, token } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    todaySessions: 0,
    overallAttendance: 0,
  });

  useEffect(() => {
    // Debug: Log user object to see what fields are available
    console.log('StudentDashboard - User object:', user);
    console.log('StudentDashboard - User studentCode:', user?.studentCode);
    console.log('StudentDashboard - User roles:', user?.roles);
    
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls when student enrollment endpoints are available
      // For now, showing empty state since student isn't enrolled in any classes yet
      const enrolledClasses: Class[] = [];

      setClasses(enrolledClasses);
      setStats({
        totalClasses: enrolledClasses.length,
        todaySessions: enrolledClasses.reduce((sum, cls) => sum + cls.sessionsToday, 0),
        overallAttendance: enrolledClasses.length > 0 
          ? Math.round(enrolledClasses.reduce((sum, cls) => sum + cls.attendanceRate, 0) / enrolledClasses.length)
          : 0,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load student data');
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    // If user has a studentCode, use it
    if (user?.studentCode) {
      return user.studentCode;
    }
    
    // If user is a student but no studentCode, generate a temporary display ID
    if (user?.roles?.some(role => 
      typeof role === 'string' ? role.toLowerCase() === 'student' : role.name?.toLowerCase() === 'student'
    )) {
      // Use last 8 characters of user ID as backup student ID
      const userId = user.id || 'unknown';
      return `STU${userId.slice(-5).toUpperCase()}`;
    }
    
    return null;
  };

  const handleAssignTestStudentCode = async () => {
    // Temporary function to test student ID display
    if (!user) return;
    
    const testStudentCode = 'DEMO123A';
    const updatedUser = {
      ...user,
      studentCode: testStudentCode
    };
    
    try {
      // Update the auth context with the test student code
      await setAuthData(updatedUser, token!);
      Alert.alert('Test Student ID Assigned', `Student ID: ${testStudentCode}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to assign test student ID');
    }
  };

  const handleViewProfile = () => {
    navigation.navigate('StudentProfile');
  };

  const handleViewAttendanceHistory = () => {
    navigation.navigate('StudentAttendanceHistory');
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.studentName}>{user?.name || 'Student'}</Text>
          {(() => {
            const displayStudentId = getDisplayStudentId();
            if (displayStudentId) {
              return (
                <View style={styles.studentIdContainer}>
                  <Text style={styles.studentIdLabel}>Student ID:</Text>
                  <Text style={styles.studentIdCode}>{displayStudentId}</Text>
                  {!user?.studentCode && (
                    <Text style={styles.temporaryIdNote}>(Temporary)</Text>
                  )}
                </View>
              );
            } else {
              return (
                <View style={styles.studentIdContainer}>
                  <Text style={styles.noStudentId}>
                    Contact teacher for Student ID assignment
                  </Text>
                </View>
              );
            }
          })()}
        </View>
        <Button
          title="Logout"
          variant="ghost"
          onPress={logout}
          style={styles.logoutButton}
        />
      </View>

      {/* Student ID Card */}
      {(() => {
        const displayStudentId = getDisplayStudentId();
        if (displayStudentId) {
          return (
            <Card style={styles.studentIdCard}>
              <View style={styles.idCardContent}>
                <View style={styles.idCardIcon}>
                  <Text style={styles.idCardIconText}>🆔</Text>
                </View>
                <View style={styles.idCardInfo}>
                  <Text style={styles.idCardTitle}>
                    Your Student ID {!user?.studentCode && '(Temporary)'}
                  </Text>
                  <Text style={styles.idCardCode}>{displayStudentId}</Text>
                  <Text style={styles.idCardSubtext}>
                    {user?.studentCode 
                      ? 'Show this ID to your teacher for class enrollment'
                      : 'This is a temporary ID. Contact your teacher to get your official student code.'
                    }
                  </Text>
                </View>
              </View>
            </Card>
          );
        }
        return null;
      })()}

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalClasses}</Text>
          <Text style={styles.statLabel}>Enrolled Classes</Text>
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
          title="Scan QR Code"
          onPress={handleQRScan}
          style={styles.actionButton}
        />
        
        {/* Temporary test button - remove in production */}
        {!user?.studentCode && (
          <Button
            title="🧪 Assign Test Student ID"
            onPress={handleAssignTestStudentCode}
            style={styles.actionButton}
          />
        )}
        
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={handleViewAttendanceHistory}>
            <Text style={styles.actionCardTitle}>📊</Text>
            <Text style={styles.actionCardLabel}>Attendance History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={handleViewProfile}>
            <Text style={styles.actionCardTitle}>👤</Text>
            <Text style={styles.actionCardLabel}>My Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Classes List */}
      <View style={styles.classesSection}>
        <Text style={styles.sectionTitle}>My Classes</Text>
        
        {classes.length === 0 ? (
          <Card style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              You're not enrolled in any classes yet.
            </Text>
            <Text style={styles.emptyStateSubText}>
              Contact your teacher to get your student code.
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
                    <Text style={styles.teacherName}>{classItem.teacher.name}</Text>
                  </View>
                  <View style={styles.classStats}>
                    <Text style={styles.attendanceRate}>
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
  actionCardTitle: {
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
  actionCardLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  profileButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  profileButtonText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  classesSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
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
});
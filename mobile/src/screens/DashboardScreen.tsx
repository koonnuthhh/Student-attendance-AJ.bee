import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { sessionsAPI, attendanceAPI, classesAPI } from '../api';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';

interface DashboardStats {
  todaySessions: number;
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  upcomingSessions: any[];
  totalClasses: number;
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    todaySessions: 0,
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    upcomingSessions: [],
    totalClasses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get all classes for the teacher
      const classes = await classesAPI.getAll();
      const totalClasses = classes.length;
      
      let todaySessions = 0;
      let totalStudents = 0;
      let presentToday = 0;
      let absentToday = 0;
      const upcomingSessions = [];
      
      // Get sessions and attendance data for each class
      for (const classItem of classes) {
        try {
          const sessions = await sessionsAPI.getByClass(classItem.id);
          
          // Count today's sessions and upcoming sessions
          for (const session of sessions) {
            const sessionDate = new Date(session.date).toISOString().split('T')[0];
            const sessionDateTime = new Date(session.date);
            const now = new Date();
            
            if (sessionDate === today) {
              todaySessions++;
              
              // Get attendance for today's sessions
              try {
                const attendance = await attendanceAPI.getBySession(session.id);
                if (attendance && attendance.length > 0) {
                  totalStudents += attendance.length;
                  presentToday += attendance.filter((a: any) => a.status.toLowerCase() === 'present').length;
                  absentToday += attendance.filter((a: any) => a.status.toLowerCase() === 'absent').length;
                }
              } catch (error) {
                console.warn('Failed to get attendance for session:', session.id);
              }
            }
            
            // Get upcoming sessions (future sessions)
            if (sessionDateTime > now && upcomingSessions.length < 5) {
              upcomingSessions.push({
                ...session,
                className: classItem.name,
                classId: classItem.id,
              });
            }
          }
        } catch (error) {
          console.warn('Failed to get sessions for class:', classItem.id);
        }
      }
      
      // Sort upcoming sessions by date
      upcomingSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setStats({
        todaySessions,
        totalStudents,
        presentToday,
        absentToday,
        upcomingSessions: upcomingSessions.slice(0, 5), // Show only next 5 sessions
        totalClasses,
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      // Set default values on error
      setStats({
        todaySessions: 0,
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        upcomingSessions: [],
        totalClasses: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) {
    return <Loading />;
  }

  const styles = createStyles(theme);

  const attendanceRate = stats.totalStudents > 0
    ? ((stats.presentToday / stats.totalStudents) * 100).toFixed(1)
    : '0';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.date}>{new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</Text>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card variant="elevated" style={styles.statCard}>
          <Text style={styles.statValue}>{stats.todaySessions}</Text>
          <Text style={styles.statLabel}>Today's Sessions</Text>
        </Card>

        <Card variant="elevated" style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalClasses}</Text>
          <Text style={styles.statLabel}>Total Classes</Text>
        </Card>

        <View style={[styles.statCard, styles.presentCard]}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {stats.presentToday}
          </Text>
          <Text style={styles.statLabel}>Present Today</Text>
        </View>

        <View style={[styles.statCard, styles.absentCard]}>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>
            {stats.absentToday}
          </Text>
          <Text style={styles.statLabel}>Absent Today</Text>
        </View>
      </View>

      {/* Attendance Rate */}
      <Card variant="elevated" style={styles.rateCard}>
        <Text style={styles.rateLabel}>Today's Attendance Rate</Text>
        <Text style={styles.rateValue}>{attendanceRate}%</Text>
        <View style={styles.rateBar}>
          <View
            style={[
              styles.rateBarFill,
              { width: `${Math.round(parseFloat(attendanceRate))}%` as any },
            ]}
          />
        </View>
      </Card>

      {/* View Classes Button */}
      <TouchableOpacity
        style={styles.viewClassesButton}
        onPress={() => navigation.navigate('Classes' as never)}
      >
        <Text style={styles.viewClassesIcon}>📚</Text>
        <Text style={styles.viewClassesText}>View All Classes</Text>
      </TouchableOpacity>

      {/* Upcoming Sessions */}
      <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
      {stats.upcomingSessions.length > 0 ? (
        <View style={styles.sessionsContainer}>
          {stats.upcomingSessions.map((session, index) => (
            <Card key={`${session.id}-${index}`} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionClass}>{session.className}</Text>
                <Text style={styles.sessionDate}>
                  {new Date(session.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.sessionTime}>
                <Text style={styles.sessionTimeText}>
                  🕐 {session.startTime ? `${session.startTime}${session.endTime ? ` - ${session.endTime}` : ''}` : 'Time not set'}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <Card>
          <Text style={styles.placeholderText}>
            No upcoming sessions scheduled
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  date: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    width: '48%',
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    ...theme.shadows.md,
  },
  presentCard: {
    backgroundColor: theme.colors.surface,
  },
  absentCard: {
    backgroundColor: theme.colors.surface,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Attendance Rate
  rateCard: {
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  rateLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  rateValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  rateBar: {
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  rateBarFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
  },
  
  // Sections
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  
  // View Classes Button
  viewClassesButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.md,
  },
  viewClassesIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  viewClassesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Sessions
  sessionsContainer: {
    marginBottom: theme.spacing.lg,
  },
  sessionCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  sessionClass: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  sessionDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  sessionTime: {
    marginTop: theme.spacing.xs,
  },
  sessionTimeText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  
  // Placeholder
  placeholderText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
});

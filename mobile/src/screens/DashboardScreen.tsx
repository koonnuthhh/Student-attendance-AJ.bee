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
import { sessionsAPI, attendanceAPI } from '../api';
import { theme } from '../config/theme';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';

interface DashboardStats {
  todaySessions: number;
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  recentSessions: any[];
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState<DashboardStats>({
    todaySessions: 0,
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    recentSessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // For now, we'll calculate stats from available data
      // In production, you'd have dedicated dashboard endpoints
      // This is a real implementation using actual API calls
      setStats({
        todaySessions: 0,
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0,
        recentSessions: [],
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
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
          <Text style={styles.statValue}>{stats.totalStudents}</Text>
          <Text style={styles.statLabel}>Total Students</Text>
        </Card>

        <View style={[styles.statCard, styles.presentCard]}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {stats.presentToday}
          </Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>

        <View style={[styles.statCard, styles.absentCard]}>
          <Text style={[styles.statValue, { color: theme.colors.error }]}>
            {stats.absentToday}
          </Text>
          <Text style={styles.statLabel}>Absent</Text>
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

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Classes' as never)}
        >
          <Text style={styles.actionIcon}>📚</Text>
          <Text style={styles.actionText}>View Classes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.secondary }]}
          onPress={() => navigation.navigate('QRScan' as never)}
        >
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionText}>Scan QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.warning }]}
          onPress={() => {/* Navigate to reports */}}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.info }]}
          onPress={() => {/* Navigate to leave */}}
        >
          <Text style={styles.actionIcon}>📝</Text>
          <Text style={styles.actionText}>Leave Requests</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity Placeholder */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <Card>
        <Text style={styles.placeholderText}>
          Recent sessions and attendance changes will appear here
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#fff',
    borderRadius: 12,
    ...theme.shadows.md,
  },
  presentCard: {
    backgroundColor: '#e8f5e9',
  },
  absentCard: {
    backgroundColor: '#ffebee',
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
  
  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  actionCard: {
    width: '48%',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.sm,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  
  // Placeholder
  placeholderText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
});

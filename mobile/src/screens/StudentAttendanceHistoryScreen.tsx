import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Loading } from '../components';
import { theme } from '../config/theme';

interface AttendanceRecord {
  id: string;
  sessionId: string;
  sessionName: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedAt?: string;
  notes?: string;
}

interface FilterOption {
  key: string;
  label: string;
}

export default function StudentAttendanceHistoryScreen({ navigation }: any) {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterOptions: FilterOption[] = [
    { key: 'all', label: 'All' },
    { key: 'present', label: 'Present' },
    { key: 'absent', label: 'Absent' },
    { key: 'late', label: 'Late' },
    { key: 'excused', label: 'Excused' },
  ];

  useEffect(() => {
    loadAttendanceHistory();
  }, []);

  const loadAttendanceHistory = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls when attendance history endpoints are available
      // For now, showing empty state since student has no attendance records yet
      const attendanceHistory: AttendanceRecord[] = [];

      setAttendanceRecords(attendanceHistory);
    } catch (error) {
      Alert.alert('Error', 'Failed to load attendance history');
      console.error('Error loading attendance history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAttendanceHistory();
  };

  const filteredRecords = attendanceRecords.filter(record => 
    selectedFilter === 'all' || record.status === selectedFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return theme.colors.success;
      case 'late': return theme.colors.warning;
      case 'absent': return theme.colors.error;
      case 'excused': return theme.colors.info;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return '✓';
      case 'late': return '⏰';
      case 'absent': return '✗';
      case 'excused': return '📋';
      default: return '?';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleRecordPress = (record: AttendanceRecord) => {
    Alert.alert(
      'Attendance Details',
      `Session: ${record.sessionName}\n` +
      `Class: ${record.className}\n` +
      `Date: ${formatDate(record.date)}\n` +
      `Time: ${formatTime(record.startTime)} - ${formatTime(record.endTime)}\n` +
      `Status: ${record.status.toUpperCase()}\n` +
      (record.markedAt ? `Marked at: ${formatTime(record.markedAt)}\n` : '') +
      (record.notes ? `Notes: ${record.notes}` : ''),
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
        <Text style={styles.loadingText}>Loading attendance history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterTab,
                selectedFilter === option.key && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter(option.key)}
            >
              <Text style={[
                styles.filterTabText,
                selectedFilter === option.key && styles.activeFilterTabText,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Summary Stats */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Attendance Summary</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: theme.colors.success }]}>
              {attendanceRecords.filter(r => r.status === 'present').length}
            </Text>
            <Text style={styles.summaryLabel}>Present</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: theme.colors.warning }]}>
              {attendanceRecords.filter(r => r.status === 'late').length}
            </Text>
            <Text style={styles.summaryLabel}>Late</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: theme.colors.error }]}>
              {attendanceRecords.filter(r => r.status === 'absent').length}
            </Text>
            <Text style={styles.summaryLabel}>Absent</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: theme.colors.info }]}>
              {attendanceRecords.filter(r => r.status === 'excused').length}
            </Text>
            <Text style={styles.summaryLabel}>Excused</Text>
          </View>
        </View>
      </Card>

      {/* Attendance Records List */}
      <ScrollView 
        style={styles.recordsList}
        contentContainerStyle={styles.recordsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredRecords.length === 0 ? (
          <Card style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'all' 
                ? 'No attendance records found' 
                : `No ${selectedFilter} records found`}
            </Text>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <TouchableOpacity
              key={record.id}
              onPress={() => handleRecordPress(record)}
            >
              <Card style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.recordInfo}>
                    <Text style={styles.sessionName}>{record.sessionName}</Text>
                    <Text style={styles.className}>{record.className}</Text>
                    <Text style={styles.recordDate}>
                      {formatDate(record.date)} • {formatTime(record.startTime)} - {formatTime(record.endTime)}
                    </Text>
                  </View>
                  <View style={styles.recordStatus}>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(record.status) + '20' }
                    ]}>
                      <Text style={styles.statusIcon}>
                        {getStatusIcon(record.status)}
                      </Text>
                      <Text style={[
                        styles.statusText,
                        { color: getStatusColor(record.status) }
                      ]}>
                        {record.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
                
                {record.markedAt && (
                  <Text style={styles.markedAtText}>
                    Marked at: {formatTime(record.markedAt)}
                  </Text>
                )}
                
                {record.notes && (
                  <Text style={styles.notesText}>
                    Note: {record.notes}
                  </Text>
                )}
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  filterContainer: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.md,
  },
  filterTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeFilterTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  activeFilterTabText: {
    color: theme.colors.surface,
  },
  summaryCard: {
    margin: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold as any,
    marginBottom: theme.spacing.xs,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  recordsList: {
    flex: 1,
  },
  recordsContent: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  recordCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  recordInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  className: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  recordDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  recordStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  markedAtText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  notesText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
});
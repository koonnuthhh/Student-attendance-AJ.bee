import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { leaveAPI } from '../api';
import { theme } from '../config/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';

const LEAVE_TYPES = [
  { value: 'sick', label: 'Sick Leave', icon: '🤒' },
  { value: 'personal', label: 'Personal Leave', icon: '👤' },
  { value: 'emergency', label: 'Emergency Leave', icon: '🚨' },
  { value: 'vacation', label: 'Vacation', icon: '🏖️' },
];

const STATUS_CONFIG = {
  pending: { color: '#FF9800', label: 'Pending', icon: '⏳' },
  approved: { color: '#4CAF50', label: 'Approved', icon: '✅' },
  rejected: { color: '#F44336', label: 'Rejected', icon: '❌' },
  cancelled: { color: '#9E9E9E', label: 'Cancelled', icon: '🚫' },
};

export default function LeaveScreen() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Form state
  const [leaveType, setLeaveType] = useState('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const data = await leaveAPI.getAll();
      setLeaves(data);
    } catch (error) {
      console.error('Failed to load leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitLeave = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await leaveAPI.create(leaveType, startDate, endDate, reason);
      setModalVisible(false);
      resetForm();
      await loadLeaves();
      Alert.alert('Success', 'Leave request submitted successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit leave');
    }
  };

  const approveLeave = async (id: string) => {
    Alert.alert(
      'Approve Leave',
      'Do you want to approve this leave request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              await leaveAPI.approve(id);
              await loadLeaves();
              Alert.alert('Success', 'Leave approved');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to approve');
            }
          },
        },
      ]
    );
  };

  const rejectLeave = async (id: string) => {
    Alert.alert(
      'Reject Leave',
      'Do you want to reject this leave request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveAPI.reject(id);
              await loadLeaves();
              Alert.alert('Success', 'Leave rejected');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to reject');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setLeaveType('sick');
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const filteredLeaves = filterStatus === 'all'
    ? leaves
    : leaves.filter((l) => l.status === filterStatus);

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leave Requests</Text>
        <Button
          title="+ New Request"
          onPress={() => setModalVisible(true)}
          variant="primary"
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterButtonText, filterStatus === 'all' && styles.filterButtonTextActive]}>
            All ({leaves.length})
          </Text>
        </TouchableOpacity>
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const count = leaves.filter((l) => l.status === status).length;
          return (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, filterStatus === status && styles.filterButtonActive]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.filterButtonText, filterStatus === status && styles.filterButtonTextActive]}>
                {config.icon} {config.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Leave List */}
      <FlatList
        data={filteredLeaves}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const statusConfig = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
          const leaveTypeConfig = LEAVE_TYPES.find((t) => t.value === item.type);
          
          return (
            <Card style={styles.leaveCard}>
              <View style={styles.leaveHeader}>
                <View>
                  <Text style={styles.leaveType}>
                    {leaveTypeConfig?.icon} {leaveTypeConfig?.label || item.type}
                  </Text>
                  <Text style={styles.leaveDates}>
                    {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig?.color }]}>
                  <Text style={styles.statusText}>
                    {statusConfig?.icon} {statusConfig?.label}
                  </Text>
                </View>
              </View>

              {item.reason && (
                <Text style={styles.leaveReason}>📝 {item.reason}</Text>
              )}

              {item.comment && (
                <View style={styles.commentBox}>
                  <Text style={styles.commentLabel}>Admin Comment:</Text>
                  <Text style={styles.commentText}>{item.comment}</Text>
                </View>
              )}

              {/* Action buttons for pending requests (for admin/teacher) */}
              {item.status === 'pending' && (
                <View style={styles.actions}>
                  <Button
                    title="Approve"
                    onPress={() => approveLeave(item.id)}
                    variant="primary"
                    style={styles.actionButton}
                  />
                  <Button
                    title="Reject"
                    onPress={() => rejectLeave(item.id)}
                    variant="outline"
                    style={styles.actionButton}
                  />
                </View>
              )}
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No leave requests found</Text>
            <Text style={styles.emptySubtext}>
              Tap "New Request" to create one
            </Text>
          </View>
        }
      />

      {/* New Leave Request Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>New Leave Request</Text>

              {/* Leave Type Selection */}
              <Text style={styles.label}>Leave Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {LEAVE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      leaveType === type.value && styles.typeButtonActive,
                    ]}
                    onPress={() => setLeaveType(type.value)}
                  >
                    <Text style={styles.typeIcon}>{type.icon}</Text>
                    <Text
                      style={[
                        styles.typeLabel,
                        leaveType === type.value && styles.typeLabelActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Date Inputs */}
              <Text style={styles.label}>Start Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
                icon={<Text>📅</Text>}
              />

              <Text style={styles.label}>End Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={endDate}
                onChangeText={setEndDate}
                icon={<Text>📅</Text>}
              />

              {/* Reason */}
              <Text style={styles.label}>Reason (Optional)</Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Enter reason for leave..."
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  title="Submit"
                  onPress={submitLeave}
                  variant="primary"
                  style={styles.modalButton}
                />
                <Button
                  title="Cancel"
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                  variant="outline"
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },

  // Filters
  filters: {
    marginBottom: theme.spacing.md,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },

  // Leave Card
  leaveCard: {
    marginBottom: theme.spacing.md,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  leaveType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  leaveDates: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaveReason: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  commentBox: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  commentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  actions: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },

  // Empty State
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  typeSelector: {
    marginBottom: theme.spacing.md,
  },
  typeButton: {
    padding: theme.spacing.md,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    minWidth: 100,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  typeLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: theme.spacing.md,
  },
  modalActions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    width: '100%',
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { attendanceAPI } from '../api';
import { theme } from '../config/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', color: '#4caf50', icon: '✅' },
  { value: 'absent', label: 'Absent', color: '#f44336', icon: '❌' },
  { value: 'late', label: 'Late', color: '#ff9800', icon: '🕐' },
  { value: 'excused', label: 'Excused', color: '#2196f3', icon: '📋' },
];

const STATUS_COLORS: Record<string, string> = {
  present: '#4caf50',
  absent: '#f44336',
  late: '#ff9800',
  excused: '#2196f3',
  Present: '#4caf50',
  Absent: '#f44336',
  Late: '#ff9800',
  Excused: '#2196f3',
};

export default function AttendanceScreen({ route }: any) {
  const { sessionId, sessionDate } = route.params;
  const [records, setRecords] = useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [currentNotes, setCurrentNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAttendance();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, filterStatus, searchQuery]);

  const loadAttendance = async () => {
    try {
      const data = await attendanceAPI.getBySession(sessionId);
      setRecords(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(
        (r) => r.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((r) => {
        const fullName = `${r.student.firstName} ${r.student.lastName}`.toLowerCase();
        return fullName.includes(query);
      });
    }

    setFilteredRecords(filtered);
  };

  const bulkMarkAll = async (status: string) => {
    Alert.alert(
      'Bulk Update',
      `Mark all students as ${status}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setLoading(true);
              await attendanceAPI.bulkMark(sessionId, status, []);
              await loadAttendance();
              Alert.alert('Success', `All students marked as ${status}`);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to bulk update');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const toggleStatus = async (recordId: string, currentStatus: string) => {
    setSelectedRecord({ id: recordId, status: currentStatus });
    setModalVisible(true);
  };

  const updateStatus = async (newStatus: string) => {
    try {
      await attendanceAPI.update(sessionId, selectedRecord.id, newStatus, currentNotes || undefined);
      setModalVisible(false);
      setCurrentNotes('');
      await loadAttendance();
      Alert.alert('Success', 'Attendance updated');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update');
    }
  };

  const openNotesModal = (record: any) => {
    setSelectedRecord(record);
    setCurrentNotes(record.note || '');
    setNotesModalVisible(true);
  };

  const saveNotes = async () => {
    try {
      await attendanceAPI.update(sessionId, selectedRecord.id, selectedRecord.status, currentNotes);
      setNotesModalVisible(false);
      setCurrentNotes('');
      await loadAttendance();
      Alert.alert('Success', 'Notes saved');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save notes');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance - {sessionDate}</Text>

      {/* Bulk Actions */}
      <View style={styles.bulkActions}>
        <Text style={styles.sectionTitle}>Bulk Mark:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STATUS_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.bulkButton, { backgroundColor: option.color }]}
              onPress={() => bulkMarkAll(option.value)}
            >
              <Text style={styles.bulkButtonText}>
                {option.icon} All {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <Input
          placeholder="Search students..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon="🔍"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={[styles.filterButtonText, filterStatus === 'all' && styles.filterButtonTextActive]}>
              All ({records.length})
            </Text>
          </TouchableOpacity>
          {STATUS_OPTIONS.map((option) => {
            const count = records.filter((r) => r.status.toLowerCase() === option.value).length;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.filterButton, filterStatus === option.value && styles.filterButtonActive]}
                onPress={() => setFilterStatus(option.value)}
              >
                <Text style={[styles.filterButtonText, filterStatus === option.value && styles.filterButtonTextActive]}>
                  {option.icon} {option.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Attendance List */}
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.recordCard}>
            <View style={styles.recordInfo}>
              <Text style={styles.studentName}>
                {item.student.firstName} {item.student.lastName}
              </Text>
              {item.note && <Text style={styles.notePreview}>📝 {item.note}</Text>}
            </View>
            <View style={styles.recordActions}>
              <TouchableOpacity
                style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}
                onPress={() => toggleStatus(item.id, item.status)}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.notesButton}
                onPress={() => openNotesModal(item)}
              >
                <Text style={styles.notesButtonText}>📝</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        }
      />

      {/* Status Change Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Status</Text>
            {STATUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.statusOption, { backgroundColor: option.color }]}
                onPress={() => updateStatus(option.value)}
              >
                <Text style={styles.statusOptionText}>
                  {option.icon} {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <Button
              title="Cancel"
              variant="outlined"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Notes Modal */}
      <Modal visible={notesModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Notes</Text>
            {selectedRecord && (
              <Text style={styles.modalSubtitle}>
                {selectedRecord.student?.firstName} {selectedRecord.student?.lastName}
              </Text>
            )}
            <TextInput
              style={styles.notesInput}
              placeholder="Add notes here..."
              value={currentNotes}
              onChangeText={setCurrentNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <Button
                title="Save"
                onPress={saveNotes}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Cancel"
                variant="outlined"
                onPress={() => {
                  setNotesModalVisible(false);
                  setCurrentNotes('');
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  
  // Bulk Actions
  bulkActions: { marginBottom: 16 },
  bulkButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  bulkButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  
  // Filters
  filters: { marginBottom: 16 },
  filterButtons: { marginTop: 8 },
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
  
  // Record Card
  recordCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: '500' },
  notePreview: { fontSize: 12, color: '#666', marginTop: 4 },
  recordActions: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  notesButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  notesButtonText: { fontSize: 18 },
  
  // Empty State
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
  
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  statusOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
  },
});

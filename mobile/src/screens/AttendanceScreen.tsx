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
import { attendanceAPI, classesAPI, sessionsAPI } from '../api';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { Input } from '../components/Input';

const STATUS_OPTIONS = [
  { value: 'Present', label: 'Present', color: '#4caf50', icon: '✅' },
  { value: 'Absent', label: 'Absent', color: '#f44336', icon: '❌' },
  { value: 'Late', label: 'Late', color: '#ff9800', icon: '🕐' },
  { value: 'Excused', label: 'Excused', color: '#2196f3', icon: '📋' },
];

const STATUS_COLORS: Record<string, string> = {
  Present: '#4caf50',
  Absent: '#f44336',
  Late: '#ff9800',
  Excused: '#2196f3',
  // Keep lowercase for backward compatibility with existing data
  present: '#4caf50',
  absent: '#f44336',
  late: '#ff9800',
  excused: '#2196f3',
};

export default function AttendanceScreen({ route }: any) {
  const { theme } = useTheme();
  const { sessionId, sessionDate } = route.params;
  const [records, setRecords] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [currentNotes, setCurrentNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState(false);

  const styles = createStyles(theme);

  useEffect(() => {
    loadAttendance();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, filterStatus, searchQuery]);

  const loadAttendance = async () => {
    try {
      // First, get session info to get the classId
      const sessionData = await sessionsAPI.getOne(sessionId);
      setSessionInfo(sessionData);
      
      // Get all students in the class
      const studentsData = await classesAPI.getStudents(sessionData.classId);
      console.log('Raw students data:', studentsData);
      
      // Extract student objects from enrollment records
      const students = studentsData.map((enrollment: any) => enrollment.student);
      console.log('Extracted students:', students);
      setAllStudents(students);
      
      // Get existing attendance records for this session
      const attendanceData = await attendanceAPI.getBySession(sessionId);
      console.log('Attendance data:', attendanceData);
      
      // Create a map of attendance records by student ID for quick lookup
      const attendanceMap = new Map();
      attendanceData.forEach((record: any) => {
        attendanceMap.set(record.student.id, record);
      });
      
      // Create records for all students, using existing attendance or default to absent
      const allRecords = students.map((student: any) => {
        const existingRecord = attendanceMap.get(student.id);
        if (existingRecord) {
          return {
            ...existingRecord,
            isDefault: false
          };
        } else {
          // Create default record for students who haven't checked in
          return {
            id: `default-${student.id}`, // Temporary ID for default records
            student: student,
            status: 'Absent', // Use capitalized status to match backend enum
            note: '',
            isDefault: true, // Flag to identify default records
          };
        }
      });
      
      console.log('Final merged records:', allRecords);
      setRecords(allRecords);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((r) => {
        // Handle both capitalized and lowercase statuses for compatibility
        const recordStatus = r.status.toLowerCase();
        const filterStatusLower = filterStatus.toLowerCase();
        return recordStatus === filterStatusLower;
      });
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
              
              // Create an array of all students with the new status as overrides
              const overrides = allStudents.map(student => ({
                studentId: student.id,
                status: status,
                note: ''
              }));
              
              console.log('Bulk marking students:', {
                sessionId,
                defaultStatus: status,
                overrides: overrides
              });
              
              await attendanceAPI.bulkMark(sessionId, status, overrides);
              await loadAttendance();
              Alert.alert('Success', `All students marked as ${status}`);
            } catch (error: any) {
              console.error('Bulk mark error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to bulk update');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const toggleStatus = async (record: any) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const updateStatus = async (newStatus: string) => {
    try {
      setUpdating(true);
      
      if (selectedRecord.isDefault) {
        // For default records, create a new attendance record using bulk mark
        const overrides = [{
          studentId: selectedRecord.student.id,
          status: newStatus,
          note: currentNotes || ''
        }];
        
        console.log('Creating new attendance record:', {
          sessionId,
          defaultStatus: newStatus,
          overrides: overrides
        });
        
        await attendanceAPI.bulkMark(sessionId, newStatus, overrides);
      } else {
        // For existing records, update them directly
        console.log('Updating existing attendance record:', {
          sessionId,
          recordId: selectedRecord.id,
          status: newStatus,
          notes: currentNotes
        });
        
        await attendanceAPI.update(sessionId, selectedRecord.id, newStatus, currentNotes || undefined);
      }
      
      setModalVisible(false);
      setCurrentNotes('');
      await loadAttendance();
      Alert.alert('Success', 'Attendance updated');
    } catch (error: any) {
      console.error('Update status error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update attendance');
    } finally {
      setUpdating(false);
    }
  };

  const openNotesModal = (record: any) => {
    setSelectedRecord(record);
    setCurrentNotes(record.note || '');
    setNotesModalVisible(true);
  };

  const saveNotes = async () => {
    try {
      setUpdating(true);
      
      if (selectedRecord.isDefault) {
        // For default records, create a new attendance record with current status and notes
        const overrides = [{
          studentId: selectedRecord.student.id,
          status: selectedRecord.status,
          note: currentNotes || ''
        }];
        
        console.log('Creating attendance record with notes:', {
          sessionId,
          defaultStatus: selectedRecord.status,
          overrides: overrides
        });
        
        await attendanceAPI.bulkMark(sessionId, selectedRecord.status, overrides);
      } else {
        // For existing records, update them
        console.log('Updating notes for existing record:', {
          sessionId,
          recordId: selectedRecord.id,
          status: selectedRecord.status,
          notes: currentNotes
        });
        
        await attendanceAPI.update(sessionId, selectedRecord.id, selectedRecord.status, currentNotes);
      }
      
      setNotesModalVisible(false);
      setCurrentNotes('');
      await loadAttendance();
      Alert.alert('Success', 'Notes saved');
    } catch (error: any) {
      console.error('Save notes error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save notes');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loading message="Loading attendance..." />;
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
          icon={<Text>🔍</Text>}
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
            const count = records.filter((r) => {
              // Handle both capitalized and lowercase statuses for compatibility
              return r.status.toLowerCase() === option.value.toLowerCase();
            }).length;
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
          <View style={[
            styles.recordCard,
            item.isDefault && styles.recordCardDefault
          ]}>
            <View style={styles.recordInfo}>
              <Text style={styles.studentName}>
                {item.student.firstName && item.student.lastName 
                  ? `${item.student.firstName} ${item.student.lastName}`
                  : item.student.name || 'Unknown Student'
                }
              </Text>
              {item.student.email && (
                <Text style={styles.studentEmail}>{item.student.email}</Text>
              )}
              {item.student.studentId && (
                <Text style={styles.studentId}>ID: {item.student.studentId}</Text>
              )}
              {item.isDefault && (
                <Text style={styles.notCheckedInIndicator}>Not checked in yet</Text>
              )}
              {item.note && <Text style={styles.notePreview}>📝 {item.note}</Text>}
            </View>
            <View style={styles.recordActions}>
              <TouchableOpacity
                style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}
                onPress={() => toggleStatus(item)}
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
            <Text style={styles.emptyText}>No students found</Text>
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
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.statusOptionText}>
                    {option.icon} {option.label}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
            <Button
              title="Cancel"
              variant="outline"
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
                title={updating ? "Saving..." : "Save"}
                onPress={saveNotes}
                style={{ flex: 1, marginRight: 8 }}
                disabled={updating}
              />
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setNotesModalVisible(false);
                  setCurrentNotes('');
                }}
                style={{ flex: 1 }}
                disabled={updating}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: theme.colors.background },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: theme.colors.text },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: theme.colors.text },
  
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
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  
  // Record Card
  recordCard: {
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recordCardDefault: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  recordInfo: { flex: 1 },
  studentName: { fontSize: 18, fontWeight: '600', color: theme.colors.text },
  studentEmail: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 2 },
  studentId: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 1 },
  notCheckedInIndicator: { 
    fontSize: 14, 
    color: theme.colors.warning || '#ff9800', 
    fontStyle: 'italic',
    marginTop: 4,
    backgroundColor: theme.colors.warningLight || 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  notePreview: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
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
    backgroundColor: theme.colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notesButtonText: { fontSize: 18 },
  
  // Empty State
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: theme.colors.textSecondary },
  
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
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
    color: theme.colors.text,
  },
  modalSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
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
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 16,
    color: theme.colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

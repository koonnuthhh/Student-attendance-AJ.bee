import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform
} from 'react-native';
import { sessionsAPI } from '../api';
import { format } from 'date-fns';

export default function SessionsScreen({ route, navigation }: any) {
  const { classId, className } = route.params;
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Form fields
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Date/time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await sessionsAPI.getByClass(classId);
      setSessions(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === 'web') {
      setShowDatePicker(true);
    } else {
      // For mobile, use Alert.prompt with validation
      Alert.prompt(
        'Select Date',
        'Enter date (YYYY-MM-DD)',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'OK',
            onPress: (text) => {
              if (text && /^\d{4}-\d{2}-\d{2}$/.test(text)) {
                setSessionDate(text);
              } else {
                Alert.alert('Invalid Date', 'Please enter date in YYYY-MM-DD format');
              }
            }
          }
        ],
        'plain-text',
        getTodayDate()
      );
    }
  };

  const openTimePicker = (type: 'start' | 'end') => {
    if (Platform.OS === 'web') {
      if (type === 'start') {
        setShowStartTimePicker(true);
      } else {
        setShowEndTimePicker(true);
      }
    } else {
      Alert.prompt(
        `Select ${type === 'start' ? 'Start' : 'End'} Time`,
        'Enter time (HH:MM)',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'OK',
            onPress: (text) => {
              if (text && /^\d{2}:\d{2}$/.test(text)) {
                if (type === 'start') {
                  setStartTime(text);
                } else {
                  setEndTime(text);
                }
              } else {
                Alert.alert('Invalid Time', 'Please enter time in HH:MM format (24-hour)');
              }
            }
          }
        ],
        'plain-text',
        '09:00'
      );
    }
  };

  const handleCreateSession = async () => {
    if (!sessionDate.trim()) {
      Alert.alert('Error', 'Please enter a date (YYYY-MM-DD)');
      return;
    }

    // Validate date format (basic check)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(sessionDate)) {
      Alert.alert('Error', 'Date must be in YYYY-MM-DD format (e.g., 2025-11-07)');
      return;
    }

    setCreating(true);
    try {
      await sessionsAPI.create(
        classId, 
        sessionDate, 
        startTime || undefined, 
        endTime || undefined
      );
      Alert.alert('Success', 'Session created successfully!');
      setModalVisible(false);
      resetForm();
      loadSessions(); // Reload sessions
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session? This action cannot be undone and will remove all attendance records for this session.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(sessionId);
            try {
              await sessionsAPI.delete(classId, sessionId);
              Alert.alert('Success', 'Session deleted successfully!');
              loadSessions(); // Reload sessions
            } catch (error: any) {
              console.error(error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete session');
            } finally {
              setDeleting(null);
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setSessionDate('');
    setStartTime('');
    setEndTime('');
    setShowDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // Format: HH:MM
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{className} - Sessions</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            setSessionDate(getTodayDate()); // Pre-fill with today's date
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ New Session</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.sessionCard}>
            <TouchableOpacity
              style={styles.sessionInfo}
              onPress={() =>
                navigation.navigate('Attendance', {
                  sessionId: item.id,
                  sessionDate: format(new Date(item.date), 'MMM dd, yyyy'),
                })
              }
            >
              <Text style={styles.sessionDate}>{format(new Date(item.date), 'MMM dd, yyyy')}</Text>
              {item.startTime && (
                <Text style={styles.sessionTime}>
                  {item.startTime}{item.endTime ? ` - ${item.endTime}` : ''}
                </Text>
              )}
            </TouchableOpacity>
            <View style={styles.sessionActions}>
              <TouchableOpacity
                style={styles.qrButton}
                onPress={() =>
                  navigation.navigate('QRDisplay', {
                    sessionId: item.id,
                    className,
                    sessionDate: item.date,
                  })
                }
              >
                <Text style={styles.qrButtonText}>📱 Show QR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, deleting === item.id && styles.deletingButton]}
                onPress={() => handleDeleteSession(item.id)}
                disabled={deleting === item.id}
              >
                {deleting === item.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>DELETE</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sessions yet</Text>
            <Text style={styles.emptySubtext}>Create a session to start taking attendance</Text>
          </View>
        }
      />

      {/* Create Session Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Session</Text>
            <Text style={styles.subtitle}>for {className}</Text>

            <Text style={styles.label}>Date (Required) *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={openDatePicker}
            >
              <Text style={[styles.pickerText, !sessionDate && styles.placeholderText]}>
                {sessionDate || 'Select Date (YYYY-MM-DD)'}
              </Text>
              <Text style={styles.pickerIcon}>📅</Text>
            </TouchableOpacity>

            {Platform.OS === 'web' && showDatePicker && (
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                style={styles.webDateInput}
              />
            )}

            <Text style={styles.label}>Start Time (Optional)</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => openTimePicker('start')}
            >
              <Text style={[styles.pickerText, !startTime && styles.placeholderText]}>
                {startTime || 'Select Start Time (HH:MM)'}
              </Text>
              <Text style={styles.pickerIcon}>🕐</Text>
            </TouchableOpacity>

            {Platform.OS === 'web' && showStartTimePicker && (
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={styles.webTimeInput}
              />
            )}

            <Text style={styles.label}>End Time (Optional)</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => openTimePicker('end')}
            >
              <Text style={[styles.pickerText, !endTime && styles.placeholderText]}>
                {endTime || 'Select End Time (HH:MM)'}
              </Text>
              <Text style={styles.pickerIcon}>🕐</Text>
            </TouchableOpacity>

            {Platform.OS === 'web' && showEndTimePicker && (
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={styles.webTimeInput}
              />
            )}

            <Text style={styles.hint}>
              💡 Tip: Leave times empty if you just want to track the date
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreateSession}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Create</Text>
                )}
              </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: { fontSize: 16, fontWeight: '600' },
  sessionTime: { fontSize: 14, color: '#666', marginTop: 5 },
  sessionActions: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  qrButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
    minWidth: 100,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF5722',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 90,
    justifyContent: 'center',
  },
  deletingButton: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  pickerIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  webDateInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  webTimeInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

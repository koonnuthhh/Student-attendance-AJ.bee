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
  
  // Form fields
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

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
      setSessionDate('');
      setStartTime('');
      setEndTime('');
      loadSessions(); // Reload sessions
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Session</Text>
            <Text style={styles.subtitle}>for {className}</Text>

            <Text style={styles.label}>Date (Required) *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (e.g., 2025-11-07)"
              value={sessionDate}
              onChangeText={setSessionDate}
              autoFocus
            />

            <Text style={styles.label}>Start Time (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM (e.g., 09:00)"
              value={startTime}
              onChangeText={setStartTime}
            />

            <Text style={styles.label}>End Time (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM (e.g., 10:30)"
              value={endTime}
              onChangeText={setEndTime}
            />

            <Text style={styles.hint}>
              💡 Tip: Leave times empty if you just want to track the date
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setSessionDate('');
                  setStartTime('');
                  setEndTime('');
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
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  qrButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrButtonText: {
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

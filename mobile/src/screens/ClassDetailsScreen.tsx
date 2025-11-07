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
  RefreshControl,
} from 'react-native';
import { classesAPI, sessionsAPI } from '../api';
import { theme } from '../config/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';

export default function ClassDetailsScreen({ route, navigation }: any) {
  const { classId, className } = route.params;
  
  // Add error state
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'sessions'>('students');
  const [students, setStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Add Student Modal
  const [addStudentModalVisible, setAddStudentModalVisible] = useState(false);
  const [studentId, setStudentId] = useState('');
  
  // Check-in Modal
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([loadStudents(), loadSessions()]);
    } catch (error: any) {
      console.error('Failed to load class data:', error);
      setError(error.message || 'Failed to load class data');
      Alert.alert('Error', 'Failed to load class data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStudents = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/api/classes/${classId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Backend returns enrollments with nested student objects
        // Transform to flat student objects for easier use in UI
        const studentList = data.map((enrollment: any) => enrollment.student || enrollment);
        setStudents(studentList);
      } else {
        console.error('Failed to load students:', response.status);
      }
    } catch (error) {
      console.error('Failed to load students:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const data = await sessionsAPI.getByClass(classId);
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const getToken = async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('accessToken');
  };

  const handleAddStudentByStudentId = async () => {
    if (!studentId.trim()) {
      Alert.alert('Error', 'Please enter a Student ID');
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/api/classes/${classId}/students/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentId.toUpperCase(),
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Student added to class successfully!');
        setAddStudentModalVisible(false);
        resetStudentForm();
        await loadStudents();
      } else {
        const errorData = await response.json();
        
        if (response.status === 409) {
          // Student already enrolled
          Alert.alert(
            'Student Already Enrolled',
            `The student with ID "${studentId.toUpperCase()}" is already enrolled in this class. Each student can only be enrolled once per class.`,
            [
              {
                text: 'OK',
                style: 'default',
              }
            ]
          );
        } else if (response.status === 404) {
          // Student not found
          Alert.alert(
            'Student Not Found',
            `No student found with ID "${studentId.toUpperCase()}". Please check the student ID and try again.`,
            [
              {
                text: 'OK',
                style: 'default',
              }
            ]
          );
        } else {
          // Other errors
          Alert.alert('Error', errorData.message || 'Failed to add student. Please try again.');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to add student');
      console.error(error);
    }
  };

  const handleCheckIn = async () => {
    // Set default to today if not provided
    const today = new Date().toISOString().split('T')[0];
    const dateToUse = sessionDate.trim() || today;

    try {
      await sessionsAPI.create(classId, dateToUse, startTime.trim() || undefined, endTime.trim() || undefined);
      Alert.alert('Success', 'Session created! You can now mark attendance.');
      setCheckInModalVisible(false);
      resetCheckInForm();
      await loadSessions();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create session');
    }
  };

  const resetStudentForm = () => {
    setStudentId('');
  };

  const resetCheckInForm = () => {
    setSessionDate('');
    setStartTime('');
    setEndTime('');
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    // Temporarily removed confirmation for debugging
    console.log('handleDeleteStudent called for:', studentId, studentName);
    try {
      const token = await getToken();
      console.log('Deleting student:', studentId, 'from class:', classId);
      const url = `http://localhost:3000/api/classes/${classId}/students/${studentId}`;
      console.log('DELETE URL:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);
      const responseText = await response.text();
      console.log('Delete response:', responseText);

      if (response.ok) {
        Alert.alert('Success', 'Student removed from class');
        await loadStudents();
      } else {
        try {
          const error = JSON.parse(responseText);
          Alert.alert('Error', error.message || 'Failed to remove student');
        } catch (e) {
          Alert.alert('Error', `Failed to remove student: ${responseText}`);
        }
      }
    } catch (error: any) {
      console.error('Delete student error:', error);
      Alert.alert('Error', `Failed to remove student: ${error.message}`);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
        <Button
          title="Retry"
          onPress={loadData}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{className}</Text>
        <Text style={styles.subtitle}>
          {students.length} Students • {sessions.length} Sessions
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button
          title="👤 Add Student by ID"
          onPress={() => setAddStudentModalVisible(true)}
          variant="primary"
          style={styles.actionButton}
        />
        <Button
          title="�📋 Check In"
          onPress={() => setCheckInModalVisible(true)}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'students' && styles.tabActive]}
          onPress={() => setActiveTab('students')}
        >
          <Text style={[styles.tabText, activeTab === 'students' && styles.tabTextActive]}>
            Students ({students.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sessions' && styles.tabActive]}
          onPress={() => setActiveTab('sessions')}
        >
          <Text style={[styles.tabText, activeTab === 'sessions' && styles.tabTextActive]}>
            Sessions ({sessions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'students' ? (
          <View>
            {students.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No students yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap "Add Student" to enroll students in this class
                </Text>
              </Card>
            ) : (
              students.map((student) => (
                <Card key={student.id} style={styles.studentCard}>
                  <View style={styles.studentInfo}>
                    <View style={styles.studentAvatar}>
                      <Text style={styles.studentInitials}>
                        {student.firstName?.[0] || '?'}{student.lastName?.[0] || '?'}
                      </Text>
                    </View>
                    <View style={styles.studentDetails}>
                      <Text style={styles.studentName}>
                        {student.firstName || 'Unknown'} {student.lastName || 'Student'}
                      </Text>
                      <Text style={styles.studentId}>ID: {student.studentId || 'N/A'}</Text>
                      {student.email && (
                        <Text style={styles.studentEmail}>📧 {student.email}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => {
                        Alert.alert(
                          'Delete Student',
                          `Are you sure you want to remove ${student.firstName} ${student.lastName} from this class?`,
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel',
                            },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  const token = await getToken();
                                  const url = `http://localhost:3000/api/classes/${classId}/students/${student.id}`;
                                  
                                  const response = await fetch(url, {
                                    method: 'DELETE',
                                    headers: {
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json',
                                    },
                                  });

                                  if (response.ok) {
                                    Alert.alert('Success', 'Student removed from class');
                                    await loadStudents();
                                  } else {
                                    const responseText = await response.text();
                                    Alert.alert('Error', `Failed to remove student: ${responseText}`);
                                  }
                                } catch (error: any) {
                                  Alert.alert('Error', `Failed to remove student: ${error.message}`);
                                }
                              },
                            },
                          ]
                        );
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </View>
        ) : (
          <View>
            {sessions.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No sessions yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap "Check In" to create a session for today
                </Text>
              </Card>
            ) : (
              sessions.map((session) => (
                <Card
                  key={session.id}
                  style={styles.sessionCard}
                >
                  <TouchableOpacity
                    style={styles.sessionInfo}
                    onPress={() =>
                      navigation.navigate('Attendance', {
                        sessionId: session.id,
                        sessionDate: session.date,
                      })
                    }
                  >
                    <Text style={styles.sessionDate}>
                      📅 {new Date(session.date).toLocaleDateString()}
                    </Text>
                    {session.startTime && (
                      <Text style={styles.sessionTime}>
                        🕐 {session.startTime}
                        {session.endTime && ` - ${session.endTime}`}
                      </Text>
                    )}
                    <Text style={styles.sessionStatus}>
                      {session.status === 'active' ? '🟢 Active' : '⚪ Completed'}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.sessionActions}>
                    <TouchableOpacity
                      style={styles.qrButton}
                      onPress={() =>
                        navigation.navigate('QRDisplay', {
                          sessionId: session.id,
                          className: className,
                          sessionDate: session.date,
                        })
                      }
                    >
                      <Text style={styles.qrButtonText}>📱 Show QR</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Student by ID Modal */}
      <Modal visible={addStudentModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Add Student to {className}</Text>
              <Text style={styles.modalSubtitle}>
                Enter the student ID to add them to this class
              </Text>

              <Text style={styles.label}>Student ID *</Text>
              <Input
                placeholder="Enter student ID"
                value={studentId}
                onChangeText={setStudentId}
                icon="👤"
              />

              <View style={styles.modalActions}>
                <Button
                  title="Add Student"
                  onPress={handleAddStudentByStudentId}
                  variant="primary"
                  style={styles.modalButton}
                />
                <Button
                  title="Cancel"
                  onPress={() => {
                    setAddStudentModalVisible(false);
                    resetStudentForm();
                  }}
                  variant="outline"
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Check-in Modal */}
      <Modal visible={checkInModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Check In to {className}</Text>
            <Text style={styles.modalSubtitle}>
              Create a new session for attendance tracking
            </Text>

            <Text style={styles.label}>Session Date</Text>
            <Input
              placeholder={`Today (${new Date().toISOString().split('T')[0]})`}
              value={sessionDate}
              onChangeText={setSessionDate}
              icon="📅"
            />
            <Text style={styles.hint}>Format: YYYY-MM-DD (leave empty for today)</Text>

            <Text style={styles.label}>Start Time (Optional)</Text>
            <Input
              placeholder="e.g., 09:00"
              value={startTime}
              onChangeText={setStartTime}
              icon="🕐"
            />

            <Text style={styles.label}>End Time (Optional)</Text>
            <Input
              placeholder="e.g., 10:30"
              value={endTime}
              onChangeText={setEndTime}
              icon="🕐"
            />

            <View style={styles.modalActions}>
              <Button
                title="Create Session"
                onPress={handleCheckIn}
                variant="primary"
                style={styles.modalButton}
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setCheckInModalVisible(false);
                  resetCheckInForm();
                }}
                variant="outline"
                style={styles.modalButton}
              />
            </View>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  quickActions: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  
  // Student Cards
  studentCard: {
    marginBottom: theme.spacing.md,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  studentInitials: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  studentEmail: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  
  // Session Cards
  sessionCard: {
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  sessionStatus: {
    fontSize: 14,
    color: theme.colors.success,
  },
  sessionArrow: {
    fontSize: 24,
    color: theme.colors.textLight,
  },
  
  // Empty State
  emptyCard: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
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
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: -theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  modalActions: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
  },
  modalButton: {
    width: '100%',
  },
  deleteButton: {
    padding: 12,
    marginLeft: 12,
    backgroundColor: theme.colors.error + '20', // 20% opacity red background
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  deleteButtonText: {
    fontSize: 18,
    color: theme.colors.error,
  },
  sessionActions: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  qrButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Student Code Generation
  codesContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  instruction: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  codeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: theme.spacing.xs,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

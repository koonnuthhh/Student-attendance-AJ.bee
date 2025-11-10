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
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { classesAPI, sessionsAPI } from '../api';
import { APP_CONFIG } from '../config/app.config';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';

export default function ClassDetailsScreen({ route, navigation }: any) {
  const { classId, className, isStudent } = route.params;
  const { theme } = useTheme();
  
  // Add error state
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'sessions'>('students');
  const [students, setStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Session deletion state
  const [deletingSession, setDeletingSession] = useState<string | null>(null);
  
  // Add Student Modal
  const [addStudentModalVisible, setAddStudentModalVisible] = useState(false);
  const [studentId, setStudentId] = useState('');
  
  // Create Session Modal
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  // Date/Time objects for pickers
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (isStudent) {
        await Promise.all([loadSessions(), loadStudentAttendance()]);
      } else {
        await Promise.all([loadStudents(), loadSessions()]);
      }
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
      const response = await fetch(`${APP_CONFIG.api.baseURL}/classes/${classId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded students data:', data); // Debug log
        // Backend returns enrollments with nested student objects
        // Transform to flat student objects for easier use in UI
        const studentList = data.map((enrollment: any) => {
          const student = enrollment.student || enrollment;
          // Make sure we preserve the student's actual ID for deletion
          return {
            ...student,
            enrollmentStudentId: enrollment.studentId, // Keep track of enrollment studentId for deletion
          };
        });
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

  const loadStudentAttendance = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${APP_CONFIG.api.baseURL}/students/attendance/class/${classId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded student attendance data:', data);
        setStudentAttendance(data);
      } else {
        console.error('Failed to load student attendance:', response.status);
        // Set empty array if no attendance records found
        setStudentAttendance([]);
      }
    } catch (error) {
      console.error('Failed to load student attendance:', error);
      setStudentAttendance([]);
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
      const response = await fetch(`${APP_CONFIG.api.baseURL}/classes/${classId}/students/enroll`, {
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

  const handleCreateSession = async () => {
    // Set default to today if not provided
    const today = new Date().toISOString().split('T')[0];
    const dateToUse = sessionDate.trim() || today;

    try {
      await sessionsAPI.create(classId, dateToUse, startTime.trim() || undefined, endTime.trim() || undefined);
      Alert.alert('Success', 'Session created! You can now mark attendance.');
      setSessionModalVisible(false);
      resetSessionForm();
      await loadSessions();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create session');
    }
  };

  const resetStudentForm = () => {
    setStudentId('');
  };

  // Helper functions for date and time formatting
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }); // HH:MM format
  };

  const getCurrentDate = () => {
    return formatDate(new Date());
  };

  const getCurrentTime = () => {
    return formatTime(new Date());
  };

  const getDisplayDate = () => {
    if (!sessionDate) return getCurrentDate();
    return sessionDate;
  };

  const getDisplayTime = (time: string, defaultTime: string = '') => {
    if (!time) return defaultTime || 'Select time';
    return time;
  };

  // Date and time picker handlers are defined after generateCalendarDays function

  const resetSessionForm = () => {
    setSessionDate('');
    setStartTime('');
    setEndTime('');
    setSelectedDate(new Date());
    setSelectedStartTime(new Date());
    setSelectedEndTime(new Date());
  };

  // Handler functions for native DateTimePicker
  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSessionDate(dateString);
    setSelectedDate(date);
  };

  const handleStartTimeSelect = (time: Date) => {
    const timeString = time.toTimeString().slice(0, 5); // HH:MM format
    setStartTime(timeString);
    setSelectedStartTime(time);
  };

  const handleEndTimeSelect = (time: Date) => {
    const timeString = time.toTimeString().slice(0, 5); // HH:MM format
    setEndTime(timeString);
    setSelectedEndTime(time);
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    // Temporarily removed confirmation for debugging
    console.log('handleDeleteStudent called for:', studentId, studentName);
    try {
      const token = await getToken();
      console.log('Deleting student:', studentId, 'from class:', classId);
      const url = `${APP_CONFIG.api.baseURL}/classes/${classId}/students/${studentId}`;
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

  const handleDeleteSession = async (sessionId: string, sessionDate: string) => {
    const sessionDateFormatted = new Date(sessionDate).toLocaleDateString();
    
    // For web, use confirm dialog for better compatibility
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Are you sure you want to delete the session from ${sessionDateFormatted}? This action cannot be undone and will remove all attendance records for this session.`
      );
      
      if (confirmed) {
        setDeletingSession(sessionId);
        try {
          await sessionsAPI.delete(classId, sessionId);
          window.alert('Session deleted successfully!');
          await loadSessions(); // Reload sessions
        } catch (error: any) {
          console.error('Failed to delete session:', error);
          window.alert(error.response?.data?.message || 'Failed to delete session');
        } finally {
          setDeletingSession(null);
        }
      }
    } else {
      // Use React Native Alert for mobile
      Alert.alert(
        'Delete Session',
        `Are you sure you want to delete the session from ${sessionDateFormatted}? This action cannot be undone and will remove all attendance records for this session.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setDeletingSession(sessionId);
              try {
                await sessionsAPI.delete(classId, sessionId);
                Alert.alert('Success', 'Session deleted successfully!');
                await loadSessions(); // Reload sessions
              } catch (error: any) {
                console.error('Failed to delete session:', error);
                Alert.alert('Error', error.response?.data?.message || 'Failed to delete session');
              } finally {
                setDeletingSession(null);
              }
            }
          }
        ]
      );
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <Loading />;
  }

  const styles = createStyles(theme);

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
        {!isStudent && (
          <Text style={styles.subtitle}>
            {students.length} Students • {sessions.length} Sessions
          </Text>
        )}
        {isStudent && (
          <Text style={styles.subtitle}>
            Your attendance history for this class
          </Text>
        )}
      </View>

      {/* Quick Actions */}
      {!isStudent && (
        <View style={styles.quickActions}>
          <Button
            title="👤 Add Student by ID"
            onPress={() => setAddStudentModalVisible(true)}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="📋 Create Session"
            onPress={() => setSessionModalVisible(true)}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {isStudent ? (
          <TouchableOpacity
            style={[styles.tab, styles.tabActive]}
          >
            <Text style={[styles.tabText, styles.tabTextActive]}>
              Sessions ({sessions.length})
            </Text>
          </TouchableOpacity>
        ) : (
          <>
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
          </>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isStudent ? (
          /* Student View - Show sessions with their attendance status */
          <View>
            {sessions.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No sessions yet</Text>
                <Text style={styles.emptySubtext}>
                  Sessions will appear here once your teacher creates them
                </Text>
              </Card>
            ) : (
              sessions.map((session) => {
                // Find attendance record for this session
                const attendanceRecord = studentAttendance.find(
                  att => att.session?.id === session.id
                );
                
                return (
                  <Card key={session.id} style={styles.sessionCard}>
                    <View style={styles.sessionInfo}>
                      <View style={styles.sessionHeader}>
                        <Text style={styles.sessionDate}>
                          📅 {new Date(session.date).toLocaleDateString()}
                        </Text>
                        {attendanceRecord ? (
                          <View style={[
                            styles.statusBadge, 
                            attendanceRecord.status.toLowerCase() === 'present' ? styles.presentBadge : 
                            attendanceRecord.status.toLowerCase() === 'absent' ? styles.absentBadge : styles.lateBadge
                          ]}>
                            <Text style={[
                              styles.statusText,
                              attendanceRecord.status.toLowerCase() === 'present' ? styles.presentText : 
                              attendanceRecord.status.toLowerCase() === 'absent' ? styles.absentText : styles.lateText
                            ]}>
                              {attendanceRecord.status.toLowerCase() === 'present' ? '✅ Present' : 
                               attendanceRecord.status.toLowerCase() === 'absent' ? '❌ Absent' : '🟡 Late'}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.noAttendanceBadge}>
                            <Text style={styles.noAttendanceText}>⚪ No Record</Text>
                          </View>
                        )}
                      </View>
                      
                      {session.startTime && (
                        <Text style={styles.sessionTime}>
                          🕐 {session.startTime}
                          {session.endTime && ` - ${session.endTime}`}
                        </Text>
                      )}
                      
                      <Text style={styles.sessionStatus}>
                        {(() => {
                          const sessionDate = new Date(session.date);
                          const today = new Date();
                          const isToday = sessionDate.toDateString() === today.toDateString();
                          const isFuture = sessionDate > today;
                          
                          if (isFuture) {
                            return '� Upcoming';
                          } else if (isToday) {
                            return '🟢 Today';
                          } else {
                            return '⚪ Completed';
                          }
                        })()}
                      </Text>
                      
                      {attendanceRecord?.checkInTime && (
                        <Text style={styles.checkInTime}>
                          ✅ Checked in: {new Date(attendanceRecord.checkInTime).toLocaleTimeString()}
                        </Text>
                      )}
                      
                      {attendanceRecord?.notes && (
                        <Text style={styles.attendanceNotes}>
                          📝 {attendanceRecord.notes}
                        </Text>
                      )}
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        ) : (
          /* Teacher View - Original content */
          activeTab === 'students' ? (
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
                        style={[styles.deleteButton, { opacity: 0.8 }]}
                        onPress={() => {
                          Alert.alert(
                            'Remove Student',
                            `Are you sure you want to remove ${student.firstName} ${student.lastName} from this class?`,
                            [
                              {
                                text: 'Cancel',
                                style: 'cancel',
                              },
                              {
                                text: 'Remove',
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    const token = await getToken();
                                    // Use the enrollmentStudentId if available, otherwise fallback to student.id
                                    const studentIdForDeletion = student.enrollmentStudentId || student.id;
                                    const url = `${APP_CONFIG.api.baseURL}/classes/${classId}/students/${studentIdForDeletion}`;
                                    
                                    console.log('Deleting student:', {
                                      classId,
                                      studentId: studentIdForDeletion,
                                      studentName: `${student.firstName} ${student.lastName}`,
                                      url
                                    });
                                    
                                    const response = await fetch(url, {
                                      method: 'DELETE',
                                      headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                      },
                                    });

                                    if (response.ok) {
                                      Alert.alert(
                                        'Success', 
                                        `${student.firstName} ${student.lastName} has been removed from the class.`
                                      );
                                      await loadStudents(); // Refresh the student list
                                    } else {
                                      const errorText = await response.text();
                                      console.error('Delete error response:', {
                                        status: response.status,
                                        error: errorText
                                      });
                                      Alert.alert(
                                        'Error', 
                                        `Failed to remove student. Please try again.\n\nError: ${errorText}`
                                      );
                                    }
                                  } catch (error: any) {
                                    console.error('Delete exception:', error);
                                    Alert.alert(
                                      'Error', 
                                      `Network error: ${error.message}. Please check your connection and try again.`
                                    );
                                  }
                                },
                              },
                            ]
                          );
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        activeOpacity={0.6}
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
                    Tap "Create Session" to create a session for today
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
                      <TouchableOpacity
                        style={[styles.deleteSessionButton, deletingSession === session.id && styles.deletingSessionButton]}
                        onPress={() => handleDeleteSession(session.id, session.date)}
                        disabled={deletingSession === session.id}
                        activeOpacity={0.7}
                        {...(Platform.OS === 'web' && {
                          onMouseEnter: (e: any) => {
                            e.target.style.opacity = '0.8';
                            e.target.style.transform = 'scale(1.02)';
                            e.target.style.cursor = 'pointer';
                          },
                          onMouseLeave: (e: any) => {
                            e.target.style.opacity = '1';
                            e.target.style.transform = 'scale(1)';
                          }
                        })}
                      >
                        {deletingSession === session.id ? (
                          <Text style={styles.deleteSessionButtonText}>Deleting...</Text>
                        ) : (
                          <Text style={styles.deleteSessionButtonText}>🗑️ Delete</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))
              )}
            </View>
          )
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
                icon={<Text>👤</Text>}
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

      {/* Create Session Modal */}
      <Modal visible={sessionModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Session for {className}</Text>
            <Text style={styles.modalSubtitle}>
              Create a new session for attendance tracking
            </Text>

            <Text style={styles.label}>Session Date</Text>
            <TouchableOpacity 
              style={styles.dateTimeSelector}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeSelectorIcon}>📅</Text>
              <Text style={styles.dateTimeSelectorText}>
                {getDisplayDate()} {!sessionDate && '(Today)'}
              </Text>
              <TouchableOpacity
                style={styles.dateTimeClearButton}
                onPress={() => setSessionDate('')}
              >
                <Text style={styles.dateTimeClearText}>Reset</Text>
              </TouchableOpacity>
            </TouchableOpacity>
            <Text style={styles.hint}>Default: Today's date</Text>

            <Text style={styles.label}>Start Time (Optional)</Text>
            <TouchableOpacity 
              style={styles.dateTimeSelector}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Text style={styles.dateTimeSelectorIcon}>🕐</Text>
              <Text style={styles.dateTimeSelectorText}>
                {getDisplayTime(startTime, 'Set start time')}
              </Text>
              <TouchableOpacity
                style={styles.dateTimeClearButton}
                onPress={() => setStartTime('')}
              >
                <Text style={styles.dateTimeClearText}>Clear</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <Text style={styles.label}>End Time (Optional)</Text>
            <TouchableOpacity 
              style={styles.dateTimeSelector}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Text style={styles.dateTimeSelectorIcon}>🕐</Text>
              <Text style={styles.dateTimeSelectorText}>
                {getDisplayTime(endTime, 'Set end time')}
              </Text>
              <TouchableOpacity
                style={styles.dateTimeClearButton}
                onPress={() => setEndTime('')}
              >
                <Text style={styles.dateTimeClearText}>Clear</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <Button
                title="Create Session"
                onPress={handleCreateSession}
                variant="primary"
                style={styles.modalButton}
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setSessionModalVisible(false);
                  resetSessionForm();
                }}
                variant="outline"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Native Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              handleDateSelect(selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {/* Native Start Time Picker */}
      {showStartTimePicker && (
        <DateTimePicker
          value={selectedStartTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setShowStartTimePicker(false);
            if (selectedTime) {
              handleStartTimeSelect(selectedTime);
            }
          }}
        />
      )}

      {/* Native End Time Picker */}
      {showEndTimePicker && (
        <DateTimePicker
          value={selectedEndTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setShowEndTimePicker(false);
            if (selectedTime) {
              handleEndTimeSelect(selectedTime);
            }
          }}
        />
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
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
    color: theme.colors.textInverse,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textInverse,
  },
  quickActions: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
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
    backgroundColor: theme.colors.surface,
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
    color: theme.colors.secondary,
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
    backgroundColor: theme.colors.surface,
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
    color: theme.colors.text,
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
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  qrButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
    minWidth: 120,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteSessionButton: {
    backgroundColor: '#FF5722',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#E64A19',
        transform: 'scale(1.02)',
      },
      ':active': {
        transform: 'scale(0.98)',
      }
    }),
  },
  deletingSessionButton: {
    opacity: 0.7,
  },
  deleteSessionButtonText: {
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
    backgroundColor: theme.colors.surface,
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
  
  // Student Attendance Cards
  attendanceCard: {
    marginBottom: theme.spacing.md,
  },
  attendanceInfo: {
    gap: theme.spacing.xs,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  attendanceDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  presentBadge: {
    backgroundColor: '#e8f5e8',
  },
  absentBadge: {
    backgroundColor: '#ffeaea',
  },
  lateBadge: {
    backgroundColor: '#fff3cd',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  presentText: {
    color: '#2e7d32',
  },
  absentText: {
    color: '#d32f2f',
  },
  lateText: {
    color: '#f57c00',
  },
  checkInTime: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  attendanceNotes: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  
  // Session Header for Student View
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  noAttendanceBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  noAttendanceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  
  // Date Time Selector Styles
  dateTimeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    minHeight: 50,
  },
  dateTimeSelectorIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  dateTimeSelectorText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  dateTimeClearButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateTimeClearText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
});

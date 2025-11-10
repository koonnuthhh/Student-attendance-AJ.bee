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
  Alert 
} from 'react-native';
import { classesAPI } from '../api';
import { useTheme } from '../contexts/ThemeContext';
import { Loading } from '../components/Loading';

export default function ClassesScreen({ navigation }: any) {
  const { theme, isDark } = useTheme();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await classesAPI.getAll();
      setClasses(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      Alert.alert('Error', 'Please enter a class name');
      return;
    }

    setCreating(true);
    try {
      await classesAPI.create(newClassName, newClassSubject || undefined);
      Alert.alert('Success', 'Class created successfully!');
      setModalVisible(false);
      setNewClassName('');
      setNewClassSubject('');
      loadClasses(); // Reload the list
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create class');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <Loading message="Loading classes..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>My Classes</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={[styles.addButtonText, { color: theme.colors.textInverse }]}>+ Create Class</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Settings Access Card */}

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.classCard, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('ClassDetails', { classId: item.id, className: item.name })}
          >
            <View style={styles.classInfo}>
              <Text style={[styles.className, { color: theme.colors.text }]}>{item.name}</Text>
              <Text style={[styles.classSubject, { color: theme.colors.textSecondary }]}>{item.subject || 'No subject'}</Text>
            </View>
            <Text style={[styles.classArrow, { color: theme.colors.textLight }]}>→</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No classes yet</Text>
            <Text style={styles.emptySubtext}>Create your first class to get started</Text>
          </View>
        }
      />

      {/* Create Class Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Create New Class</Text>

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background, 
                borderColor: theme.colors.border,
                color: theme.colors.text 
              }]}
              placeholder="Class Name (e.g., Math 101)"
              placeholderTextColor={theme.colors.textLight}
              value={newClassName}
              onChangeText={setNewClassName}
              autoFocus
            />

            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background, 
                borderColor: theme.colors.border,
                color: theme.colors.text 
              }]}
              placeholder="Subject (optional)"
              placeholderTextColor={theme.colors.textLight}
              value={newClassSubject}
              onChangeText={setNewClassSubject}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.secondaryDark }]}
                onPress={() => {
                  setModalVisible(false);
                  setNewClassName('');
                  setNewClassSubject('');
                }}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.createButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleCreateClass}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color={theme.colors.textInverse} />
                ) : (
                  <Text style={[styles.createButtonText, { color: theme.colors.textInverse }]}>Create</Text>
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
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  classCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classInfo: {
    flex: 1,
  },
  className: { fontSize: 18, fontWeight: '600' },
  classSubject: { fontSize: 14, marginTop: 5 },
  classArrow: { fontSize: 24, marginLeft: 10 },
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
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
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
    // Background color set dynamically
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    // Background color set dynamically
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Settings Card Styles
  settingsCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 2,
    transform: [{ scale: 1 }], // For potential animation
  },
  settingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsIconText: {
    fontSize: 28,
  },
  settingsText: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingsSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  settingsArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  settingsActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

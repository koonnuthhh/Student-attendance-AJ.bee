import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Loading } from '../components';
import { theme } from '../config/theme';
import { classesAPI, attendanceAPI } from '../api';

interface ProfileData {
  enrolledClasses: number;
  overallAttendance: number;
  academicStatus: string;
  attendanceStats: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
  };
}

interface ProfileSection {
  title: string;
  items: { label: string; value: string }[];
}

export default function StudentProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    enrolledClasses: 0,
    overallAttendance: 0,
    academicStatus: 'Active',
    attendanceStats: {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
    },
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls when endpoints are available
      // For now, using real user data but placeholder academic data
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would fetch:
      // 1. Student's enrolled classes
      // 2. Attendance records across all classes
      // 3. Academic status from user profile
      
      const mockProfileData: ProfileData = {
        enrolledClasses: 0, // Will be fetched from classes API
        overallAttendance: 0, // Will be calculated from attendance records
        academicStatus: user?.studentCode ? 'Active' : 'Pending Enrollment',
        attendanceStats: {
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
        },
      };

      setProfileData(mockProfileData);
    } catch (error) {
      console.error('Error loading profile data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  const formatRole = (roles: any) => {
    if (!roles || roles.length === 0) return 'N/A';
    
    const role = roles[0];
    if (typeof role === 'string') {
      return role;
    } else if (role && role.name) {
      return role.name;
    }
    return 'N/A';
  };

  const profileSections: ProfileSection[] = [
    {
      title: 'Personal Information',
      items: [
        { label: 'Full Name', value: user?.name || 'N/A' },
        { label: 'Email', value: user?.email || 'N/A' },
        { label: 'Student Code', value: user?.studentCode || 'Not Assigned' },
        { label: 'Role', value: formatRole(user?.roles) },
      ],
    },
    {
      title: 'Academic Information',
      items: [
        { label: 'Enrolled Classes', value: profileData.enrolledClasses.toString() },
        { label: 'Overall Attendance', value: profileData.overallAttendance > 0 ? `${profileData.overallAttendance}%` : 'No Records' },
        { label: 'Academic Year', value: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1) },
        { label: 'Status', value: profileData.academicStatus },
      ],
    },
    {
      title: 'App Settings',
      items: [
        { label: 'Notifications', value: 'Enabled' },
        { label: 'Language', value: 'English' },
        { label: 'Theme', value: 'Light' },
        { label: 'App Version', value: '1.0.0' },
      ],
    },
  ];

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Contact your administrator to update your profile information.',
      [{ text: 'OK' }]
    );
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleNotificationSettings = () => {
    Alert.alert(
      'Notification Settings',
      'Notification settings will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'For support, please contact your teacher or administrator.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Profile Header */}
      <Card style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{user?.name || 'Student'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
            {user?.studentCode && (
              <View style={styles.studentCodeBadge}>
                <Text style={styles.studentCodeText}>ID: {user.studentCode}</Text>
              </View>
            )}
          </View>
        </View>
        
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Text style={styles.editButtonText}>View Details</Text>
        </TouchableOpacity>
      </Card>

      {/* Profile Sections */}
      {profileSections.map((section, sectionIndex) => (
        <Card key={sectionIndex} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </Card>
      ))}

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionRow} onPress={handleChangePassword}>
          <Text style={styles.actionText}>Change Password</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionRow} onPress={handleNotificationSettings}>
          <Text style={styles.actionText}>Notification Settings</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionRow} onPress={handleSupport}>
          <Text style={styles.actionText}>Help & Support</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </Card>

      {/* Attendance Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Attendance Summary</Text>
        {profileData.attendanceStats.total > 0 ? (
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{profileData.attendanceStats.present}</Text>
              <Text style={styles.summaryLabel}>Present</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.colors.error }]}>
                {profileData.attendanceStats.absent}
              </Text>
              <Text style={styles.summaryLabel}>Absent</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.colors.warning }]}>
                {profileData.attendanceStats.late}
              </Text>
              <Text style={styles.summaryLabel}>Late</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: theme.colors.info }]}>
                {profileData.attendanceStats.excused}
              </Text>
              <Text style={styles.summaryLabel}>Excused</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyAttendance}>
            <Text style={styles.emptyAttendanceText}>No attendance records yet</Text>
            <Text style={styles.emptyAttendanceSubText}>
              Start attending classes to see your attendance summary
            </Text>
          </View>
        )}
      </Card>

      {/* App Information */}
      <Card style={styles.appInfoCard}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <Text style={styles.appInfoText}>
          Student Attendance System v1.0.0
        </Text>
        <Text style={styles.appInfoSubText}>
          Developed for seamless attendance tracking
        </Text>
      </Card>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          title="Logout"
          onPress={handleLogout}
          style={styles.logoutButton}
          variant="ghost"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
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
  headerCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.surface,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  studentCodeBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  studentCodeText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium as any,
    fontFamily: 'monospace',
  },
  editButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'center',
  },
  editButtonText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  sectionCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium as any,
    textAlign: 'right',
    flex: 1,
  },
  actionsCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  actionText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  actionArrow: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.success,
    marginBottom: theme.spacing.xs,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyAttendance: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyAttendanceText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyAttendanceSubText: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  appInfoCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  appInfoText: {
    fontSize: 16,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  appInfoSubText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  logoutContainer: {
    marginTop: theme.spacing.lg,
  },
  logoutButton: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
});
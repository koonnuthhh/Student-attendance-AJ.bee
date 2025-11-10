/**
 * Settings Screen
 * 
 * Allows users to customize app settings including dark mode toggle.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme, useThemedStyles } from '../contexts/ThemeContext';
import { Card } from '../components';
import { useAuth } from '../contexts/AuthContext';

export const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const styles = useThemedStyles(createStyles);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Info */}
      <Card style={styles.userCard}>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userRole}>
          {user?.roles ? (typeof user.roles[0] === 'string' ? user.roles[0] : user.roles[0]?.name || 'Student') : 'Student'}
        </Text>
      </Card>

      {/* Appearance Settings */}
      <Card style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingDescription}>
              Use dark theme throughout the app
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={isDark ? theme.colors.primary : theme.colors.secondary}
            trackColor={{ 
              false: theme.colors.border, 
              true: theme.colors.primaryLight 
            }}
          />
        </View>
      </Card>

      {/* Theme Preview */}
      <Card style={styles.previewCard}>
        <Text style={styles.sectionTitle}>Theme Preview</Text>
        
        <View style={styles.colorPreview}>
          <View style={[styles.colorSample, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.colorLabel}>Primary</Text>
          </View>
          <View style={[styles.colorSample, { backgroundColor: theme.colors.secondary }]}>
            <Text style={[styles.colorLabel, { color: theme.colors.text }]}>Secondary</Text>
          </View>
        </View>
        
        <View style={styles.colorPreview}>
          <View style={[styles.colorSample, { backgroundColor: theme.colors.success }]}>
            <Text style={styles.colorLabel}>Success</Text>
          </View>
          <View style={[styles.colorSample, { backgroundColor: theme.colors.error }]}>
            <Text style={styles.colorLabel}>Error</Text>
          </View>
        </View>
      </Card>

      {/* Account Settings */}
      <Card style={styles.settingsCard}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingTitle, { color: theme.colors.error }]}>
              Logout
            </Text>
            <Text style={styles.settingDescription}>
              Sign out of your account
            </Text>
          </View>
        </TouchableOpacity>
      </Card>

      {/* Easy Customization Guide */}
      <Card style={styles.customizationCard}>
        <Text style={styles.sectionTitle}>Easy UI Customization</Text>
        <Text style={styles.customizationText}>
          🎨 To customize colors: Edit `src/config/theme.ts`{'\n'}
          🌓 To modify dark mode: Edit this settings screen{'\n'}
          📱 To add new themes: Extend the theme system{'\n'}
          🔧 All UI components use the centralized theme
        </Text>
      </Card>
    </ScrollView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.base,
    paddingBottom: theme.spacing.xxl,
  },
  userCard: {
    marginBottom: theme.spacing.base,
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  userName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  userRole: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
    backgroundColor: theme.colors.hover,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  settingsCard: {
    marginBottom: theme.spacing.base,
  },
  previewCard: {
    marginBottom: theme.spacing.base,
  },
  customizationCard: {
    marginBottom: theme.spacing.base,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    minHeight: 60,
  },
  settingContent: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  colorPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  colorSample: {
    flex: 1,
    height: 60,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: '#FFFFFF',
  },
  customizationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
});

export default SettingsScreen;
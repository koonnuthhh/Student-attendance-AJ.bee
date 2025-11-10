import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export function UserDebugInfo() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug User Info</Text>
      <Text style={styles.json}>
        {JSON.stringify(user, null, 2)}
      </Text>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    margin: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.text,
  },
  json: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    padding: 8,
    borderRadius: 4,
  },
});
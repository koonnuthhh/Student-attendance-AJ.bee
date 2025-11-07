import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export function UserDebugInfo() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug User Info</Text>
      <Text style={styles.json}>
        {JSON.stringify(user, null, 2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    margin: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  json: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
  },
});
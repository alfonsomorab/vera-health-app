/**
 * EmptyState Component
 * Displays a welcome message when no conversation has started yet
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const EmptyState: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>💊</Text>
        <Text style={styles.title}>Welcome to Vera Health</Text>
        <Text style={styles.subtitle}>
          Ask a clinical question to get started
        </Text>
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>You can ask about:</Text>
          <Text style={styles.exampleItem}>• Clinical guidelines and protocols</Text>
          <Text style={styles.exampleItem}>• Drug information and interactions</Text>
          <Text style={styles.exampleItem}>• Treatment recommendations</Text>
          <Text style={styles.exampleItem}>• Medical warnings and precautions</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a252f',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  examplesContainer: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exampleItem: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 4,
  },
});

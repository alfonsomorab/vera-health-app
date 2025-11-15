/**
 * CollapsibleSection Component
 * Displays a collapsible section with header and content
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Section } from '../types/chat.types';
import { getTagTitle } from '../constants/config';

interface CollapsibleSectionProps {
  section: Section;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  section,
  onToggle,
  children,
}) => {
  const title = getTagTitle(section.tagName);

  // Ensure isCollapsed is always a boolean (defaults to true = collapsed)
  const isCollapsed = section.isCollapsed ?? true;

  const handleToggle = React.useCallback(() => {
    onToggle(section.id);
  }, [onToggle, section.id]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.icon}>
          {isCollapsed ? '▶' : '▼'}
        </Text>
      </TouchableOpacity>

      <Collapsible collapsed={isCollapsed} duration={300}>
        <View style={styles.content}>
          {children}
        </View>
      </Collapsible>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  icon: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  content: {
    padding: 16,
    backgroundColor: '#fff',
  },
});

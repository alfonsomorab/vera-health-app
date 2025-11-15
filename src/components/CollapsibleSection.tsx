/**
 * CollapsibleSection Component
 * Displays a collapsible section with header and content
 * Enhanced with fade-in animation and smooth expand/collapse
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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

  // Fade-in animation for new sections
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Animate in when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleToggle = React.useCallback(() => {
    onToggle(section.id);
  }, [onToggle, section.id]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
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

      <Collapsible
        collapsed={isCollapsed}
        duration={300}
        easing="easeInOutCubic"
      >
        <View style={styles.content}>
          {children}
        </View>
      </Collapsible>
    </Animated.View>
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

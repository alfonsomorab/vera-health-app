/**
 * MarkdownRenderer Component
 * Renders markdown content with performance optimization
 */

import React, { useMemo } from 'react';
import { StyleSheet, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

export const MarkdownRenderer = React.memo<MarkdownRendererProps>(
  ({ content, isStreaming = false }) => {
    // Memoize content to prevent unnecessary re-renders
    const renderedContent = useMemo(() => content, [content]);

    return (
      <Markdown style={markdownStyles}>
        {renderedContent}
      </Markdown>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if content actually changed
    return (
      prevProps.content === nextProps.content &&
      prevProps.isStreaming === nextProps.isStreaming
    );
  }
);

MarkdownRenderer.displayName = 'MarkdownRenderer';

// Markdown styles
const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#000',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    color: '#000',
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
    color: '#000',
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 12,
    fontSize: 16,
    lineHeight: 24,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  bullet_list: {
    marginBottom: 12,
  },
  ordered_list: {
    marginBottom: 12,
  },
  list_item: {
    marginBottom: 4,
    fontSize: 16,
    lineHeight: 24,
  },
  code_inline: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
  },
  code_block: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    marginBottom: 12,
  },
  fence: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    marginBottom: 12,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  blockquote: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
});

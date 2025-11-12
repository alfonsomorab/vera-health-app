/**
 * MarkdownRenderer Component
 * Renders markdown content with performance optimization
 * Enhanced for medical/clinical content with tables, nested lists, and citations
 */

import React, { useMemo } from 'react';
import { StyleSheet, Platform, Text } from 'react-native';
import Markdown, { RenderRules, MarkdownIt } from 'react-native-markdown-display';
import MarkdownItTable from 'markdown-it-multimd-table';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

// Custom render rules for special elements
const customRules: RenderRules = {
  // Custom rendering for text to handle citations
  text: (node, children, parent, styles) => {
    const text = node.content;

    // Match citation patterns like [doi: ...] or [Level I evidence]
    const citationPattern = /(\[(?:doi:|Level [IVX]+ evidence|PMID:)[^\]]+\])/g;

    if (citationPattern.test(text)) {
      // Split text by citations and render with special styling
      const parts = text.split(citationPattern);
      return (
        <Text key={node.key} style={styles.text}>
          {parts.map((part, index) => {
            if (part.match(citationPattern)) {
              return (
                <Text key={`citation-${index}`} style={styles.citation}>
                  {part}
                </Text>
              );
            }
            return <Text key={`text-${index}`}>{part}</Text>;
          })}
        </Text>
      );
    }

    return (
      <Text key={node.key} style={styles.text}>
        {text}
      </Text>
    );
  },
};

// Configure markdown-it instance with table support
const markdownItInstance = MarkdownIt({ typographer: true, linkify: true }).use(
  MarkdownItTable,
  {
    multiline: true,
    rowspan: true,
    headerless: false,
    multibody: false,
  }
);

export const MarkdownRenderer = React.memo<MarkdownRendererProps>(
  ({ content, isStreaming = false }) => {
    // Pre-process content to fix tables with blank lines between rows
    const processedContent = useMemo(() => {
      // Fix tables by removing blank lines between table rows
      // Match: | ... | followed by one or more blank lines followed by another | ... |
      let result = content;

      // Keep replacing until no more matches (handles multiple consecutive blank lines)
      let previousResult;
      do {
        previousResult = result;
        result = result.replace(/(\|[^\n]+\|)\n\n+(\|[^\n]+\|)/g, '$1\n$2');
      } while (result !== previousResult);

      return result;
    }, [content]);

    return (
      <Markdown
        style={markdownStyles}
        rules={customRules}
        markdownit={markdownItInstance}
      >
        {processedContent}
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

// Markdown styles - Enhanced for medical/clinical content
const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2c3e50',
  },
  // Text styles
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2c3e50',
  },
  // Citation style (for [doi: ...] and [Level I evidence])
  citation: {
    fontSize: 13,
    color: '#5d6d7e',
    fontStyle: 'italic',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  // Headings
  heading1: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
    color: '#1a252f',
    lineHeight: 28,
  },
  heading2: {
    fontSize: 19,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 10,
    color: '#1a252f',
    lineHeight: 25,
  },
  heading3: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 8,
    color: '#1a252f',
    lineHeight: 23,
  },
  heading4: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#34495e',
    lineHeight: 22,
  },
  // Paragraphs
  paragraph: {
    marginTop: 0,
    marginBottom: 14,
    fontSize: 15,
    lineHeight: 22,
    color: '#2c3e50',
  },
  // Text formatting
  strong: {
    fontWeight: '700',
    color: '#1a252f',
  },
  em: {
    fontStyle: 'italic',
    color: '#34495e',
  },
  // Lists - with better nesting support
  bullet_list: {
    marginBottom: 14,
    marginTop: 4,
  },
  ordered_list: {
    marginBottom: 14,
    marginTop: 4,
  },
  list_item: {
    marginBottom: 6,
    fontSize: 15,
    lineHeight: 22,
    flexDirection: 'row',
  },
  bullet_list_icon: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  ordered_list_icon: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: 15,
    lineHeight: 22,
  },
  // Nested lists (indent sub-lists)
  bullet_list_content: {
    flex: 1,
  },
  ordered_list_content: {
    flex: 1,
  },
  // Tables - enhanced styling
  table: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    marginBottom: 16,
    marginTop: 8,
  },
  thead: {
    backgroundColor: '#e8ecef',
  },
  tbody: {
    backgroundColor: '#ffffff',
  },
  th: {
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#95a5a6',
    borderBottomWidth: 1,
    borderBottomColor: '#95a5a6',
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    flexDirection: 'row',
  },
  td: {
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#ecf0f1',
    flex: 1,
  },
  // Table text
  th_text: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a252f',
    lineHeight: 20,
  },
  td_text: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  // Code blocks
  code_inline: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#c0392b',
  },
  code_block: {
    backgroundColor: '#2c3e50',
    padding: 14,
    borderRadius: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    marginBottom: 16,
    color: '#ecf0f1',
  },
  fence: {
    backgroundColor: '#2c3e50',
    padding: 14,
    borderRadius: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    marginBottom: 16,
    color: '#ecf0f1',
  },
  // Links
  link: {
    color: '#3498db',
    textDecorationLine: 'underline',
  },
  // Blockquotes
  blockquote: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    paddingLeft: 14,
    paddingVertical: 10,
    marginBottom: 16,
    marginTop: 8,
    borderRadius: 4,
  },
  // Horizontal rule
  hr: {
    backgroundColor: '#bdc3c7',
    height: 1,
    marginVertical: 20,
  },
});

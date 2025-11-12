/**
 * StreamingResponse Component
 * Displays the user's question and streaming response with collapsible sections
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useChatStore, useContentItems, useCurrentQuestion, useError } from '../store/chatStore';
import { LoadingIndicator } from './LoadingIndicator';
import { CollapsibleSection } from './CollapsibleSection';
import { MarkdownRenderer } from './MarkdownRenderer';

export const StreamingResponse: React.FC = () => {
  const currentQuestion = useCurrentQuestion();
  const contentItems = useContentItems();
  const error = useError();
  const rawContent = useChatStore((state) => state.rawContent);
  const streamingState = useChatStore((state) => state.streamingState);

  // Get toggle function and wrap in useCallback for stable reference
  const toggleCollapseFromStore = useChatStore((state) => state.toggleCollapse);
  const toggleCollapse = useCallback((id: string) => {
    toggleCollapseFromStore(id);
  }, [toggleCollapseFromStore]);

  // Don't show anything if no question has been asked
  if (!currentQuestion) {
    return null;
  }

  // Show loading only when streaming but no content yet
  const showLoading = streamingState === 'streaming' && !rawContent && contentItems.length === 0;

  // Show raw content only if we haven't parsed any content items yet (Phase 2 fallback)
  const showRawContent = rawContent && contentItems.length === 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionLabel}>Question:</Text>
        <Text style={styles.questionText}>{currentQuestion}</Text>
      </View>

      {/* Loading State */}
      {showLoading && <LoadingIndicator />}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Raw Content Display (Phase 2 - before tag parsing) */}
      {showRawContent && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerLabel}>Answer:</Text>
          <View style={styles.rawContentContainer}>
            <MarkdownRenderer
              content={rawContent}
              isStreaming={streamingState === 'streaming'}
            />
          </View>
          {/* Streaming indicator */}
          {streamingState === 'streaming' && (
            <View style={styles.streamingIndicator}>
              <LoadingIndicator text="Streaming..." />
            </View>
          )}
        </View>
      )}

      {/* Ordered Content Items (Phase 3+) */}
      {contentItems.length > 0 && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerLabel}>Answer:</Text>

          {/* Render content items in order */}
          {contentItems.map((item, index) => {
            if (item.type === 'text') {
              // Render plain text as markdown
              return (
                <View key={`text-${item.order}-${index}`} style={styles.rawContentContainer}>
                  <MarkdownRenderer
                    content={item.content}
                    isStreaming={streamingState === 'streaming'}
                  />
                </View>
              );
            } else {
              // Render section as collapsible
              return (
                <CollapsibleSection
                  key={item.section.id}
                  section={item.section}
                  onToggle={toggleCollapse}
                >
                  <MarkdownRenderer
                    content={item.section.content}
                    isStreaming={!item.section.isComplete}
                  />
                </CollapsibleSection>
              );
            }
          })}

          {/* Streaming indicator when content exists but still streaming */}
          {streamingState === 'streaming' && (
            <View style={styles.streamingIndicator}>
              <LoadingIndicator text="Loading more..." />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  questionContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  questionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  answerContainer: {
    marginBottom: 16,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
    lineHeight: 24,
  },
  streamingIndicator: {
    marginTop: 8,
  },
  rawContentContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
});

/**
 * ChatScreen
 * Main screen for the streaming chat application
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatInput, StreamingResponse } from '../components';
import { useChatStore } from '../store/chatStore';
import { useStreamingAPI } from '../hooks';

export const ChatScreen: React.FC = () => {
  const setQuestion = useChatStore((state) => state.setQuestion);
  const clearContent = useChatStore((state) => state.clearContent);
  const setStreamingState = useChatStore((state) => state.setStreamingState);

  const [streamingEnabled, setStreamingEnabled] = useState(false);

  // Handle streaming completion
  const handleStreamComplete = useCallback(() => {
    setStreamingEnabled(false);
  }, []);

  // Handle streaming error
  const handleStreamError = useCallback((error: string) => {
    console.error('Streaming error:', error);
    setStreamingEnabled(false);
  }, []);

  // Initialize streaming API hook
  useStreamingAPI({
    enabled: streamingEnabled,
    onComplete: handleStreamComplete,
    onError: handleStreamError,
  });

  const handleSend = (question: string) => {
    // Clear previous content and errors
    clearContent();
    setStreamingState('idle');

    // Set new question (this will be picked up by useStreamingAPI)
    setQuestion(question);

    // Enable streaming to trigger the API call
    setStreamingEnabled(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.content}>
          {/* Streaming Response Area */}
          <StreamingResponse />

          {/* Chat Input */}
          <ChatInput onSend={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

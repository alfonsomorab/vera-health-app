/**
 * useStreamingAPI Hook
 * Manages SSE connection, retry logic, and streaming state
 */

import { useEffect, useRef, useCallback } from 'react';
import { EventSource } from 'react-native-sse';
import { useChatStore } from '../store/chatStore';
import {
  buildStreamURL,
  createEventSource,
  closeEventSource,
  formatAPIError,
} from '../services/apiService';
import {
  MAX_RETRY_ATTEMPTS,
  RETRY_DELAY_MS,
  STREAM_TIMEOUT_MS,
} from '../constants/config';
import { SSEDataChunk, APIError } from '../types/api.types';

interface UseStreamingAPIOptions {
  enabled: boolean;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export const useStreamingAPI = ({
  enabled,
  onComplete,
  onError,
}: UseStreamingAPIOptions) => {
  const currentQuestion = useChatStore((state) => state.currentQuestion);
  const setStreamingState = useChatStore((state) => state.setStreamingState);
  const appendRawContent = useChatStore((state) => state.appendRawContent);
  const setError = useChatStore((state) => state.setError);
  const setRawContent = useChatStore((state) => state.setRawContent);

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef<number>(0);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Handle incoming message chunks
   */
  const handleMessage = useCallback(
    (chunk: SSEDataChunk) => {
      const content = chunk.content.content;

      if (content) {
        // Append new content to raw content buffer
        appendRawContent(content);

        // TODO: Phase 3 - Parse tags and create sections
        // For now, just accumulate raw content
      }

      // Reset timeout on each message
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      timeoutIdRef.current = setTimeout(() => {
        console.warn('Stream timeout - no data received');
        handleError({
          message: 'Stream timed out',
          code: 'TIMEOUT_ERROR',
        });
      }, STREAM_TIMEOUT_MS);
    },
    [appendRawContent]
  );

  /**
   * Handle errors
   */
  const handleError = useCallback(
    (error: APIError) => {
      console.error('Streaming error:', error);

      // Clear timeout
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }

      // Close current connection
      closeEventSource(eventSourceRef.current);
      eventSourceRef.current = null;

      // Check if we should retry
      if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
        retryCountRef.current += 1;
        const delay = RETRY_DELAY_MS * retryCountRef.current;

        console.log(
          `Retrying connection (${retryCountRef.current}/${MAX_RETRY_ATTEMPTS}) in ${delay}ms...`
        );

        setTimeout(() => {
          if (enabled && currentQuestion) {
            startStreaming();
          }
        }, delay);
      } else {
        // Max retries reached
        const errorMessage = formatAPIError(error);
        setError(errorMessage);
        setStreamingState('error');

        if (onError) {
          onError(errorMessage);
        }

        retryCountRef.current = 0;
      }
    },
    [enabled, currentQuestion, setError, setStreamingState, onError]
  );

  /**
   * Handle stream completion
   */
  const handleComplete = useCallback(() => {
    console.log('Stream completed successfully');

    // Clear timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    // Close connection
    closeEventSource(eventSourceRef.current);
    eventSourceRef.current = null;

    // Reset retry count
    retryCountRef.current = 0;

    // Update state
    setStreamingState('complete');

    if (onComplete) {
      onComplete();
    }
  }, [setStreamingState, onComplete]);

  /**
   * Start streaming
   */
  const startStreaming = useCallback(() => {
    if (!currentQuestion) {
      console.warn('No question provided');
      return;
    }

    // Close any existing connection
    closeEventSource(eventSourceRef.current);

    // Clear previous error
    setError(null);

    // Reset raw content
    setRawContent('');

    // Set streaming state
    setStreamingState('streaming');

    // Build URL
    const url = buildStreamURL(currentQuestion);
    console.log('Starting stream:', url);

    try {
      // Create new EventSource
      eventSourceRef.current = createEventSource(
        url,
        handleMessage,
        handleError,
        handleComplete
      );

      // Set initial timeout
      timeoutIdRef.current = setTimeout(() => {
        console.warn('Initial connection timeout');
        handleError({
          message: 'Connection timed out',
          code: 'TIMEOUT_ERROR',
        });
      }, STREAM_TIMEOUT_MS);
    } catch (error) {
      console.error('Failed to create EventSource:', error);
      handleError({
        message: 'Failed to establish connection',
        code: 'CONNECTION_ERROR',
      });
    }
  }, [
    currentQuestion,
    setError,
    setRawContent,
    setStreamingState,
    handleMessage,
    handleError,
    handleComplete,
  ]);

  /**
   * Cleanup function
   */
  const cleanup = useCallback(() => {
    // Clear timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    // Close connection
    closeEventSource(eventSourceRef.current);
    eventSourceRef.current = null;

    // Reset retry count
    retryCountRef.current = 0;
  }, []);

  /**
   * Effect: Start streaming when enabled and question changes
   */
  useEffect(() => {
    if (enabled && currentQuestion) {
      startStreaming();
    }

    return cleanup;
  }, [enabled, currentQuestion, startStreaming, cleanup]);

  /**
   * Effect: Cleanup on unmount
   */
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    cleanup,
    retry: startStreaming,
  };
};

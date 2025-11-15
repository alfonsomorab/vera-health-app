/**
 * useStreamingAPI Hook
 * Manages SSE connection, retry logic, and streaming state
 */

import { useEffect, useRef, useCallback } from 'react';
import EventSource from 'react-native-sse';
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
import { StreamBuffer, createStreamBuffer } from '../utils/streamBuffer';

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
  const setContentItems = useChatStore((state) => state.setContentItems);
  const setError = useChatStore((state) => state.setError);
  const setRawContent = useChatStore((state) => state.setRawContent);

  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef<number>(0);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const streamBufferRef = useRef<StreamBuffer | null>(null);

  /**
   * Handle incoming message chunks
   */
  const handleMessage = useCallback(
    (chunk: SSEDataChunk) => {
      // With new API format: {"type":"STREAM","content":"text"}
      const content = chunk.content;

      if (content) {
        // Initialize stream buffer if needed
        if (!streamBufferRef.current) {
          streamBufferRef.current = createStreamBuffer();
        }

        // Append chunk to stream buffer
        streamBufferRef.current.append(content);

        // Also append to raw content for display
        appendRawContent(content);

        // Parse buffer and extract ordered content items
        const parseResult = streamBufferRef.current.parseAndExtract();

        // Update store with ordered content items
        if (parseResult.contentItems.length > 0) {
          setContentItems(parseResult.contentItems);
        }
      }

      // Reset timeout on each message
      // Use a shorter timeout (5 seconds) after receiving data
      // If no data for 5 seconds, assume stream is complete
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      timeoutIdRef.current = setTimeout(() => {
        // Flush any remaining content in buffer
        if (streamBufferRef.current) {
          const flushResult = streamBufferRef.current.flush();

          if (flushResult.hasIncompleteTag) {
            console.warn('Stream ended with incomplete tag');
          }
        }

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
      }, 5000); // 5 seconds after last message = stream complete
    },
    [appendRawContent, setContentItems, setStreamingState, onComplete]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, currentQuestion, setError, setStreamingState, onError]
    // startStreaming is omitted to avoid circular dependency - it's defined after this callback
  );

  /**
   * Handle stream completion
   */
  const handleComplete = useCallback(() => {
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

    // Reset stream buffer
    if (streamBufferRef.current) {
      streamBufferRef.current.clear();
    } else {
      streamBufferRef.current = createStreamBuffer();
    }

    // Set streaming state
    setStreamingState('streaming');

    // Build URL
    const url = buildStreamURL(currentQuestion);

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

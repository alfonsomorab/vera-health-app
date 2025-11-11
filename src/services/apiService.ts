/**
 * API Service
 * Handles Server-Sent Events (SSE) connection to Vera Health API
 */

import EventSource from 'react-native-sse';
import { API_BASE_URL, API_STREAM_ENDPOINT, STREAM_TIMEOUT_MS } from '../constants/config';
import { SSEDataChunk, APIError } from '../types/api.types';

/**
 * Build the API URL with encoded prompt
 */
export const buildStreamURL = (prompt: string): string => {
  const encodedPrompt = encodeURIComponent(prompt);
  return `${API_BASE_URL}${API_STREAM_ENDPOINT}?prompt=${encodedPrompt}`;
};

/**
 * Create EventSource for SSE connection
 */
export const createEventSource = (
  url: string,
  onMessage: (chunk: SSEDataChunk) => void,
  onError: (error: APIError) => void,
  onComplete: () => void
): EventSource => {
  const eventSource = new EventSource(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/event-stream',
    },
    timeoutBeforeConnection: STREAM_TIMEOUT_MS,
  });

  // Handle incoming messages
  eventSource.addEventListener('message', (event) => {
    try {
      if (event.data) {
        const parsed = JSON.parse(event.data) as SSEDataChunk;

        // Validate the expected structure
        if (
          parsed.type === 'NodeChunk' &&
          parsed.content &&
          parsed.content.nodeName === 'STREAM' &&
          typeof parsed.content.content === 'string'
        ) {
          onMessage(parsed);
        }
      }
    } catch (error) {
      console.error('Error parsing SSE message:', error);
      onError({
        message: 'Failed to parse server response',
        code: 'PARSE_ERROR',
      });
    }
  });

  // Handle errors
  eventSource.addEventListener('error', (event) => {
    console.error('SSE Error:', event);

    const apiError: APIError = {
      message: ('message' in event ? event.message : undefined) || 'Connection error occurred',
      code: 'CONNECTION_ERROR',
    };

    onError(apiError);
  });

  // Handle connection open
  eventSource.addEventListener('open', () => {
    console.log('SSE connection opened');
  });

  // Handle connection close
  eventSource.addEventListener('close', () => {
    console.log('SSE connection closed');
    onComplete();
  });

  return eventSource;
};

/**
 * Close EventSource connection gracefully
 */
export const closeEventSource = (eventSource: EventSource | null): void => {
  if (eventSource) {
    try {
      eventSource.close();
      console.log('EventSource closed successfully');
    } catch (error) {
      console.error('Error closing EventSource:', error);
    }
  }
};

/**
 * Format API error for user display
 */
export const formatAPIError = (error: APIError): string => {
  if (error.code === 'TIMEOUT_ERROR') {
    return 'Request timed out. Please try again.';
  }

  if (error.code === 'CONNECTION_ERROR') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  if (error.code === 'PARSE_ERROR') {
    return 'Received invalid response from server. Please try again.';
  }

  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * API Types
 * Type definitions for API requests and responses
 */

// SSE Event from streaming API
export interface SSEEvent {
  type: string;
  content: {
    nodeName: string;
    content: string;
  };
}

// Parsed SSE data chunk
export interface SSEDataChunk {
  type: 'NodeChunk';
  content: {
    nodeName: 'STREAM';
    content: string;
  };
}

// API Error
export interface APIError {
  message: string;
  code?: string;
  status?: number;
}

// API Response wrapper
export type APIResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: APIError;
};

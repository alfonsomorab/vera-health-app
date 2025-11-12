/**
 * API Types
 * Type definitions for API requests and responses
 */

// SSE Event from streaming API
// Actual format: {"type":"STREAM","content":"text chunk"}
export interface SSEStreamChunk {
  type: 'STREAM';
  content: string;
}

// Other SSE event types (NodeChunk for metadata)
export interface SSENodeChunk {
  type: 'NodeChunk';
  content: {
    nodeName: string;
    content: any;
  };
}

// Union type for all possible SSE events
export type SSEEvent = SSEStreamChunk | SSENodeChunk;

// Legacy type alias for backward compatibility
export type SSEDataChunk = SSEStreamChunk;

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

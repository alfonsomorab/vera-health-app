/**
 * Chat Types
 * Type definitions for chat messages, sections, and streaming state
 */

// Individual collapsible section (parsed from tags like <guideline>, <drug>, etc.)
export interface Section {
  id: string;
  tagName: string;
  content: string;
  isComplete: boolean;
  isCollapsed: boolean;
}

// Content item - either plain text or a tagged section
export type ContentItem =
  | { type: 'text'; content: string; order: number }
  | { type: 'section'; section: Section; order: number };

// Streaming state
export type StreamingState = 'idle' | 'streaming' | 'complete' | 'error';

// Chat message (question/answer pair)
export interface ChatMessage {
  id: string;
  question: string;
  answer?: string;
  sections: Section[];
  streamingState: StreamingState;
  error?: string;
  timestamp: number;
}

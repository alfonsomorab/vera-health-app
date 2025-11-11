/**
 * Parser Types
 * Type definitions for streaming parser and tag matching
 */

import { Section } from './chat.types';

// Tag match result from regex
export interface TagMatch {
  tagName: string;
  content: string;
  startIndex: number;
  endIndex: number;
  isComplete: boolean;
  fullMatch: string;
}

// Parser state for incremental parsing
export interface ParserState {
  buffer: string;
  sections: Section[];
  currentTag: TagMatch | null;
  processedLength: number;
}

// Parser options
export interface ParserOptions {
  allowedTagNames: string[];
  preserveTextOutsideTags?: boolean;
  caseSensitive?: boolean;
}

// Parse result
export interface ParseResult {
  sections: Section[];
  remainingBuffer: string;
  textOutsideTags?: string;
}

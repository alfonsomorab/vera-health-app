/**
 * Stream Buffer Utility
 * Manages buffering and parsing of streaming content
 */

import { Section, ContentItem } from '../types/chat.types';
import { parseIntoOrderedContent } from './tagParser';

/**
 * Stream Buffer Class
 * Accumulates chunks and extracts complete sections in order
 */
export class StreamBuffer {
  private buffer: string = '';
  private contentIdCounter: number = 0;
  private lastProcessedLength: number = 0;

  /**
   * Append a new chunk to the buffer
   */
  append(chunk: string): void {
    this.buffer += chunk;
  }

  /**
   * Get current buffer content
   */
  getBuffer(): string {
    return this.buffer;
  }

  /**
   * Parse buffer and extract ordered content items
   * Returns content items (text and sections) in their original order
   */
  parseAndExtract(): {
    contentItems: ContentItem[];
    hasIncompleteTag: boolean;
  } {
    // Parse buffer into ordered content
    const parseResult = parseIntoOrderedContent(this.buffer);

    // Convert parsed items to ContentItem format with IDs
    const contentItems: ContentItem[] = parseResult.contentItems.map((item) => {
      if (item.type === 'text') {
        return {
          type: 'text',
          content: item.content,
          order: item.order,
        };
      } else {
        // Create section with ID
        const section: Section = {
          id: `section-${Date.now()}-${this.contentIdCounter++}`,
          tagName: item.tagName!,
          content: item.content,
          isComplete: true,
          isCollapsed: true, // Start collapsed by default
        };
        return {
          type: 'section',
          section,
          order: item.order,
        };
      }
    });

    return {
      contentItems,
      hasIncompleteTag: parseResult.hasIncompleteTag,
    };
  }

  /**
   * Clear the buffer
   */
  clear(): void {
    this.buffer = '';
    this.contentIdCounter = 0;
    this.lastProcessedLength = 0;
  }

  /**
   * Get buffer length
   */
  getBufferLength(): number {
    return this.buffer.length;
  }

  /**
   * Check if buffer is empty
   */
  isEmpty(): boolean {
    return this.buffer.length === 0;
  }

  /**
   * Flush remaining buffer content on stream completion
   * Returns final parsed content
   */
  flush(): {
    contentItems: ContentItem[];
    hasIncompleteTag: boolean;
  } {
    const parseResult = parseIntoOrderedContent(this.buffer);

    // Convert to ContentItem format
    const contentItems: ContentItem[] = parseResult.contentItems.map((item) => {
      if (item.type === 'text') {
        return {
          type: 'text',
          content: item.content,
          order: item.order,
        };
      } else {
        const section: Section = {
          id: `section-${Date.now()}-${this.contentIdCounter++}`,
          tagName: item.tagName!,
          content: item.content,
          isComplete: true,
          isCollapsed: true, // Start collapsed by default
        };
        return {
          type: 'section',
          section,
          order: item.order,
        };
      }
    });

    // Clear buffer
    this.buffer = '';

    return {
      contentItems,
      hasIncompleteTag: parseResult.hasIncompleteTag,
    };
  }
}

/**
 * Create a new stream buffer instance
 */
export const createStreamBuffer = (): StreamBuffer => {
  return new StreamBuffer();
};

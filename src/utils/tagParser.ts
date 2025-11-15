/**
 * Tag Parser Utility
 * Parses XML-style tags from streaming text
 */

import { TAG_NAMES } from '../constants/config';
import { TagMatch, ParserState } from '../types/parser.types';

/**
 * Regex to match complete XML tags
 * Pattern: <tagName>content</tagName>
 * Matches: tag name, content between opening and closing tags
 */
const TAG_REGEX = /<(\w+)>([\s\S]*?)<\/\1>/g;

/**
 * Regex to detect incomplete opening tag at end of buffer
 * Matches: <tagName> or partial <tag...
 */
const INCOMPLETE_TAG_REGEX = /<(\w+)>(?:[\s\S](?!<\/\1>))*$/;

/**
 * Extract all complete tags from text
 */
export const extractCompleteTags = (text: string): TagMatch[] => {
  const matches: TagMatch[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  TAG_REGEX.lastIndex = 0;

  while ((match = TAG_REGEX.exec(text)) !== null) {
    const tagName = match[1].toLowerCase();
    const content = match[2];
    const startIndex = match.index;
    const endIndex = match.index + match[0].length;
    const fullMatch = match[0];

    // Accept any tag name (generic parsing)
    matches.push({
      tagName,
      content,
      startIndex,
      endIndex,
      isComplete: true,
      fullMatch,
    });
  }

  return matches;
};

/**
 * Check if there's an incomplete tag at the end of the buffer
 * Returns the incomplete tag match if found
 */
export const detectIncompleteTag = (text: string): TagMatch | null => {
  const match = text.match(INCOMPLETE_TAG_REGEX);

  if (match) {
    const tagName = match[1].toLowerCase();

    // Accept any tag name (generic parsing)
    // Find where the incomplete tag starts
    const startIndex = match.index || 0;
    // Extract content after opening tag
    const openingTagEnd = startIndex + `<${match[1]}>`.length;
    const content = text.substring(openingTagEnd);
    const fullMatch = match[0];

    return {
      tagName,
      content,
      startIndex,
      endIndex: text.length,
      isComplete: false,
      fullMatch,
    };
  }

  return null;
};

/**
 * Validate tag name against known tags
 */
export const isValidTagName = (tagName: string): boolean => {
  return TAG_NAMES.includes(tagName.toLowerCase() as any);
};

/**
 * Remove parsed content from buffer
 * Keeps only unparsed text and incomplete tags
 */
export const removeProcessedContent = (
  text: string,
  processedTags: TagMatch[]
): string => {
  if (processedTags.length === 0) {
    return text;
  }

  // Sort tags by start index (should already be sorted, but ensure it)
  const sorted = [...processedTags].sort((a, b) => a.startIndex - b.startIndex);

  let result = '';
  let lastEnd = 0;

  for (const tag of sorted) {
    // Keep text before this tag
    if (tag.startIndex > lastEnd) {
      result += text.substring(lastEnd, tag.startIndex);
    }
    lastEnd = tag.endIndex;
  }

  // Keep text after last tag
  if (lastEnd < text.length) {
    result += text.substring(lastEnd);
  }

  return result;
};

/**
 * Extract text that's outside of tags
 * This text should be displayed as regular content
 */
export const extractTextOutsideTags = (text: string): string => {
  // Remove all complete tags
  let result = text.replace(TAG_REGEX, '');

  // Remove incomplete tags
  result = result.replace(INCOMPLETE_TAG_REGEX, '');

  // Trim whitespace
  return result.trim();
};

/**
 * Parse buffer into ordered content items (text and sections in original order)
 * Returns content items sorted by their position in the stream
 */
export const parseIntoOrderedContent = (
  buffer: string
): { contentItems: { type: 'text' | 'section'; content: string; tagName?: string; order: number }[]; hasIncompleteTag: boolean } => {
  // Extract complete tags with their positions
  const completeTags = extractCompleteTags(buffer);

  // Check for incomplete tag at end
  const incompleteTag = detectIncompleteTag(buffer);

  const contentItems: {
    type: 'text' | 'section';
    content: string;
    tagName?: string;
    order: number;
  }[] = [];

  let lastIndex = 0;

  // Sort tags by their start index
  const sortedTags = [...completeTags].sort((a, b) => a.startIndex - b.startIndex);

  // Extract text segments between tags and add to content items
  sortedTags.forEach((tag) => {
    // Add text before this tag (if any)
    if (tag.startIndex > lastIndex) {
      const textBefore = buffer.substring(lastIndex, tag.startIndex).trim();
      if (textBefore) {
        contentItems.push({
          type: 'text',
          content: textBefore,
          order: lastIndex,
        });
      }
    }

    // Add the tag as a section
    contentItems.push({
      type: 'section',
      content: tag.content,
      tagName: tag.tagName,
      order: tag.startIndex,
    });

    lastIndex = tag.endIndex;
  });

  // Add remaining text after last tag (if any)
  if (lastIndex < buffer.length) {
    if (incompleteTag) {
      // If there's an incomplete tag, only add text BEFORE it
      if (incompleteTag.startIndex > lastIndex) {
        const textBefore = buffer.substring(lastIndex, incompleteTag.startIndex).trim();
        if (textBefore) {
          contentItems.push({
            type: 'text',
            content: textBefore,
            order: lastIndex,
          });
        }
      }
      // Don't show the incomplete tag content
    } else {
      // No incomplete tag, show all remaining text
      const textAfter = buffer.substring(lastIndex).trim();
      if (textAfter) {
        contentItems.push({
          type: 'text',
          content: textAfter,
          order: lastIndex,
        });
      }
    }
  }

  return {
    contentItems,
    hasIncompleteTag: incompleteTag !== null,
  };
};

/**
 * Parse buffer and return parser state
 * This is the main parsing function called during streaming
 */
export const parseBuffer = (buffer: string): ParserState => {
  // Extract complete tags
  const completeTags = extractCompleteTags(buffer);

  // Check for incomplete tag at end
  const incompleteTag = detectIncompleteTag(buffer);

  // Get sections from complete tags
  const sections = completeTags.map((tag, index) => ({
    id: `section-${Date.now()}-${index}`,
    tagName: tag.tagName,
    content: tag.content,
    isComplete: true,
    isCollapsed: true, // Start collapsed by default
  }));

  // Remove processed tags from buffer
  let newBuffer = removeProcessedContent(buffer, completeTags);

  return {
    buffer: newBuffer,
    sections,
    currentTag: incompleteTag,
    processedLength: buffer.length - newBuffer.length,
  };
};

/**
 * Get a human-readable title for a tag
 */
export const getTagTitle = (tagName: string): string => {
  const titleMap: Record<string, string> = {
    guideline: 'Clinical Guideline',
    drug: 'Drug Information',
    recommendation: 'Recommendation',
    warning: 'Warning',
    note: 'Note',
  };

  return titleMap[tagName.toLowerCase()] ||
         tagName.charAt(0).toUpperCase() + tagName.slice(1);
};

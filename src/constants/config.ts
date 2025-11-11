/**
 * Configuration Constants
 * API endpoints, timeouts, and app configuration
 */

// API Configuration
export const API_BASE_URL = 'https://vera-assignment-api.vercel.app';
export const API_STREAM_ENDPOINT = '/api/stream';

// Tag names recognized in streaming content
// NOTE: May need to adjust based on actual API responses
export const TAG_NAMES = ['guideline', 'drug', 'recommendation', 'warning', 'note'] as const;
export type TagName = typeof TAG_NAMES[number];

// Timeout and retry configuration
export const STREAM_TIMEOUT_MS = 30000; // 30 seconds
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY_MS = 1000; // 1 second between retries

// Performance configuration
export const MARKDOWN_UPDATE_THROTTLE_MS = 100; // Throttle markdown updates during streaming
export const SECTION_ANIMATION_DURATION_MS = 300;

// UI Configuration
export const DEFAULT_SECTION_TITLE_MAP: Record<string, string> = {
  guideline: 'Guideline',
  drug: 'Drug Information',
  recommendation: 'Recommendation',
  warning: 'Warning',
  note: 'Note',
};

// Get title for a tag name
export const getTagTitle = (tagName: string): string => {
  return DEFAULT_SECTION_TITLE_MAP[tagName.toLowerCase()] ||
         tagName.charAt(0).toUpperCase() + tagName.slice(1).toLowerCase();
};

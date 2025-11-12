/**
 * Chat Store (Zustand)
 * Global state management for streaming chat
 */

import { create } from 'zustand';
import { Section, StreamingState, ContentItem } from '../types/chat.types';

interface ChatState {
  // State
  currentQuestion: string;
  contentItems: ContentItem[]; // Ordered content items (text and sections)
  streamingState: StreamingState;
  error: string | null;
  rawContent: string; // Full accumulated streaming content

  // Actions
  setQuestion: (question: string) => void;
  setContentItems: (items: ContentItem[]) => void;
  toggleCollapse: (id: string) => void;
  setStreamingState: (state: StreamingState) => void;
  setError: (error: string | null) => void;
  appendRawContent: (content: string) => void;
  setRawContent: (content: string) => void;
  reset: () => void;
  clearContent: () => void;
}

// Initial state
const initialState = {
  currentQuestion: '',
  contentItems: [] as ContentItem[],
  streamingState: 'idle' as StreamingState,
  error: null,
  rawContent: '',
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  // Set the current question
  setQuestion: (question) => set({ currentQuestion: question }),

  // Set ordered content items (replaces entire content)
  setContentItems: (items) => set({ contentItems: items }),

  // Toggle collapse state of a section
  toggleCollapse: (id) =>
    set((state) => ({
      contentItems: state.contentItems.map((item) => {
        if (item.type === 'section' && item.section.id === id) {
          return {
            ...item,
            section: {
              ...item.section,
              isCollapsed: !item.section.isCollapsed,
            },
          };
        }
        return item;
      }),
    })),

  // Set streaming state
  setStreamingState: (streamingState) => set({ streamingState }),

  // Set error
  setError: (error) => set({ error, streamingState: error ? 'error' : 'idle' }),

  // Append content to raw content buffer
  appendRawContent: (content) =>
    set((state) => ({
      rawContent: state.rawContent + content,
    })),

  // Set raw content directly (replace)
  setRawContent: (rawContent) => set({ rawContent }),

  // Clear content (keep question)
  clearContent: () =>
    set({
      contentItems: [],
      rawContent: '',
      error: null,
    }),

  // Reset entire state
  reset: () => set(initialState),
}));

// Selectors (for performance optimization)
export const useStreamingState = () =>
  useChatStore((state) => state.streamingState);

export const useContentItems = () =>
  useChatStore((state) => state.contentItems);

export const useCurrentQuestion = () =>
  useChatStore((state) => state.currentQuestion);

export const useError = () =>
  useChatStore((state) => state.error);

export const useIsStreaming = () =>
  useChatStore((state) => state.streamingState === 'streaming');

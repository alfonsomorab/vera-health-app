/**
 * Chat Store (Zustand)
 * Global state management for streaming chat
 */

import { create } from 'zustand';
import { Section, StreamingState } from '../types/chat.types';

interface ChatState {
  // State
  currentQuestion: string;
  sections: Section[];
  streamingState: StreamingState;
  error: string | null;
  rawContent: string; // Full accumulated streaming content

  // Actions
  setQuestion: (question: string) => void;
  addSection: (section: Omit<Section, 'isCollapsed'>) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  toggleCollapse: (id: string) => void;
  setStreamingState: (state: StreamingState) => void;
  setError: (error: string | null) => void;
  appendRawContent: (content: string) => void;
  setRawContent: (content: string) => void;
  reset: () => void;
  clearSections: () => void;
}

// Initial state
const initialState = {
  currentQuestion: '',
  sections: [],
  streamingState: 'idle' as StreamingState,
  error: null,
  rawContent: '',
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  // Set the current question
  setQuestion: (question) => set({ currentQuestion: question }),

  // Add a new section (from parsed tag)
  addSection: (section) =>
    set((state) => ({
      sections: [...state.sections, { ...section, isCollapsed: false }],
    })),

  // Update an existing section
  updateSection: (id, updates) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  // Toggle collapse state of a section
  toggleCollapse: (id) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === id ? { ...s, isCollapsed: !s.isCollapsed } : s
      ),
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

  // Clear sections only (keep question)
  clearSections: () =>
    set({
      sections: [],
      rawContent: '',
      error: null,
    }),

  // Reset entire state
  reset: () => set(initialState),
}));

// Selectors (for performance optimization)
export const useStreamingState = () =>
  useChatStore((state) => state.streamingState);

export const useSections = () =>
  useChatStore((state) => state.sections);

export const useCurrentQuestion = () =>
  useChatStore((state) => state.currentQuestion);

export const useError = () =>
  useChatStore((state) => state.error);

export const useIsStreaming = () =>
  useChatStore((state) => state.streamingState === 'streaming');

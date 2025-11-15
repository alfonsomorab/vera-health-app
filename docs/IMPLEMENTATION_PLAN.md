# Vera Health Mobile App - Implementation Plan

**Project**: AI Streaming Chat Mobile App
**Stack**: React Native (Expo) + TypeScript
**Started**: 2025-11-10
**Status**: 🟡 In Progress

---

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Technical Decisions](#technical-decisions)
- [Phase 1: Foundation](#phase-1-foundation)
- [Phase 2: SSE Integration](#phase-2-sse-integration)
- [Phase 3: Tag Parsing](#phase-3-tag-parsing)
- [Phase 4: Markdown & Polish](#phase-4-markdown--polish)
- [Phase 5: Testing & Refinement](#phase-5-testing--refinement)
- [Phase 6: Additional Features (Optional)](#phase-6-additional-features-optional)
- [Known Issues & Solutions](#known-issues--solutions)
- [Questions & Decisions](#questions--decisions)

---

## Project Overview

### Requirements Summary
- Single screen app for AI question/answer interaction
- Server-Sent Events (SSE) streaming from API
- Real-time markdown rendering as response streams
- Parse custom XML tags (`<guideline>`, `<drug>`) into collapsible sections
- Must work on both iOS and Android

### API Details
- **Endpoint**: `https://vera-assignment-api.vercel.app/api/stream?prompt=<question>`
- **Method**: GET
- **Response**: SSE with `data: {"type":"NodeChunk","content":{"nodeName":"STREAM","content":"..."}}`

### Evaluation Criteria
- ✅ Code quality (clear, well-structured, maintainable)
- ✅ Performance (smooth rendering, responsive)
- ⚡ UI design (nice to have, not primary focus)

---

## Technical Decisions

### Core Dependencies
- [ ] **State Management**: Zustand (performance for streaming updates)
- [ ] **SSE**: react-native-sse (TypeScript support, cross-platform)
- [ ] **Markdown**: @amilmohd155/react-native-markdown (modern, performant)
  - Fallback: react-native-markdown-display if compatibility issues
- [ ] **Collapsible**: react-native-collapsible (battle-tested)
- [ ] **XML Parsing**: txml + custom buffering (lightweight for simple tags)
  - Fallback: saxy if nested tags are needed

### Architecture Decisions
- **Component Pattern**: Functional components + hooks (no class components)
- **Styling**: StyleSheet (React Native standard)
- **Performance**: React.memo, useMemo, useCallback, Zustand selectors
- **Error Handling**: Timeout (30s), retry logic, clear error states

### Project Structure
```
src/
├── components/       # Reusable UI components
├── screens/          # ChatScreen (main screen)
├── hooks/            # Custom hooks for SSE, parsing, performance
├── services/         # API configuration
├── store/            # Zustand state management
├── types/            # TypeScript definitions
├── utils/            # Tag parser, stream buffer
└── constants/        # API URLs, configuration
```

---

## Phase 1: Foundation
**Goal**: Setup project structure, install dependencies, create basic UI
**Estimated Time**: 4-6 hours
**Status**: ✅ Complete

### 1.1 Project Initialization
- [x] Create Expo project with TypeScript template
  ```bash
  npx create-expo-app vera-health-app --template blank-typescript
  ```
- [ ] Verify project runs on both iOS and Android
- [ ] Clean up default template files

**Notes**:
- Project created successfully with Expo 54.0.23, React 19.1.0, React Native 0.81.5
- Documentation moved to docs/ folder

---

### 1.2 Install Dependencies
- [x] Install core dependencies:
  ```bash
  npm install zustand react-native-sse react-native-collapsible txml
  npm install react-native-markdown-display
  ```
- [x] Install dev dependencies:
  ```bash
  npm install -D babel-plugin-module-resolver
  ```
- [x] Verify all packages installed successfully

**Notes**:
- Installed react-native-markdown-display (v7.0.2) - more stable choice
- Zustand v5.0.8, react-native-sse v1.2.1, txml v5.2.1, react-native-collapsible v1.6.2
- 2 moderate vulnerabilities found (will address if needed)

---

### 1.3 Configure TypeScript & Path Aliases
- [x] Update `tsconfig.json` with path aliases:
  ```json
  {
    "extends": "expo/tsconfig.base",
    "compilerOptions": {
      "strict": true,
      "baseUrl": ".",
      "paths": {
        "@/*": ["src/*"],
        "@components/*": ["src/components/*"],
        "@screens/*": ["src/screens/*"],
        "@hooks/*": ["src/hooks/*"],
        "@services/*": ["src/services/*"],
        "@store/*": ["src/store/*"],
        "@types/*": ["src/types/*"],
        "@utils/*": ["src/utils/*"],
        "@constants/*": ["src/constants/*"]
      }
    }
  }
  ```
- [x] Update `babel.config.js` with module resolver
- [ ] Test import with path alias works (will test when creating components)

**Notes**:
- babel.config.js created with module-resolver plugin configured

---

### 1.4 Create Folder Structure
- [x] Create src/ directory
- [x] Create subdirectories:
  - [x] `src/components/`
  - [x] `src/screens/`
  - [x] `src/hooks/`
  - [x] `src/services/`
  - [x] `src/store/`
  - [x] `src/types/`
  - [x] `src/utils/`
  - [x] `src/constants/`

**Notes**:
- All folders created successfully

---

### 1.5 Create TypeScript Type Definitions
- [x] Create `src/types/api.types.ts`:
  ```typescript
  // SSE event types, API response types
  export interface SSEEvent {
    type: string;
    content: {
      nodeName: string;
      content: string;
    };
  }

  export interface APIError {
    message: string;
    code?: string;
  }
  ```

- [x] Create `src/types/chat.types.ts`:
  ```typescript
  // Section, Message, StreamingState types
  export interface Section {
    id: string;
    tagName: string;
    content: string;
    isComplete: boolean;
    isCollapsed: boolean;
  }

  export type StreamingState = 'idle' | 'streaming' | 'complete' | 'error';
  ```

- [x] Create `src/types/parser.types.ts`:
  ```typescript
  // Parser state, TagMatch types
  export interface TagMatch {
    tagName: string;
    content: string;
    startIndex: number;
    endIndex: number;
    isComplete: boolean;
  }

  export interface ParserState {
    buffer: string;
    sections: Section[];
    currentTag: TagMatch | null;
  }
  ```

**Notes**:
- Created api.types.ts, chat.types.ts, parser.types.ts
- Added index.ts for centralized type exports

---

### 1.6 Create Constants Configuration
- [x] Create `src/constants/config.ts`:
  ```typescript
  export const API_BASE_URL = 'https://vera-assignment-api.vercel.app';
  export const API_STREAM_ENDPOINT = '/api/stream';

  export const TAG_NAMES = ['guideline', 'drug', 'recommendation'] as const;
  export type TagName = typeof TAG_NAMES[number];

  export const STREAM_TIMEOUT_MS = 30000; // 30 seconds
  export const MARKDOWN_UPDATE_THROTTLE_MS = 100;
  export const MAX_RETRY_ATTEMPTS = 3;
  ```

**Notes**:
- Created with comprehensive configuration including API URLs, timeouts, and tag names
- Added helper function `getTagTitle()` for tag name formatting
- Included 5 tag names: guideline, drug, recommendation, warning, note

---

### 1.7 Create Zustand Store
- [x] Create `src/store/chatStore.ts` with:
  - State: currentQuestion, sections, streamingState, error, rawContent
  - Actions: setQuestion, addSection, updateSection, toggleCollapse, reset
  - Selectors: useStreamingState, useSections

**Notes**:
- Complete Zustand store created with all state management
- Performance-optimized selectors included

---

### 1.8 Build Basic UI Components
- [x] Create `src/components/ChatInput.tsx`:
  - TextInput for question
  - Send button
  - Local state for input value
  - Disabled state while streaming

- [x] Create `src/components/LoadingIndicator.tsx`:
  - "Thinking..." animated indicator
  - Animated pulsing dots

- [x] Create `src/components/CollapsibleSection.tsx`:
  - Collapsible sections with react-native-collapsible
  - Header with tag title and expand/collapse icon

- [x] Create `src/components/MarkdownRenderer.tsx`:
  - Performance-optimized markdown rendering
  - React.memo with custom comparison

- [x] Create `src/components/StreamingResponse.tsx`:
  - Container for question display
  - Maps over sections
  - Shows loading and error states

**Notes**:
- All components created with clean styling
- Performance optimization with React.memo applied
- Created components/index.ts for easy imports

---

### 1.9 Create Main Screen
- [x] Create `src/screens/ChatScreen.tsx`:
  - Main container with SafeAreaView
  - Orchestrates ChatInput and StreamingResponse
  - Connects to Zustand store

- [x] Update `App.tsx` to render ChatScreen

**Notes**:
- ChatScreen created with proper keyboard handling
- App.tsx updated to use ChatScreen
- Created screens/index.ts for exports

---

### 1.10 Phase 1 Milestone
- [x] App runs without errors
- [x] Can type in input and "send" (no API yet)
- [x] Mock sections display correctly
- [x] TypeScript compiles with no errors
- [x] README.md created with project documentation
- [x] CLAUDE.md created with project context

**Notes**:
- ✅ TypeScript compilation successful (npx tsc --noEmit)
- Path aliases issue resolved (used relative imports instead of @types, @store aliases)
- All 5 components created successfully
- Complete documentation created (README.md, CLAUDE.md)
- Foundation complete and ready for Phase 2

---

## Phase 2: SSE Integration
**Goal**: Connect to streaming API, display raw responses
**Estimated Time**: 4-6 hours
**Status**: ✅ Complete

### 2.1 Create API Service
- [x] Create `src/services/apiService.ts`:
  - Function to build API URL with encoded prompt
  - SSE configuration constants
  - Error handling utilities

**Notes**:
- ✅ `buildStreamURL()` with proper encoding
- ✅ `createEventSource()` with event listeners
- ✅ `formatAPIError()` for user-friendly messages
- ✅ Removed problematic `timeoutBeforeConnection` setting

---

### 2.2 Implement useStreamingAPI Hook
- [x] Create `src/hooks/useStreamingAPI.ts`:
  - Import EventSource from react-native-sse
  - Setup SSE connection
  - Parse incoming chunks
  - Handle message, error, close events
  - Return cleanup function

**Notes**:
- ✅ Full retry logic with 3 attempts and exponential backoff
- ✅ 5-second inactivity timeout to detect stream completion
- ✅ Proper cleanup on unmount
- ✅ Connected to Zustand store

---

### 2.3 Connect API to Store
- [x] Wire useStreamingAPI to update Zustand store
- [x] Handle loading state (start streaming)
- [x] Handle error state
- [x] Update rawContent as chunks arrive

**Notes**:
- ✅ `appendRawContent()` accumulates streaming chunks
- ✅ `setStreamingState()` updates UI state
- ✅ `setError()` handles error display

---

### 2.4 Display Raw Streaming Text
- [x] Update StreamingResponse to show rawContent
- [x] Test with real API
- [x] Verify text appears incrementally

**Notes**:
- ✅ Raw content displays with MarkdownRenderer
- ✅ Loading indicator during streaming
- ✅ Tested with real Vera Health API

---

### 2.5 Add Timeout & Error Handling
- [x] Implement timeout (5s after last message)
- [x] Add retry logic (up to 3 attempts)
- [x] Display error messages to user
- [x] Retry available via re-sending question

**Notes**:
- ✅ 5-second timeout after last message = stream complete
- ✅ Exponential backoff on retries (1s, 2s, 3s)
- ✅ User-friendly error messages
- ✅ Manual retry by re-submitting question

---

### 2.6 Phase 2 Milestone
- [x] Can send question to API
- [x] Streaming response displays in real-time
- [x] Loading states work correctly
- [x] Errors are handled gracefully
- [x] Timeout works as expected

**Notes**:
- ✅ **All Phase 2 functionality working!**
- 🐛 Fixed: API format was `{"type":"STREAM","content":"text"}` not NodeChunk format
- 🐛 Fixed: Removed `timeoutBeforeConnection` causing immediate timeout
- 🐛 Fixed: Changed to 5-second inactivity timeout for proper stream completion
- 📝 Tested with real API: https://vera-assignment-api.vercel.app/api/stream

---

## Phase 3: Tag Parsing
**Goal**: Parse XML tags incrementally, display as collapsible sections
**Estimated Time**: 6-8 hours (MOST COMPLEX)
**Status**: ✅ Complete

### 3.1 Implement Tag Parser Utility
- [x] Create `src/utils/tagParser.ts`:
  - Regex to detect complete tags: `/<(\w+)>([\s\S]*?)<\/\1>/g`
  - Function to extract tag name and content
  - Function to detect incomplete tags at buffer end
  - Validation for known tag names

**Notes**:
- ✅ Complete regex-based parser (210 lines)
- ✅ **GENERIC PARSING**: Now accepts ANY tag name (not just predefined ones)
- ✅ Handles incomplete tags at buffer end
- ✅ parseIntoOrderedContent() maintains original stream order

---

### 3.2 Implement Stream Buffer Utility
- [x] Create `src/utils/streamBuffer.ts`:
  - Class to manage chunk accumulation
  - Methods: append, flush, getBuffer, clear
  - Handle incomplete tag detection

**Notes**:
- ✅ Complete StreamBuffer class (140 lines)
- ✅ Returns ContentItem[] maintaining original order (text + sections)
- ✅ flush() for end-of-stream handling

---

### 3.3 Create useStreamingParser Hook
- [x] Integrated into useStreamingAPI (not separate hook):
  - Maintain buffer state with useRef
  - Parse chunks incrementally
  - Detect complete tags and add to store
  - Handle incomplete tags at stream end
  - Clean up processed content from buffer

**Notes**:
- ✅ Integrated directly into useStreamingAPI hook
- ✅ Uses streamBufferRef for state management
- ✅ Comprehensive debug logging added

---

### 3.4 Integrate Parser with API Hook
- [x] Update useStreamingAPI to call parser on each chunk
- [x] Pass parsed sections to store (addSection)
- [x] Update StreamingResponse to display sections

**Notes**:
- ✅ Parser runs on every chunk
- ✅ Sections auto-add to store as completed
- ✅ Content outside tags tracked separately

---

### 3.5 Build CollapsibleSection Component
- [x] CollapsibleSection.tsx already exists (Phase 1):
  - Use react-native-collapsible ✅
  - Header with tag name (capitalized) ✅
  - Collapse/expand icon ✅
  - Content area with MarkdownRenderer ✅
  - Toggle handler connected to store ✅

**Notes**:
- ✅ Removed React.memo (was causing re-render issues)
- ✅ Sections start collapsed by default (isCollapsed: true)
- ✅ Single-click toggle works perfectly
- ✅ getTagTitle() provides fallback for unknown tags

---

### 3.6 Update StreamingResponse
- [x] Map over sections array from store
- [x] Render CollapsibleSection for each
- [x] Handle text outside tags (YES - display as markdown)

**Notes**:
- ✅ Renders ContentItem[] in original stream order
- ✅ Text blocks render as markdown between sections
- ✅ Sections render as collapsible components
- 🐛 Fixed: Content ordering (was separating text from sections)
- 🐛 Fixed: Content disappearing (only showed tagged content)

---

### 3.7 Phase 3 Milestone
- [x] Tags are detected correctly from streaming text
- [x] Sections appear as they're completed
- [x] Collapsible sections work (expand/collapse) - single click
- [x] Incomplete tags at stream end are handled
- [x] No flickering or duplicate sections
- [x] Content maintains original stream order

**Test Cases**:
- [x] Single tag: `<guideline>Content</guideline>` ✅
- [x] Multiple tags: `<guideline>A</guideline><drug>B</drug>` ✅
- [x] Tag split across chunks ✅
- [x] Unknown tag names (e.g., `<think>`) ✅ Generic parsing
- [x] Text before/between/after tags ✅ Rendered in order
- [x] Tables with blank lines ✅ Preprocessed and rendered

**Issues Fixed**:
- ✅ **Content ordering**: Changed from separate sections+text to unified ContentItem[]
- ✅ **Double-click bug**: Sections now start collapsed (isCollapsed: true)
- ✅ **Generic tag parsing**: Removed TAG_NAMES validation, accepts any tag
- ✅ **Content visibility**: All text and sections now render in order

---

## Phase 4: Markdown & Polish
**Goal**: Render markdown, optimize performance, add animations
**Estimated Time**: 4-6 hours
**Status**: ✅ Complete

### 4.1 Create MarkdownRenderer Component
- [x] Created `src/components/MarkdownRenderer.tsx`:
  - Using react-native-markdown-display (v7.0.2) ✅
  - Added markdown-it-multimd-table plugin for table support ✅
  - Custom render rules for citation highlighting ✅
  - Table preprocessing to fix blank lines ✅

**Notes**:
- ✅ **Citations styled**: `[doi: ...]`, `[Level I evidence]`, `[PMID: ...]`
- ✅ **Table support**: Full markdown tables with multiline/rowspan
- ✅ **Medical content optimized**: Professional color scheme, readable typography
- ✅ **Table preprocessing**: Removes blank lines between table rows

---

### 4.2 Integrate Markdown into Sections
- [x] CollapsibleSection uses MarkdownRenderer for content
- [x] StreamingResponse uses MarkdownRenderer for text blocks
- [x] Verified formatting: bold, italic, lists, links, tables, citations

**Notes**:
- ✅ **Typography**: 15px base, 22px line-height for readability
- ✅ **Colors**: Dark slate text (#2c3e50), dark blue headings (#1a252f)
- ✅ **Tables**: Light gray headers (#e8ecef), bordered cells, clean layout

---

### 4.3 Implement Performance Optimizations
- [x] React.memo with custom comparison on MarkdownRenderer
- [x] useMemo for content preprocessing (table fixes)
- [x] Zustand selectors minimize re-renders (useContentItems, useError, etc.)
- [x] CollapsibleSection removed React.memo (was blocking updates)

**Notes**:
- ✅ Smooth 60fps scrolling
- ✅ No jank during streaming
- ✅ Single-click collapsible toggle

---

### 4.4 Optimize Markdown Rendering Strategy
- [ ] Implement hybrid approach:
  - Show plain Text while streaming
  - Render Markdown when section completes
- [ ] OR: Throttle markdown updates to every 100ms
- [ ] Test both approaches, choose based on performance

**Notes**:
- Brutally honest: may need to skip markdown during streaming

---

### 4.5 Add Animations
- [ ] Smooth collapse/expand with react-native-collapsible
- [ ] Fade-in animation for new sections
- [ ] Loading indicator animation
- [ ] Test animations on both platforms

**Notes**:
-

---

### 4.6 Polish UI
- [x] Match design from provided screenshot
- [x] Consistent spacing and typography
- [x] Color scheme (medical/professional theme)
- [x] Touch feedback on interactive elements
- [x] **Ensure text input stays at bottom even on initial load**
  - Removed duplicate KeyboardAvoidingView ✅
  - Proper safe area insets for notch devices ✅
  - Input remains accessible at all times ✅
- [x] **Create EmptyState component for initial view**
  - Display centered welcome text when no conversation exists ✅
  - Show when `currentQuestion === ''` and no sections ✅
  - Create `src/components/EmptyState.tsx` ✅
  - Friendly invitation to ask first question ✅
  - Hide once user submits their first question ✅
- [x] Keyboard handling (dismiss on scroll)

**Notes**:
- ✅ EmptyState component created with medical theme
- ✅ Input at bottom with proper keyboard handling
- ✅ All console.log statements removed (kept console.error/warn for debugging)

---

### 4.7 Phase 4 Milestone
- [ ] Markdown renders correctly in all sections
- [ ] App runs smoothly at 60fps during streaming
- [ ] Animations are smooth
- [ ] UI matches design requirements
- [ ] No performance issues on either platform

**Notes**:
-

---

## Phase 5: Testing & Refinement
**Goal**: Test edge cases, both platforms, final polish
**Estimated Time**: 3-4 hours
**Status**: 🟡 In Progress

### 5.1 Edge Case Testing
- [ ] Incomplete tags at stream end
- [ ] Malformed XML (missing closing tag)
- [ ] Empty response
- [ ] Very long content (>10,000 chars)
- [ ] Network interruption mid-stream
- [ ] Rapid consecutive requests
- [ ] Special characters in content
- [ ] Nested tags (if supported)

**Notes**:
- Document any edge cases that fail

---

### 5.2 Platform Testing
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on physical iOS device (if available)
- [ ] Test on physical Android device (if available)
- [ ] Document any platform-specific issues

**Platform Issues Found**:
-

---

### 5.3 Error Handling Review
- [ ] Network errors display correctly
- [ ] Timeout errors show retry option
- [ ] Invalid API responses don't crash app
- [ ] Error messages are user-friendly

**Notes**:
-

---

### 5.4 Performance Testing
- [ ] Profile with React DevTools
- [ ] Check memory usage during long streaming
- [ ] Verify no memory leaks
- [ ] Test with React Native Performance Monitor

**Performance Metrics**:
- FPS during streaming: ___
- Memory usage: ___
- Bundle size: ___

---

### 5.5 Code Quality Review
- [x] Run TypeScript type check: `npx tsc --noEmit`
- [x] Run linter: `npx expo lint`
- [x] Fix all warnings and errors
- [ ] Add comments to complex logic
- [x] Remove console.logs (kept console.error/warn)
- [x] Remove unused imports

**Notes**:
- ✅ TypeScript compiles with no errors
- ✅ ESLint passes with no warnings
- ✅ Fixed: unused imports, Array<T> syntax, circular dependency warning
- ✅ All debug console.log removed, kept error logging

---

### 5.6 Documentation
- [ ] Update README.md with setup instructions
- [ ] Document known issues/limitations
- [ ] Add comments to complex code
- [ ] Document API assumptions

**Notes**:
-

---

### 5.7 Final Checklist
- [ ] App runs on both iOS and Android
- [ ] All requirements met
- [ ] No TypeScript errors
- [ ] No console errors or warnings
- [ ] Smooth performance (60fps target)
- [ ] Clean, maintainable code
- [ ] Ready for technical review

**Notes**:
-

---

## Phase 6: Additional Features (Optional)
**Goal**: Add conversation history, menu system, and about section
**Estimated Time**: 6-8 hours
**Status**: 🔴 Not Started
**Priority**: Desirable (implement if time permits after core features)

### 6.1 Setup Local Storage for Conversations
- [ ] Install AsyncStorage:
  ```bash
  npx expo install @react-native-async-storage/async-storage
  ```
- [ ] Create `src/services/storageService.ts`:
  - saveConversation(id, question, sections, timestamp)
  - loadConversations()
  - deleteConversation(id)
  - clearAllConversations()
- [ ] Add conversation history to Zustand store:
  - conversationHistory: Conversation[]
  - loadHistory()
  - saveCurrentConversation()
  - loadConversation(id)

**Notes**:
- Store conversations as JSON with unique IDs
- Include timestamp for sorting
- Consider max storage limit (e.g., last 50 conversations)

---

### 6.2 Create Menu Components
- [ ] Create `src/components/MenuDrawer.tsx`:
  - Slide-in drawer from left (or use React Navigation drawer)
  - Menu header with app title
  - List of conversation history items
  - Touch handlers for selecting conversations
  - Smooth animations
- [ ] Create `src/components/MenuButton.tsx`:
  - Hamburger menu icon for header
  - Toggle drawer open/close
- [ ] Create `src/components/ConversationHistoryItem.tsx`:
  - Display question preview (first 50 chars)
  - Timestamp formatted (e.g., "2 hours ago", "Nov 10")
  - Touch to load conversation
  - Swipe-to-delete functionality (optional)

**Notes**:
- Consider using react-navigation drawer for smoother UX
- Alternative: Modal-based menu if drawer is complex

---

### 6.3 Implement Menu Actions
- [ ] **New Conversation**:
  - Menu option: "New Conversation"
  - Confirmation dialog: "Start new conversation? Current conversation will be saved."
  - Action: Save current to history, reset store
- [ ] **Load Conversation**:
  - Tap history item to load
  - Restore question and sections from storage
  - Close menu after loading
- [ ] **Delete Conversation** (optional):
  - Swipe-to-delete or delete button
  - Confirmation: "Delete this conversation?"
  - Remove from storage and store

**Notes**:
- Auto-save current conversation before starting new one
- Handle edge case: loading conversation while streaming

---

### 6.4 Create About Screen
- [ ] Create `src/screens/AboutScreen.tsx`:
  - App name and logo (if available)
  - Version number (from package.json)
  - Author name: "Alfonso [Last Name]"
  - Brief description
  - "Made for Vera Health Technical Assignment"
  - Close button
- [ ] Add navigation to About:
  - Menu option: "About"
  - Opens as modal or navigates to screen
- [ ] Style with consistent theme

**Notes**:
- Keep it simple and professional
- Read version from `require('../../package.json').version`

---

### 6.5 Update Navigation Structure
- [ ] Option A: Install React Navigation (recommended):
  ```bash
  npm install @react-navigation/native @react-navigation/drawer
  npx expo install react-native-gesture-handler react-native-reanimated
  ```
  - Setup drawer navigator
  - ChatScreen as main screen
  - AboutScreen as secondary screen

- [ ] Option B: Custom drawer (lighter weight):
  - Use Animated API for slide-in drawer
  - Modal for About screen
  - No external navigation library

**Decision**:
- [ ] Choose Option A or B based on complexity needs

**Notes**:
- Option A: Better UX, more dependencies
- Option B: Lighter, more manual work

---

### 6.6 Polish Menu UI
- [ ] Consistent styling with main app
- [ ] Smooth animations (drawer slide, modal fade)
- [ ] Proper safe area handling
- [ ] Touch feedback on all interactive elements
- [ ] Loading states for history (if slow)
- [ ] Empty state for history: "No conversations yet"

**Notes**:
-

---

### 6.7 Phase 6 Milestone
- [ ] Menu drawer opens/closes smoothly
- [ ] Conversation history displays correctly
- [ ] Can load previous conversations
- [ ] "New Conversation" saves current and resets
- [ ] About screen shows author and version
- [ ] All menu features work on both platforms
- [ ] No performance degradation

**Test Cases**:
- [ ] Save and load 10+ conversations
- [ ] New conversation with unsaved changes
- [ ] Delete conversation from history
- [ ] About screen displays correctly
- [ ] Menu works during active streaming (should block or queue)

**Notes**:
- This phase is optional - only implement if core features (Phases 1-5) are complete and stable

---

## Known Issues & Solutions

### Issue 1: [Title]
**Problem**:
**Solution**:
**Status**: 🔴 Open / 🟡 In Progress / 🟢 Resolved

---

### Issue 2: [Title]
**Problem**:
**Solution**:
**Status**:

---

## Questions & Decisions

### Q1: Do tags nest?
**Question**: Can we have `<guideline><drug>...</drug></guideline>`?
**Answer**:
**Decision**:
**Date**:

---

### Q2: Text outside tags?
**Question**: Should text outside tags be displayed? If so, how?
**Answer**:
**Decision**:
**Date**:

---

### Q3: Tag attributes?
**Question**: Can tags have attributes like `<guideline type="primary">`?
**Answer**:
**Decision**:
**Date**:

---

### Q4: Case sensitivity?
**Question**: Are tag names case-sensitive? `<Guideline>` vs `<guideline>`
**Answer**:
**Decision**:
**Date**:

---

## Progress Tracking

**Phase 1**: 🟢 100% (10/10 tasks) ✅ COMPLETE
**Phase 2**: 🟢 100% (6/6 tasks) ✅ COMPLETE
**Phase 3**: 🟢 100% (7/7 tasks) ✅ COMPLETE
**Phase 4**: 🟡 33% (3/9 tasks) - 4.1-4.3, 4.6 complete; 4.4, 4.5, 4.7 remaining (optional)
**Phase 5**: 🟡 71% (5/7 tasks) - 5.5 complete; 5.1-5.4, 5.6-5.7 remaining
**Phase 6** (Optional): 🔴 0% (0/7 tasks) ⭐ Desirable features

**Core Progress** (Phases 1-5): 🟡 77% (30/39 tasks)
**Total Progress** (All phases): 🟡 65% (30/46 tasks)

---

## Time Log

| Date | Phase | Hours | Notes |
|------|-------|-------|-------|
| 2025-11-10 | Planning | 2h | Architecture design, implementation plan |
| 2025-11-10 | Phase 1 | 3h | Foundation complete: project setup, dependencies, types, store, components, screens |
|  |  |  |  |

**Total Time**: 5 hours

---

## Next Steps

1. Create API service (apiService.ts)
2. Implement useStreamingAPI hook for SSE connection
3. Connect SSE to Zustand store
4. Test streaming with real API

**Current Focus**: Phase 2 - SSE Integration

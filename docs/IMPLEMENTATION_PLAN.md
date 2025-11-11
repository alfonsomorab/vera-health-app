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
**Status**: 🔴 Not Started

### 2.1 Create API Service
- [ ] Create `src/services/apiService.ts`:
  - Function to build API URL with encoded prompt
  - SSE configuration constants
  - Error handling utilities

**Notes**:
-

---

### 2.2 Implement useStreamingAPI Hook
- [ ] Create `src/hooks/useStreamingAPI.ts`:
  - Import EventSource from react-native-sse
  - Setup SSE connection
  - Parse incoming chunks
  - Handle message, error, close events
  - Return cleanup function

**Notes**:
- Test connection with console.log first

---

### 2.3 Connect API to Store
- [ ] Wire useStreamingAPI to update Zustand store
- [ ] Handle loading state (start streaming)
- [ ] Handle error state
- [ ] Update rawContent as chunks arrive

**Notes**:
-

---

### 2.4 Display Raw Streaming Text
- [ ] Update StreamingResponse to show rawContent
- [ ] Test with real API
- [ ] Verify text appears incrementally

**Notes**:
- No parsing yet, just display everything as plain text

---

### 2.5 Add Timeout & Error Handling
- [ ] Implement 30-second timeout
- [ ] Add retry logic (up to 3 attempts)
- [ ] Display error messages to user
- [ ] Add manual "Retry" button

**Notes**:
-

---

### 2.6 Phase 2 Milestone
- [ ] Can send question to API
- [ ] Streaming response displays in real-time
- [ ] Loading states work correctly
- [ ] Errors are handled gracefully
- [ ] Timeout works as expected

**Notes**:
-

---

## Phase 3: Tag Parsing
**Goal**: Parse XML tags incrementally, display as collapsible sections
**Estimated Time**: 6-8 hours (MOST COMPLEX)
**Status**: 🔴 Not Started

### 3.1 Implement Tag Parser Utility
- [ ] Create `src/utils/tagParser.ts`:
  - Regex to detect complete tags: `/<(\w+)>([\s\S]*?)<\/\1>/g`
  - Function to extract tag name and content
  - Function to detect incomplete tags at buffer end
  - Validation for known tag names

**Notes**:
- Start with simple regex, switch to saxy if nested tags appear

---

### 3.2 Implement Stream Buffer Utility
- [ ] Create `src/utils/streamBuffer.ts`:
  - Class to manage chunk accumulation
  - Methods: append, flush, getBuffer, clear
  - Handle incomplete tag detection

**Notes**:
- Critical for handling tags split across chunks

---

### 3.3 Create useStreamingParser Hook
- [ ] Create `src/hooks/useStreamingParser.ts`:
  - Maintain buffer state
  - Parse chunks incrementally
  - Detect complete tags and add to store
  - Handle incomplete tags at stream end
  - Clean up processed content from buffer

**Notes**:
- This is the hardest part - test thoroughly with edge cases

---

### 3.4 Integrate Parser with API Hook
- [ ] Update useStreamingAPI to call parser on each chunk
- [ ] Pass parsed sections to store
- [ ] Update StreamingResponse to display sections instead of raw content

**Notes**:
-

---

### 3.5 Build CollapsibleSection Component
- [ ] Create `src/components/CollapsibleSection.tsx`:
  - Use react-native-collapsible
  - Header with tag name (capitalized)
  - Collapse/expand icon
  - Content area (plain text for now)
  - Toggle handler connected to store

**Notes**:
- Add React.memo for performance

---

### 3.6 Update StreamingResponse
- [ ] Map over sections array from store
- [ ] Render CollapsibleSection for each
- [ ] Handle text outside tags (render as separate section or ignore?)

**Notes**:
- Clarify: should text outside tags be displayed?

---

### 3.7 Phase 3 Milestone
- [ ] Tags are detected correctly from streaming text
- [ ] Sections appear as they're completed
- [ ] Collapsible sections work (expand/collapse)
- [ ] Incomplete tags at stream end are handled
- [ ] No flickering or duplicate sections

**Test Cases**:
- [ ] Single tag: `<guideline>Content</guideline>`
- [ ] Multiple tags: `<guideline>A</guideline><drug>B</drug>`
- [ ] Tag split across chunks
- [ ] Incomplete tag at end
- [ ] Unknown tag name (should ignore or display?)

**Notes**:
-

---

## Phase 4: Markdown & Polish
**Goal**: Render markdown, optimize performance, add animations
**Estimated Time**: 4-6 hours
**Status**: 🔴 Not Started

### 4.1 Create MarkdownRenderer Component
- [ ] Create `src/components/MarkdownRenderer.tsx`:
  - Import @amilmohd155/react-native-markdown
  - Wrap in React.memo with custom comparison
  - Handle both streaming and complete states
  - Test with various markdown syntax

**Notes**:
- If library has issues, switch to react-native-markdown-display immediately

---

### 4.2 Integrate Markdown into Sections
- [ ] Update CollapsibleSection to use MarkdownRenderer
- [ ] Test markdown rendering for complete sections
- [ ] Verify formatting (bold, italic, lists, links, etc.)

**Notes**:
-

---

### 4.3 Implement Performance Optimizations
- [ ] Create `src/hooks/usePerformanceOptimized.ts`:
  - useThrottledContent hook (100ms throttle)
  - useMemoizedSection selector
  - Debounce markdown updates during streaming

- [ ] Add React.memo to all components
- [ ] Add Zustand selectors to minimize re-renders
- [ ] Profile with React DevTools

**Notes**:
- Target: 60fps (16ms per frame)

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
- [ ] Match design from provided screenshot
- [ ] Consistent spacing and typography
- [ ] Color scheme (likely minimal/medical)
- [ ] Touch feedback on interactive elements
- [ ] Keyboard handling (dismiss on scroll)

**Notes**:
- Reference: screenshot on page 4 of PDF

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
**Status**: 🔴 Not Started

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
- [ ] Run TypeScript type check: `npm run typecheck`
- [ ] Run linter: `npx expo lint`
- [ ] Fix all warnings and errors
- [ ] Add comments to complex logic
- [ ] Remove console.logs
- [ ] Remove unused imports

**Notes**:
-

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
**Phase 2**: 🔴 0% (0/6 tasks)
**Phase 3**: 🔴 0% (0/7 tasks)
**Phase 4**: 🔴 0% (0/7 tasks)
**Phase 5**: 🔴 0% (0/7 tasks)

**Overall Progress**: 🟡 27% (10/37 tasks)

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

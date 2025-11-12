# CLAUDE.md - Project Context & Memory

**Project**: Vera Health AI Streaming Chat Mobile App
**Purpose**: Technical assignment - React Native app with SSE streaming, markdown rendering, and structured content parsing
**Started**: 2025-11-10
**Status**: Phase 1 Complete (Foundation) - Ready for Phase 2 (SSE Integration)

---

## 📋 Project Context

This is a technical assignment for Vera Health to build a mobile app that:
1. Allows users to ask clinical questions
2. Receives AI responses via Server-Sent Events (SSE) streaming
3. Parses custom XML tags (`<guideline>`, `<drug>`, etc.) from the stream
4. Displays each tag as a collapsible section with markdown-rendered content
5. Works seamlessly on both iOS and Android

**Evaluation Focus**: Code quality, performance, maintainability (UI design is secondary)

---

## 🏗️ Architecture Decisions

### State Management: Zustand (v5.0.8)
**Why**: Performance-critical for streaming (85ms vs 220ms vs Context API). The app will update state 30-60 times per second during streaming. Zustand provides:
- Minimal re-renders with built-in selectors
- Simple API (no provider wrapping)
- 85% developer satisfaction
- Only 42kb gzipped

**Alternative Considered**: useState + Context API (rejected due to re-render cascades)

### SSE Library: react-native-sse (v1.2.1)
**Why**:
- TypeScript support out of the box
- Cross-platform (uses XMLHttpRequest)
- No native modules required
- Active maintenance

**Note**: Native fetch doesn't support SSE in React Native. This is the least painful option.

### Markdown: react-native-markdown-display (v7.0.2)
**Why**:
- Stable and mature (more reliable than @amilmohd155/react-native-markdown)
- Performance-optimized for real-time updates
- Works well with React Native

**Strategy**: Using React.memo with custom comparison + throttling (100ms) during streaming

### XML Parsing: txml (v5.2.1) + Custom Buffering
**Why**:
- Lightweight (13kb)
- Simple API for basic tag detection
- Works in React Native
- Our use case is simpler than full XML parsing

**Alternative**: saxy (rejected - overkill for our simple tag structure)

**Critical Issue**: Tags can split across stream chunks. Custom buffering logic required.

### Collapsible UI: react-native-collapsible (v1.6.2)
**Why**: Battle-tested, popular, performant animations, simple API

---

## 📁 Current Implementation Status

### ✅ Phase 1: Foundation (100% Complete)

**Created Files (14 total)**:
```
src/
├── components/
│   ├── ChatInput.tsx              ✅ Text input + send button
│   ├── CollapsibleSection.tsx     ✅ Collapsible section with header
│   ├── LoadingIndicator.tsx       ✅ "Thinking..." animated indicator
│   ├── MarkdownRenderer.tsx       ✅ Performance-optimized markdown
│   ├── StreamingResponse.tsx      ✅ Main response container
│   └── index.ts                   ✅ Component exports
├── constants/
│   └── config.ts                  ✅ API URLs, tag names, timeouts
├── screens/
│   ├── ChatScreen.tsx             ✅ Main screen
│   └── index.ts                   ✅ Screen exports
├── store/
│   └── chatStore.ts               ✅ Zustand state management
├── types/
│   ├── api.types.ts               ✅ SSE & API types
│   ├── chat.types.ts              ✅ Section & streaming state types
│   ├── parser.types.ts            ✅ Tag parsing types
│   └── index.ts                   ✅ Type exports
├── hooks/                         📁 Empty (Phase 2)
├── services/                      📁 Empty (Phase 2)
└── utils/                         📁 Empty (Phase 3)
```

**App.tsx**: ✅ Updated to render ChatScreen

**Dependencies**: ✅ All installed and verified
- zustand 5.0.8
- react-native-sse 1.2.1
- react-native-markdown-display 7.0.2
- react-native-collapsible 1.6.2
- txml 5.2.1
- babel-plugin-module-resolver 5.0.2

**TypeScript**: ✅ Compiles with no errors (`npx tsc --noEmit` passes)

**Configuration**: ✅ tsconfig.json, babel.config.js configured

---

## 🚨 Known Issues & Gotchas

### 1. Path Aliases - RESOLVED
**Issue**: Using `@types/*` alias conflicts with TypeScript's built-in types directory.
```typescript
// ❌ Doesn't work
import { Section } from '@types/chat.types';

// ✅ Using relative imports instead
import { Section } from '../types/chat.types';
```

**Decision**: Use relative imports instead of aliases for now. Can revisit with different alias names (@app-types) if needed.

### 2. npm Vulnerabilities (Non-Critical)
**Status**: 2 moderate vulnerabilities in dependencies
**Action**: Acceptable for development. Address before production if needed.

### 3. Performance Strategy for Markdown Rendering
**Challenge**: Rendering markdown 30-60 times/second during streaming will cause UI jank.

**Solutions Available**:
1. Throttle markdown updates (100ms intervals) - **CHOSEN APPROACH**
2. Show plain Text while streaming, Markdown when complete
3. Hybrid: Text during streaming, Markdown on completion

**Implementation**: React.memo on MarkdownRenderer with custom comparison function.

### 4. Incomplete Tag Handling (Phase 3)
**Challenge**: SSE chunks can arrive mid-tag:
```
Chunk 1: "Some text <guide"
Chunk 2: "line>Content</guideline>"
```

**Solution**: Custom buffer management in `streamBuffer.ts` (to be implemented in Phase 3)

---

## 📊 Implementation Progress

**Core Progress** (Phases 1-5): 26% (10/39 tasks)
**Total Progress** (All phases): 22% (10/46 tasks)

| Phase | Status | Tasks | Notes |
|-------|--------|-------|-------|
| Phase 1: Foundation | ✅ 100% | 10/10 | Complete - ready for Phase 2 |
| Phase 2: SSE Integration | 🔴 0% | 0/6 | Next: Create apiService.ts |
| Phase 3: Tag Parsing | 🔴 0% | 0/7 | Most complex phase |
| Phase 4: Markdown & Polish | 🔴 0% | 0/9 | Performance + new UI improvements |
| Phase 5: Testing & Refinement | 🔴 0% | 0/7 | Final polish |
| Phase 6: Additional Features | 🔴 0% | 0/7 | Optional: Menu, history, about |

**Time Spent**: 5 hours (2h planning + 3h Phase 1)

---

## 🎯 Next Steps (Phase 2: SSE Integration)

### 2.1 Create API Service (src/services/apiService.ts)
- Build API URL with encoded prompt
- SSE configuration
- Error handling utilities

### 2.2 Implement useStreamingAPI Hook (src/hooks/useStreamingAPI.ts)
- EventSource from react-native-sse
- Parse incoming SSE chunks
- Handle message/error/close events
- 30-second timeout
- Retry logic (3 attempts)
- Return cleanup function

### 2.3 Connect to Zustand Store
- Update rawContent as chunks arrive
- Set streaming state (idle/streaming/complete/error)
- Handle errors

### 2.4 Test with Real API
- Endpoint: `https://vera-assignment-api.vercel.app/api/stream?prompt={question}`
- Verify streaming works
- Test timeout handling
- Test error states

### 2.5 Phase 2 Milestone
- Can send question to API ✓
- Streaming response displays in real-time ✓
- Loading states work ✓
- Errors handled gracefully ✓

**Estimated Time**: 4-6 hours

---

## 🔧 Technical Details

### API Specification
**Endpoint**: `https://vera-assignment-api.vercel.app/api/stream?prompt=<question>`
**Method**: GET
**Headers**: `Content-Type: text/event-stream`

**Response Format**:
```javascript
data: {"type":"NodeChunk","content":{"nodeName":"STREAM","content":"Partial text here..."}}
```

### Tag Names Configured
```typescript
const TAG_NAMES = ['guideline', 'drug', 'recommendation', 'warning', 'note'];
```

**Note**: May need adjustment based on actual API responses

### Zustand Store Structure
```typescript
{
  currentQuestion: string;           // User's question
  sections: Section[];                // Parsed collapsible sections
  streamingState: StreamingState;     // 'idle' | 'streaming' | 'complete' | 'error'
  error: string | null;               // Error message
  rawContent: string;                 // Full accumulated content
}
```

### Performance Targets
- **FPS**: 60fps (16ms per frame) during streaming
- **Markdown Throttle**: 100ms updates
- **Timeout**: 30 seconds
- **Retry**: 3 attempts max

---

## 🚧 Phase 3 Complexity Notes

**Most Complex Phase**: Incremental tag parsing from streaming data

**Challenges**:
1. Tags split across chunks
2. Incomplete tags at stream end
3. Multiple tags arriving rapidly
4. Potential nested tags (TBD - need clarification)

**Implementation Strategy**:
1. Maintain buffer of unparsed text
2. Use regex to detect complete tags: `/<(\w+)>([\s\S]*?)<\/\1>/g`
3. Extract complete tags → create sections
4. Remove parsed content from buffer
5. Keep incomplete tags in buffer until closing tag arrives

**Edge Cases to Handle**:
- Stream ends with incomplete tag
- Malformed XML
- Unknown tag names
- Very long content (>10,000 chars)
- Rapid successive chunks

---

## ❓ Questions Needing Clarification

### Q1: Do tags nest?
**Question**: Can we have `<guideline><drug>...</drug></guideline>`?
**Impact**: If yes, need to switch from regex to saxy parser (proper XML parser)
**Default Assumption**: No nesting (flatten if encountered)

### Q2: Text outside tags?
**Question**: Should content outside `<tag>` be displayed?
**Current Approach**: Yes, render as separate markdown section
**Needs Confirmation**: From API documentation or testing

### Q3: Tag attributes?
**Question**: Can tags have attributes? `<guideline type="primary">`?
**Current Approach**: No attributes expected
**Impact**: If yes, need more sophisticated parsing

### Q4: Case sensitivity?
**Question**: `<Guideline>` vs `<guideline>` - are both valid?
**Current Approach**: Case-insensitive matching
**Config**: TAG_NAMES are lowercase, will normalize incoming tags

---

## 🎨 UI/UX Notes

### Design Reference
- Screenshot provided on page 4 of assignment PDF
- Minimal, clean medical interface
- "Thinking..." indicator while waiting
- Question displayed at top in card
- Collapsible sections for answer
- Collapse/expand with arrow icon

### Core UI Improvements (Phase 4.6)
1. **Empty State (Required)**:
   - Display centered welcome text when app first loads
   - Invites user to ask their first question
   - Disappears after first question submitted
   - Component: `src/components/EmptyState.tsx`

2. **Input Always at Bottom (Required)**:
   - Text input remains at bottom even on initial load
   - Use KeyboardAvoidingView wrapper
   - Proper safe area handling for notch devices
   - Consistent interaction pattern

### Desirable Features (Phase 6 - Optional)
3. **Conversation History Menu**:
   - Slide-in drawer from left
   - List of previous conversations with timestamps
   - Load/delete conversations
   - Requires AsyncStorage for persistence

4. **New Conversation Option**:
   - Menu option with confirmation dialog
   - Saves current conversation before resetting
   - Clear starting point for new questions

5. **About Section**:
   - Author name and app version
   - "Made for Vera Health Technical Assignment"
   - Accessible from menu

### Color Scheme (Current)
- Primary: #007AFF (iOS blue)
- Background: #fff
- Cards: #f5f5f5
- Text: #333
- Error: #f44336 red
- Border: #e0e0e0

### Animations
- Loading indicator: Pulsing opacity (800ms cycle)
- Collapsible sections: 300ms duration
- Menu drawer: Smooth slide-in (Phase 6)
- Smooth, no jank during streaming

---

## 🧪 Testing Strategy

### Phase 2 Tests
- [ ] Successful streaming connection
- [ ] Timeout after 30 seconds
- [ ] Retry on connection failure
- [ ] Error display to user
- [ ] Graceful connection cleanup

### Phase 3 Tests (Tag Parsing)
- [ ] Single tag: `<guideline>Content</guideline>`
- [ ] Multiple sequential tags
- [ ] Tag split across chunks
- [ ] Incomplete tag at stream end
- [ ] Unknown tag name (ignore or display?)
- [ ] Very long content
- [ ] Special characters in content

### Phase 5 Tests (Final)
- [ ] iOS simulator
- [ ] Android emulator
- [ ] Physical iOS device (if available)
- [ ] Physical Android device (if available)
- [ ] Network interruption mid-stream
- [ ] Rapid consecutive requests
- [ ] Memory leak check
- [ ] Performance profiling (React DevTools)

---

## 💡 Optimization Notes

### Performance Wins
1. **Zustand selectors**: Subscribe only to needed state slices
2. **React.memo**: All components memoized
3. **Throttled markdown**: 100ms updates during streaming
4. **useMemo/useCallback**: Expensive computations cached

### Potential Bottlenecks
1. Markdown parsing during active streaming
2. Frequent DOM updates (30-60 per second)
3. Large content buffers (memory)

### Profiling Tools
- React DevTools Profiler
- React Native Performance Monitor (Cmd+D → Performance Monitor)
- `console.time()` / `console.timeEnd()` for critical paths

---

## 📚 Documentation Files

### Available Documentation
- **README.md**: Project setup, features, architecture
- **IMPLEMENTATION_PLAN.md**: Detailed phase-by-phase roadmap with checkboxes
- **REACT_NATIVE_BEST_PRACTICES.md**: React Native + TypeScript best practices
- **Mobile Technical assignment.pdf**: Original assignment specification
- **CLAUDE.md**: This file - project context and memory

### Key Commands
```bash
npm start              # Start dev server
npx tsc --noEmit      # Type check
npx expo lint         # Lint code
npm run ios           # Run iOS
npm run android       # Run Android
```

---

## 🤖 AI Context Notes

When returning to this project:

1. **Current State**: Phase 1 complete, ready for Phase 2
2. **Next Action**: Create src/services/apiService.ts
3. **Key Files**:
   - Store: src/store/chatStore.ts
   - Main Screen: src/screens/ChatScreen.tsx
   - Types: src/types/*.ts
4. **Path Aliases**: Using relative imports (not @aliases due to @types conflict)
5. **Testing**: TypeScript compiles cleanly
6. **Blocked On**: Nothing - ready to proceed with Phase 2

### User Preferences (from global CLAUDE.md)
- Be 100% honest, no sugarcoating
- Never commit unless explicitly asked
- No "🤖 Generated with Claude Code" in commits
- Update CLAUDE.md when user says "update your memory"

---

---

## 📝 Recent Updates

### 2025-11-12: UI Improvements & Optional Features Added
**Changes**:
- **Phase 4.6 Enhanced**: Added empty state component and input-at-bottom requirements
- **Phase 6 Created**: New optional phase for conversation history, menu, and about section
- **Progress Updated**: Now tracking 46 total tasks (39 core + 7 optional)

**New Components Planned**:
- `src/components/EmptyState.tsx` (Phase 4.6)
- `src/components/MenuDrawer.tsx` (Phase 6.2)
- `src/components/MenuButton.tsx` (Phase 6.2)
- `src/components/ConversationHistoryItem.tsx` (Phase 6.2)
- `src/screens/AboutScreen.tsx` (Phase 6.4)
- `src/services/storageService.ts` (Phase 6.1)

**New Dependencies** (Phase 6 only):
- `@react-native-async-storage/async-storage` - Local conversation storage
- `@react-navigation/native` + `@react-navigation/drawer` (optional) - Navigation

**Priority**: Focus on Phases 1-5 first (core assignment requirements). Phase 6 only if time permits.

---

**Last Updated**: 2025-11-12
**Next Session**: Start Phase 2 - SSE Integration

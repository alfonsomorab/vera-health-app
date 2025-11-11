# Vera Health - AI Streaming Chat Mobile App

A React Native mobile application that provides real-time AI-powered medical guidance through a streaming chat interface. Built for the Vera Health technical assignment.

## 📱 Overview

This mobile app allows healthcare professionals to ask clinical questions and receive AI-generated responses in real-time via Server-Sent Events (SSE). The responses include structured content with collapsible sections for guidelines, drug information, and recommendations, all rendered in markdown format.

## ✨ Features

- **Real-time Streaming**: Server-Sent Events (SSE) for live AI response streaming
- **Markdown Rendering**: Rich text formatting for medical content
- **Structured Sections**: Collapsible sections for different content types (guidelines, drugs, etc.)
- **Cross-Platform**: Runs seamlessly on both iOS and Android
- **Performance Optimized**: Smooth 60fps rendering during streaming with React.memo and Zustand

## 🛠️ Tech Stack

### Core
- **React Native**: 0.81.5
- **Expo**: ~54.0.23
- **TypeScript**: ~5.9.2
- **React**: 19.1.0

### State Management & Data
- **Zustand**: 5.0.8 - Lightweight, performant state management
- **react-native-sse**: 1.2.1 - Server-Sent Events for streaming

### UI Components
- **react-native-markdown-display**: 7.0.2 - Markdown rendering
- **react-native-collapsible**: 1.6.2 - Animated collapsible sections

### Utilities
- **txml**: 5.2.1 - XML/tag parsing for structured content
- **babel-plugin-module-resolver**: 5.0.2 - Clean import paths

## 📁 Project Structure

```
vera-health-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ChatInput.tsx
│   │   ├── CollapsibleSection.tsx
│   │   ├── LoadingIndicator.tsx
│   │   ├── MarkdownRenderer.tsx
│   │   └── StreamingResponse.tsx
│   ├── screens/             # Screen components
│   │   └── ChatScreen.tsx
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API services
│   ├── store/               # Zustand state management
│   │   └── chatStore.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── api.types.ts
│   │   ├── chat.types.ts
│   │   └── parser.types.ts
│   ├── utils/               # Utility functions
│   └── constants/           # App constants
│       └── config.ts
├── docs/                    # Documentation
│   ├── IMPLEMENTATION_PLAN.md
│   ├── REACT_NATIVE_BEST_PRACTICES.md
│   └── Mobile Technical assignment.pdf
├── App.tsx                  # Root component
├── package.json
└── tsconfig.json

```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   cd vera-health-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on platform**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## 🔧 Development

### Available Scripts

```bash
npm start       # Start Expo development server
npm run android # Run on Android
npm run ios     # Run on iOS
npm run web     # Run on web browser
npx tsc         # Run TypeScript type checking
```

### TypeScript

Type checking is enabled in strict mode. Run type checks with:
```bash
npx tsc --noEmit
```

### Code Style

- Functional components with hooks (no class components)
- TypeScript strict mode enabled
- React.memo for performance-critical components
- Zustand for global state management

## 📊 Implementation Status

### ✅ Phase 1: Foundation (Complete)
- [x] Project setup with Expo + TypeScript
- [x] Dependencies installed
- [x] TypeScript types defined
- [x] Zustand store configured
- [x] All UI components built
- [x] Main ChatScreen implemented

### 🚧 Phase 2: SSE Integration (Not Started)
- [ ] API service implementation
- [ ] SSE streaming hook
- [ ] Real-time response display
- [ ] Error handling & timeouts

### 📋 Phase 3: Tag Parsing (Not Started)
- [ ] Incremental XML tag parser
- [ ] Stream buffering
- [ ] Section detection & creation

### 🎨 Phase 4: Markdown & Polish (Not Started)
- [ ] Markdown rendering optimization
- [ ] Performance tuning
- [ ] UI polish & animations

### ✅ Phase 5: Testing & Refinement (Not Started)
- [ ] Edge case testing
- [ ] iOS & Android testing
- [ ] Performance profiling

**Overall Progress**: 27% (10/37 tasks)

See [IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) for detailed roadmap.

## 🏗️ Architecture

### State Management (Zustand)

```typescript
// Global state structure
{
  currentQuestion: string;
  sections: Section[];
  streamingState: 'idle' | 'streaming' | 'complete' | 'error';
  error: string | null;
  rawContent: string;
}
```

### Component Hierarchy

```
ChatScreen
├── StreamingResponse
│   ├── LoadingIndicator
│   └── CollapsibleSection[]
│       └── MarkdownRenderer
└── ChatInput
```

### Data Flow

1. User enters question → ChatInput
2. Question stored in Zustand → triggers API call
3. SSE stream → chunks arrive → parser processes
4. Sections created → store updated → UI re-renders
5. Markdown rendered incrementally

## 🔌 API Integration

**Endpoint**: `https://vera-assignment-api.vercel.app/api/stream?prompt={question}`

**Method**: GET

**Response Format**: Server-Sent Events (SSE)
```json
data: {"type":"NodeChunk","content":{"nodeName":"STREAM","content":"Partial text..."}}
```

**Supported Tags**:
- `<guideline>` - Clinical guidelines
- `<drug>` - Drug information
- `<recommendation>` - Treatment recommendations
- `<warning>` - Warnings and precautions
- `<note>` - Additional notes

## 🎯 Key Features

### 1. Real-Time Streaming
- SSE connection with automatic reconnection
- 30-second timeout with retry logic
- Smooth incremental rendering

### 2. Structured Content
- Automatic tag detection (`<guideline>`, `<drug>`, etc.)
- Collapsible sections for each tag
- Content inside and outside tags rendered as markdown

### 3. Performance Optimization
- React.memo on all components
- Zustand selectors for minimal re-renders
- Throttled markdown updates during streaming (100ms)

### 4. Error Handling
- Connection timeouts
- Network errors
- Malformed responses
- Retry mechanism (3 attempts)

## 🐛 Known Issues

- Path aliases using `@types/*` conflicts with TypeScript - using relative imports instead
- 2 moderate npm vulnerabilities in dependencies (non-critical)

## 📝 Development Notes

### Performance Considerations
- Markdown rendering can be expensive during active streaming
- Consider throttling updates or showing plain text while streaming
- Use Zustand selectors to subscribe only to needed state slices

### Tag Parsing Strategy
- Tags can split across stream chunks
- Buffer incomplete tags until closing tag arrives
- Handle nested tags if API supports them

### Testing Strategy
1. Test on both iOS and Android early
2. Test with various markdown content
3. Test edge cases (incomplete tags, network errors)
4. Profile performance with React DevTools

## 🤝 Contributing

This is a technical assignment project. For questions or issues:
1. Check the [IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md)
2. Review [REACT_NATIVE_BEST_PRACTICES.md](./docs/REACT_NATIVE_BEST_PRACTICES.md)
3. See [CLAUDE.md](./CLAUDE.md) for project context

## 📄 License

Private - Vera Health Technical Assignment

## 🔗 Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Status**: 🟡 In Development - Phase 1 Complete
**Last Updated**: 2025-11-10

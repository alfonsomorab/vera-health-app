# React Native + TypeScript + Expo - Best Practices Guide

## Table of Contents
1. [Project Setup](#project-setup)
2. [TypeScript Configuration](#typescript-configuration)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Code Quality](#code-quality)
6. [Performance Optimization](#performance-optimization)
7. [Module Resolution & Path Aliases](#module-resolution--path-aliases)
8. [Testing](#testing)
9. [Build & Deployment](#build--deployment)

---

## Project Setup

### Create New Project

**Recommended: Start with Expo + TypeScript template**

```bash
npx create-expo-app --template
```

This command creates a new Expo project with TypeScript pre-configured, including:
- TypeScript compiler configuration
- Type definitions for React and React Native
- ESLint setup with TypeScript support
- Jest configuration for testing

### Install TypeScript Dependencies

If adding TypeScript to an existing project:

```bash
# Using npm
npm install -D typescript @react-native/typescript-config @types/jest @types/react @types/react-test-renderer

# Using Expo's install command
npx expo install typescript @types/react --dev
```

---

## TypeScript Configuration

### Basic tsconfig.json

Create a `tsconfig.json` in your project root:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Recommended Compiler Options

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "target": "esnext",
    "module": "esnext",
    "jsx": "react-native",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

### Key Configuration Points

- **strict: true** - Enable all strict type checking options for maximum type safety
- **jsx: "react-native"** - Proper JSX handling for React Native
- **skipLibCheck: true** - Skip type checking of declaration files for faster compilation
- **forceConsistentCasingInFileNames: true** - Prevent case-sensitivity issues across platforms

---

## Project Structure

### Recommended Directory Structure

```
project-root/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Generic components (Button, Input, etc.)
│   │   └── features/        # Feature-specific components
│   ├── screens/             # Screen components
│   ├── navigation/          # Navigation configuration
│   ├── services/            # API calls, external services
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── constants/           # App constants
│   ├── context/             # React Context providers
│   └── assets/              # Images, fonts, etc.
├── __tests__/               # Test files
├── app.config.ts            # Expo configuration (TypeScript)
├── tsconfig.json            # TypeScript configuration
├── package.json
└── README.md
```

### Component Structure Best Practice

**Functional Components with TypeScript:**

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Define prop types
export type GreetingProps = {
  name: string;
  age?: number;
};

// Functional component with typed props
export function Greeting({ name, age }: GreetingProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Hello {name}
        {age && ` (${age} years old)`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
  },
});
```

---

## Development Workflow

### Start Development Server

```bash
# Start Expo dev server
npx expo start

# Start with specific connection type
npx expo start --tunnel    # For testing on remote devices
npx expo start --web       # Web platform
```

### Type Checking

**Run type checks regularly during development:**

```bash
# Using npm
npx tsc

# Using yarn
yarn tsc
```

**Add to package.json scripts:**

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "typecheck": "tsc --noEmit",
    "lint": "npx expo lint",
    "test": "jest"
  }
}
```

### Hot Reload Best Practices

- Avoid module side effects that execute on import
- Keep component state in proper lifecycle methods
- Use React hooks for state management

**❌ Bad Practice - Module Side Effect:**

```typescript
import Logger from './utils/Logger';

// Side effect! Executes before React renders
global.logger = new Logger();

export function SplashScreen() {
  // ...
}
```

**✅ Good Practice - No Side Effects:**

```typescript
import Logger from './utils/Logger';

export function SplashScreen() {
  const logger = React.useMemo(() => new Logger(), []);

  return (
    // ...
  );
}
```

---

## Code Quality

### ESLint Configuration

React Native and Expo projects come with ESLint pre-configured. Run linting:

```bash
npx expo lint
```

**ESLint with TypeScript (.eslintrc.js):**

```javascript
module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
};
```

### Type Safety Best Practices

1. **Avoid `any` type** - Use `unknown` when type is truly unknown
2. **Use strict mode** - Enable `"strict": true` in tsconfig.json
3. **Define interfaces for props** - Always type your component props
4. **Use type inference** - Let TypeScript infer types when obvious
5. **Create reusable types** - Define types in `src/types/` directory

**Example Type Definitions:**

```typescript
// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface UserProfile extends User {
  bio: string;
  followers: number;
  following: number;
}

// src/types/api.ts
export type ApiResponse<T> = {
  data: T;
  status: number;
  message?: string;
};

export type ApiError = {
  error: string;
  status: number;
};
```

---

## Performance Optimization

### Component Optimization

**Use React.memo for expensive components:**

```typescript
import React from 'react';
import { View, Text } from 'react-native';

type ExpensiveComponentProps = {
  data: string[];
};

export const ExpensiveComponent = React.memo(({ data }: ExpensiveComponentProps) => {
  return (
    <View>
      {data.map(item => <Text key={item}>{item}</Text>)}
    </View>
  );
});
```

**Implement shouldComponentUpdate for class components:**

```typescript
class MyComponent extends React.Component {
  shouldComponentUpdate(nextProps: Props, nextState: State) {
    // Only re-render if props/state actually changed
    return (
      this.props.data !== nextProps.data ||
      this.state.loading !== nextState.loading
    );
  }

  render() {
    // ...
  }
}
```

### Best Practices for Performance

1. **Avoid inline function definitions** in render methods
2. **Use `useMemo` and `useCallback`** for expensive computations
3. **Implement virtualized lists** for long lists (FlatList, SectionList)
4. **Optimize images** - Use appropriate sizes and formats
5. **Lazy load components** when appropriate

---

## Module Resolution & Path Aliases

### Configure Path Aliases

Path aliases make imports cleaner and more maintainable.

**1. Update tsconfig.json:**

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
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

**2. Configure Babel (babel.config.js):**

```bash
# Install module resolver
npm install --save-dev babel-plugin-module-resolver
```

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@types': './src/types',
          }
        }
      ]
    ]
  };
};
```

**3. Usage Example:**

```typescript
// Before (relative imports)
import Button from '../../../components/common/Button';
import { formatDate } from '../../../utils/dateUtils';

// After (path aliases)
import Button from '@components/common/Button';
import { formatDate } from '@utils/dateUtils';
```

### Enable/Disable Path Aliases

In `app.json`, control path alias behavior:

```json
{
  "expo": {
    "experiments": {
      "tsconfigPaths": true
    }
  }
}
```

---

## Testing

### Jest Setup

**Install dependencies:**

```bash
npx expo install jest-expo jest @types/jest --dev
```

**Configure Jest (jest.config.js):**

```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.setup.js'
  ]
};
```

### Example Test

```typescript
// src/components/__tests__/Greeting.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { Greeting } from '../Greeting';

describe('Greeting Component', () => {
  it('renders correctly with name', () => {
    const { getByText } = render(<Greeting name="John" />);
    expect(getByText(/Hello John/)).toBeTruthy();
  });

  it('displays age when provided', () => {
    const { getByText } = render(<Greeting name="Jane" age={30} />);
    expect(getByText(/30 years old/)).toBeTruthy();
  });
});
```

---

## Build & Deployment

### Using TypeScript for Configuration

**app.config.ts (instead of app.json):**

```typescript
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'My App',
  slug: 'my-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.mycompany.myapp'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF'
    },
    package: 'com.mycompany.myapp'
  },
  web: {
    favicon: './assets/favicon.png'
  }
});
```

### Pre-build Checklist

1. **Run type checking:** `npm run typecheck`
2. **Run linting:** `npx expo lint`
3. **Run tests:** `npm test`
4. **Test on both platforms:** iOS and Android
5. **Check bundle size:** Monitor and optimize if needed

### Build Commands

```bash
# Development build
npx expo run:android
npx expo run:ios

# Production build with EAS
eas build --platform android
eas build --platform ios
eas build --platform all
```

---

## Key Takeaways

### ✅ DO:
- Use TypeScript's strict mode
- Define clear interfaces for props and data structures
- Use path aliases for cleaner imports
- Run type checking and linting regularly
- Write tests for critical components
- Use ESLint and TypeScript together
- Follow Expo's recommended project structure
- Optimize performance with React.memo and useMemo
- Use functional components with hooks

### ❌ DON'T:
- Use `any` type unless absolutely necessary
- Create module side effects
- Ignore TypeScript errors
- Skip type checking in CI/CD
- Use relative imports for distant files
- Inline complex logic in render methods
- Forget to test on both platforms
- Ignore performance warnings

---

## Additional Resources

- [React Native Documentation](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app)
- [Expo TypeScript Guide](https://docs.expo.dev/guides/typescript)

---

**Last Updated:** 2025-11-10

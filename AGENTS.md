# SimRun Agent Guide

## Overview

SimRun is a React Native running tracking app built with Expo Router. This guide provides coding standards and commands for agents working on this codebase.

## Commands

### Development

- `npm start` or `npx expo start` - Start development server
- `npx expo run:ios` - Run on iOS simulator
- `npx expo run:android` - Run on Android emulator

### Testing

- `npm test` - Run all tests in watch mode
- `npx jest __tests__/filename-test.ts` - Run single test file (use `--no-watchman` for CI)
- Tests located in `__tests__/` directory

### Linting & Formatting

- `npm run lint` - Run ESLint with expo config
- Prettier configured (v3.6.2) - format on save recommended

### Building

- `npm run build:ios` - EAS build for iOS production
- `npm run build:android` - EAS build for Android production
- `npm run build:ios-local` - Local iOS build

## Code Style Guidelines

### Imports

```typescript
// React imports first
import { useEffect, useState, useRef } from "react";

// Third-party libraries next (group related)
import { View, Pressable, Animated } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Absolute project imports using @/* alias
import { useRun } from "@/hooks/useRun";
import { ThemedText } from "@/components/ThemedText";
import { useRunStore } from "@/store/runStore";

// Relative imports only when necessary
import { LiveActivity } from "../utils/LiveActivityController";
```

### Naming Conventions

- **Hooks**: `use*` prefix, camelCase (e.g., `useRun`, `useTick`)
- **Components**: PascalCase, descriptive nouns (e.g., `LongPressFinishButton`)
- **Functions**: camelCase, verbs (e.g., `startTracking`, `calculateCalories`)
- **Constants**: UPPER_SNAKE_CASE for module-level constants
- **Types/Interfaces**: PascalCase with descriptive names
- **Files**: camelCase for hooks/utils, PascalCase for components

### TypeScript

- Strict mode enabled - always add proper types
- Avoid `any` - use `unknown` with type guards when necessary
- Return types on exported functions
- Interface over type for object definitions
- Use path aliases `@/*` for all imports

### React Patterns

- Use functional components with hooks
- Custom hooks for reusable logic
- Zustand for state management (see store/ directory)
- `useRef` for mutable values that don't trigger re-renders
- Memoize expensive calculations with `useMemo`

### Error Handling

- Always handle promise rejections with try/catch
- Console errors should include context: `console.error("Action failed:", error)`
- User-facing errors use toast/alert, not console

### i18n

- All UI text must use `t("key")` from react-i18next
- Keys follow pattern: `section.subsection.field` (e.g., `run.finish`, `common.cancel`)
- Add both `en` and `cn` translations in `utils/i18n/index.ts`

### Native Modules (iOS)

- Swift files in `modules/activity-controller/ios/`
- Use `@available(iOS 16.1, *)` guards for ActivityKit features
- Print statements for debugging with emoji prefixes (e.g., `print("✅ Success")`)

## Project Structure

```
app/              - Expo Router routes and screens
components/       - Reusable React components
hooks/            - Custom React hooks
modules/          - Native Expo modules (Swift)
store/            - Zustand state stores
utils/            - Utility functions and i18n
__tests__/        - Jest test files
```

## Git Workflow

- Commit messages in Chinese following Conventional Commits
- Format: `<type>(<scope>): <中文描述>`
- Types: feat, fix, ui, refactor, chore
- Example: `feat(run): 实现长按结束跑步功能`

## Key Dependencies

- Expo SDK ~54.0.12
- React Native 0.81.4
- Expo Router ~6.0.10
- React 19.1.0
- Zustand ^5.0.9
- NativeWind 4.2 (Tailwind for RN)
- i18next + react-i18next for localization

## Data Format

### Pace (配速)

**SQLite Storage Format:**

- Type: `REAL`
- Unit: seconds per kilometer (跑1公里所需的秒数)
- Example: `360` = 6 minutes/km (6'00")

**Usage:**

```typescript
// 直接使用，不要除以 60
const pace = getPaceLabel(record.pace); // ✓ 正确

// 错误用法
const pace = getPaveLabel(record.pace / 60); // ✗ 错误
```

**Calculation:**

```typescript
// 计算配速：总时间(秒) / 距离(公里)
pace = timeSeconds / distanceKm;
```

**Note:** `getPaceLabel()` expects seconds per kilometer as input. Do NOT divide by 60.

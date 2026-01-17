## React Native TypeScript Setup - Complete

This document outlines the dark-themed React Native app setup using TypeScript and Expo.

### ✅ Completed Components

#### 1. **Theme Constants** (`/constants/theme.ts`)
- Global design tokens for entire app
- Color palette with primary (#143109), secondary (#B5BFA1), backgrounds, and semantic colors
- Spacing system (xs through xxl tokens)
- Typography scales with 8 sizes and 7 weights
- Border radius tokens
- Shadow system with iOS/Android support

**Usage:**
```typescript
import { colors, spacing, typography, borderRadius, shadows } from './constants/theme';

// Direct imports for constants
const bg = colors.background; // #000000
const padding = spacing.md; // 12
```

#### 2. **ThemeContext Provider** (`/context/ThemeContext.tsx`)
- Global theme context for component access without prop drilling
- `ThemeProvider` component wraps the entire app
- `useTheme()` hook allows any component to access theme values

**Features:**
- Type-safe theme access with TypeScript
- Optional theme override capability
- Dark mode only (single theme configuration)

**Usage:**
```typescript
import { useTheme } from './context/ThemeContext';

function MyComponent() {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
  });
  
  return <View style={styles.container} />;
}
```

#### 3. **Main App Layout** (`/App.tsx`)
- TypeScript entry point replacing App.js
- **Dark mode StatusBar** configured with light content
- **SafeAreaView** wrapper for device safety (notches, bezels)
- Global background color (#000000)
- Centered app title placeholder with semantic styling
- ThemeProvider wraps entire app for context access

**Features:**
- Minimalist design with centered title and subtitle
- All styling uses theme constants for consistency
- No navigation (clean foundation structure)
- Proper TypeScript setup with proper imports

### 📋 Architecture

```
App.tsx (ThemeProvider + AppContent)
├── ThemeProvider (context wrapper)
└── AppContent (UI content)
    ├── SafeAreaView (device safety)
    ├── StatusBar (dark mode)
    └── View (centered title placeholder)
        ├── Text (LOAF title)
        └── Text (subtitle)
```

### 🎨 Design System

**Colors Used:**
- Background: #000000 (pure black for OLED)
- Surface: #0E0E0E (subtle card background)
- Primary Text: #FFFFFF (full contrast)
- Secondary Text: #B5BFA1 (sage green, reduced contrast)
- Primary Brand: #143109 (deep forest green)

**Spacing System:**
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- xxl: 32px

**Typography:**
- H1: 32px (bold) - Main titles
- H2: 24px (bold) - Section headers
- H3: 20px (semibold) - Subsection headers
- H4: 18px (semibold) - Card titles
- Body: 16px (regular) - Main content
- Body Small: 14px (regular) - Secondary content
- Caption: 12px (regular) - Helper text
- Caption Small: 11px (regular) - Minimal text

### 🔧 How to Use

1. **Import theme directly** for static values:
   ```typescript
   import { colors, spacing } from './constants/theme';
   ```

2. **Use useTheme hook** for component styling:
   ```typescript
   import { useTheme } from './context/ThemeContext';
   
   const theme = useTheme();
   const styles = StyleSheet.create({
     container: { backgroundColor: theme.colors.background }
   });
   ```

3. **Access semantic colors** for consistent UI:
   ```typescript
   theme.colors.text.primary      // #FFFFFF
   theme.colors.text.secondary    // #B5BFA1
   theme.colors.semantic.success  // #10B981
   ```

### 📱 Running the App

```bash
# From /home/franz/Documents/LOAF/LOAF/

# Start the Expo server
npx expo start

# Open on iOS/Android/Web using the QR code
```

### 🚫 What's NOT Included (As Requested)

- ❌ Navigation (explicitly excluded - clean foundation only)
- ❌ Screen components (will be added after foundation)
- ❌ State management (Redux/MobX/Zustand)
- ❌ Additional dependencies (minimalist approach)
- ❌ Light theme option (dark-only as required)

### ✨ Next Steps

When ready to expand:

1. **Create screens** - Use `useTheme()` hook for styling
2. **Add navigation** - React Navigation (optional)
3. **Build components** - Card, Button, Input, etc.
4. **Integrate meal logging** - Connect to existing `mealLoggingService.js`
5. **Add data persistence** - AsyncStorage or similar

All screens and components should:
- Import and use `useTheme()` for styling
- Follow the spacing and typography system
- Use semantic colors for consistent theming
- Support dark mode only (no light theme variants)

### 📝 File Structure

```
LOAF/
├── App.tsx                          (✅ Main app entry point)
├── constants/
│   └── theme.ts                     (✅ Theme constants)
├── context/
│   └── ThemeContext.tsx             (✅ Theme provider & hook)
├── services/
│   └── mealLoggingService.js        (existing)
├── screens/
│   └── MealLoggingScreen.js         (existing)
├── data/
│   └── foodDatabase.json            (existing)
└── package.json
```

All files are TypeScript-ready and follow minimalist design principles.

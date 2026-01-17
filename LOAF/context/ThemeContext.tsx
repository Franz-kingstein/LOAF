/**
 * Theme Context
 * Provides global theme access throughout the app without prop drilling
 * Implements the Theme and allows for future theme switching
 */

import { createContext, useContext } from 'react';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

export type Theme = {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
};

const defaultTheme: Theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
};

const ThemeContext = createContext(defaultTheme);

export interface ThemeProviderProps {
  children: any;
  theme?: Theme;
}

/**
 * ThemeProvider Component
 * Wraps the app to provide theme context to all children
 */
export const ThemeProvider = ({
  children,
  theme = defaultTheme,
}: ThemeProviderProps) => {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme Hook
 * Access theme values anywhere in the app
 *
 * @example
 * const theme = useTheme();
 * const styles = StyleSheet.create({
 *   container: {
 *     backgroundColor: theme.colors.background,
 *     padding: theme.spacing.md,
 *   },
 * });
 */
export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;

/**
 * Theme Context
 * Provides global theme access throughout the app
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from '../constants/theme';

export type Theme = {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
};

// Re-export colors for backward compatibility
export const COLORS = colors;

const defaultTheme: Theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
};

const ThemeContext = createContext<Theme>(defaultTheme);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const value = useMemo(() => defaultTheme, []);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme Hook
 */
export const useTheme = (): Theme => {
  return useContext(ThemeContext);
};

export default ThemeContext;

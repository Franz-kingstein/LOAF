/**
 * Theme Constants
 * Centralized color and styling definitions for the LOAF app
 * Dark theme optimized with minimalist design
 */

export const colors = {
  // Primary brand color - deep forest green
  primary: '#143109',

  // Secondary accent - soft sage green
  secondary: '#B5BFA1',

  // Backgrounds
  background: '#000000',
  surface: '#0E0E0E',

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#B5BFA1',
    tertiary: '#666666',
    muted: '#444444',
  },

  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Borders & dividers
  border: '#1A1A1A',
  divider: '#242424',

  // Opacity variants
  transparent: 'transparent',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const typography = {
  sizes: {
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    bodySmall: 14,
    caption: 12,
    captionSmall: 11,
  },
  weights: {
    thin: '100' as const,
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};

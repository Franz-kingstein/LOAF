/**
 * Navigation Configuration
 * This file is deprecated - use src/navigation/NavigationConfig.ts instead
 * Kept for backward compatibility
 */

import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { colors, spacing, typography } from '../src/constants/theme';

/**
 * Tab navigation configuration
 * Defines all tab screens and their properties
 */
export const TAB_SCREENS = {
  Home: {
    name: 'Home',
    label: 'Home',
    icon: 'home',
  },
  LogFood: {
    name: 'LogFood',
    label: 'Log Food',
    icon: 'utensils',
  },
  Water: {
    name: 'Water',
    label: 'Water',
    icon: 'tint',
  },
  Insights: {
    name: 'Insights',
    label: 'Insights',
    icon: 'chart-line',
  },
  Settings: {
    name: 'Settings',
    label: 'Settings',
    icon: 'cog',
  },
} as const;

/**
 * Dark theme options for bottom tab navigator
 * Ensures consistent dark mode styling across all tabs
 */
export const darkTabNavigatorTheme = {
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.cardBackground,
    text: colors.textPrimary,
    border: colors.divider,
    notification: colors.primary,
  },
};

/**
 * Default tab screen options
 * Applied to all tab screens for consistency
 */
export const getTabScreenOptions = (): BottomTabNavigationOptions => ({
  headerShown: false,
  tabBarShowLabel: true,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textSecondary,
  tabBarStyle: {
    backgroundColor: colors.cardBackground,
    borderTopColor: colors.divider,
    borderTopWidth: 0.5,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
    height: 75,
    paddingHorizontal: spacing.sm,
  },
  tabBarItemStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: spacing.sm,
    paddingTop: spacing.sm,
  },
  tabBarLabelStyle: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    marginTop: 0,
    marginBottom: spacing.sm,
  },
  tabBarIconStyle: {
    width: 28,
    height: 28,
    marginBottom: 0,
  },
});

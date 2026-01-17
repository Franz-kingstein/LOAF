/**
 * Navigation Stack
 * Main navigation structure using bottom tab navigation
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { colors, spacing } from '../constants/theme';

// Import screens
import { HomeScreen } from '../screens/HomeScreen';
import { LogFoodScreen } from '../screens/LogFoodScreen';
import { WaterScreen } from '../screens/WaterScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

// Import navigation config
import { TAB_SCREENS, getTabScreenOptions } from './NavigationConfig';

const Tab = createBottomTabNavigator();

/**
 * Emoji Icon Map for Tab Navigation
 * Simple emoji icons - no library dependencies
 */
const EMOJI_MAP: Record<string, string> = {
  'home': '🏠',
  'utensils': '🍽️',
  'tint': '💧',
  'chart-line': '📊',
  'cog': '⚙️',
};

/**
 * Get Emoji Icon for Tab
 * Returns the appropriate emoji based on tab name
 */
const getTabIcon = (name: string, color: string, size: number) => {
  const iconName = TAB_SCREENS[name as keyof typeof TAB_SCREENS]?.icon || 'help';
  const emoji = EMOJI_MAP[iconName] || '•';
  return (
    <Text 
      style={{ 
        fontSize: 28,
        color: color,
        marginBottom: spacing.sm,
        lineHeight: 28,
      }}
    >
      {emoji}
    </Text>
  );
};

/**
 * BottomTabNavigator Component
 * Main navigation with bottom tab bar and icons
 * Screens: Home, Log Food, Water, Insights, Settings
 */
function BottomTabNavigator() {
  return (
    <Tab.Navigator 
      id="BottomTabNavigator"
      screenOptions={({ route }) => ({
        ...getTabScreenOptions(),
        tabBarIcon: ({ color, size }) => getTabIcon(route.name, color, size),
      })}
    >
      <Tab.Screen
        name={TAB_SCREENS.Home.name}
        component={HomeScreen}
        options={{ title: TAB_SCREENS.Home.label }}
      />
      <Tab.Screen
        name={TAB_SCREENS.LogFood.name}
        component={LogFoodScreen}
        options={{ title: TAB_SCREENS.LogFood.label }}
      />
      <Tab.Screen
        name={TAB_SCREENS.Water.name}
        component={WaterScreen}
        options={{ title: TAB_SCREENS.Water.label }}
      />
      <Tab.Screen
        name={TAB_SCREENS.Insights.name}
        component={InsightsScreen}
        options={{ title: TAB_SCREENS.Insights.label }}
      />
      <Tab.Screen
        name={TAB_SCREENS.Settings.name}
        component={SettingsScreen}
        options={{ title: TAB_SCREENS.Settings.label }}
      />
    </Tab.Navigator>
  );
}

/**
 * RootNavigator Component
 * Wraps navigation stack with NavigationContainer
 * Adds bottom padding for Android home button clearance
 */
export function RootNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
      <View style={{ height: spacing.lg, backgroundColor: colors.background }} />
    </View>
  );
}

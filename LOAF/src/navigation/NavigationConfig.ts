import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { COLORS } from '../context/ThemeContext';

export type RootTabParamList = {
  Home: undefined;
  LogFood: undefined;
  Water: undefined;
  Insights: undefined;
  Settings: undefined;
};

export const navigationOptions: Record<
  keyof RootTabParamList,
  BottomTabNavigationOptions
> = {
  Home: {
    title: 'Home',
    headerShown: false,
    tabBarLabel: 'Home',
    tabBarActiveTintColor: COLORS.accent,
  },
  LogFood: {
    title: 'Log Food',
    headerShown: false,
    tabBarLabel: 'Log Food',
    tabBarActiveTintColor: COLORS.accent,
  },
  Water: {
    title: 'Water',
    headerShown: false,
    tabBarLabel: 'Water',
    tabBarActiveTintColor: COLORS.accent,
  },
  Insights: {
    title: 'Insights',
    headerShown: false,
    tabBarLabel: 'Insights',
    tabBarActiveTintColor: COLORS.accent,
  },
  Settings: {
    title: 'Settings',
    headerShown: false,
    tabBarLabel: 'Settings',
    tabBarActiveTintColor: COLORS.accent,
  },
};

export const tabBarOptions = {
  activeTintColor: COLORS.accent,
  inactiveTintColor: COLORS.inactiveIcon,
  style: {
    backgroundColor: COLORS.primary,
    borderTopColor: '#222222',
    borderTopWidth: 1,
    paddingBottom: 4,
    paddingTop: 4,
    height: 60,
  },
  labelStyle: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
};

import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

const COLORS = {
  background: '#000000',
  primary: '#143109',
  secondary: '#B5BFA1',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  inactiveIcon: 'rgba(255,255,255,0.4)',
};

const TABS = [
  { name: 'index', label: 'Home', icon: '🏠' },
  { name: 'log-food', label: 'Log Food', icon: '🍽️' },
  { name: 'water', label: 'Water', icon: '💧' },
  { name: 'insights', label: 'Insights', icon: '📊' },
  { name: 'settings', label: 'Settings', icon: '⚙️' },
];

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 22,
        color: focused ? COLORS.secondary : COLORS.inactiveIcon,
      }}
    >
      {icon}
    </Text>
  );
}

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name);

        return {
          headerShown: false,
          tabBarStyle: {
            height: 64,
            backgroundColor: COLORS.background,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            paddingBottom: 8,
            paddingTop: 8,
            paddingHorizontal: 0,
          },
          tabBarItemStyle: {
            flex: 1,
            paddingVertical: 0,
            marginHorizontal: 0,
            paddingHorizontal: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500' as const,
            marginTop: 4,
            color: COLORS.textSecondary,
          },
          tabBarIconStyle: {
            width: 28,
            height: 28,
            marginBottom: 0,
            marginTop: 0,
          },
          tabBarActiveTintColor: COLORS.secondary,
          tabBarInactiveTintColor: COLORS.inactiveIcon,
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={tab?.icon || '•'} focused={focused} />
          ),
        };
      }}
    >
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarLabel: tab.label,
          }}
        />
      ))}
    </Tabs>
  );
}

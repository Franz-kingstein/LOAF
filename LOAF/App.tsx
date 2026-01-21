import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { OnboardingGate } from './src/components/OnboardingGate';
import { initializeDatabase } from './src/index';
import { configureNotificationHandler, scheduleWaterReminders } from './src/utils/notificationService';
import { ThemeProvider, COLORS } from './src/context/ThemeContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { LogFoodScreen } from './src/screens/LogFoodScreen';
import { WaterTrackingScreen } from './src/screens/WaterTrackingScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import type { RootTabParamList } from './src/navigation/NavigationConfig';

const Tab = createBottomTabNavigator<RootTabParamList>();

const EMOJI_ICONS: Record<keyof RootTabParamList, string> = {
  Home: '🏠',
  LogFood: '🍽️',
  Water: '💧',
  Insights: '📊',
  Settings: '⚙️',
};

function TabIcon({ name, focused }: { name: keyof RootTabParamList; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, color: focused ? COLORS.accent : COLORS.inactiveIcon }}>
      {EMOJI_ICONS[name]}
    </Text>
  );
}

function MainNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      id="BottomTabNavigator"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 60 + insets.bottom,
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: '#222222',
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
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
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.inactiveIcon,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name as keyof RootTabParamList} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="LogFood" component={LogFoodScreen} options={{ title: 'Log Food' }} />
      <Tab.Screen name="Water" component={WaterTrackingScreen} options={{ title: 'Water' }} />
      <Tab.Screen name="Insights" component={InsightsScreen} options={{ title: 'Insights' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database first so downstream hooks can query safely
        await initializeDatabase();

        // Configure notifications and schedule reminders
        await configureNotificationHandler();
        await scheduleWaterReminders();

        console.log('✅ App initialized successfully');
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setBooting(false);
      }
    };

    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {booting ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={{ marginTop: 12, color: COLORS.textSecondary }}>Preparing LOAF…</Text>
          </View>
        ) : (
          <OnboardingGate>
            <AppNavigator />
          </OnboardingGate>
        )}
        <StatusBar />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

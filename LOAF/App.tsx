import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { OnboardingGate } from './src/components/OnboardingGate';
import { initializeDatabase } from './src/index';
import { useEffect } from 'react';

const Tab = createBottomTabNavigator();

const COLORS = {
  background: '#000000',
  primary: '#143109',
  secondary: '#B5BFA1',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  inactiveIcon: 'rgba(255,255,255,0.4)',
};

const EMOJI_ICONS: Record<string, string> = {
  Home: '🏠',
  LogFood: '🍽️',
  Water: '💧',
  Insights: '📊',
  Settings: '⚙️',
};

function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold' }}>Home</Text>
      <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>Welcome to LOAF</Text>
    </View>
  );
}

function LogFoodScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold' }}>Log Food</Text>
      <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>Add meals here</Text>
    </View>
  );
}

function WaterScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold' }}>Water</Text>
      <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>Track hydration</Text>
    </View>
  );
}

function InsightsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold' }}>Insights</Text>
      <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>Analytics & trends</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: COLORS.textPrimary, fontSize: 24, fontWeight: 'bold' }}>Settings</Text>
      <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>App preferences</Text>
    </View>
  );
}

function TabIcon({ name, focused }: { name: keyof typeof EMOJI_ICONS; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, color: focused ? COLORS.secondary : COLORS.inactiveIcon }}>
      {EMOJI_ICONS[name]}
    </Text>
  );
}

function MainNavigator() {
  return (
    <Tab.Navigator
      id="BottomTabNavigator"
      screenOptions={({ route }) => ({
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
          <TabIcon name={route.name as keyof typeof EMOJI_ICONS} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="LogFood" component={LogFoodScreen} options={{ title: 'Log Food' }} />
      <Tab.Screen name="Water" component={WaterScreen} options={{ title: 'Water' }} />
      <Tab.Screen name="Insights" component={InsightsScreen} options={{ title: 'Insights' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <SafeAreaProvider>
      <OnboardingGate>
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      </OnboardingGate>
      <StatusBar />
    </SafeAreaProvider>
  );
}

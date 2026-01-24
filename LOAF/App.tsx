import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingGate } from './src/components/OnboardingGate';
import { initializeDatabase } from './src/index';
import { configureNotificationHandler, scheduleWaterReminders } from './src/utils/notificationService';
import { ThemeProvider, COLORS } from './src/context/ThemeContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { LogFoodScreen } from './src/screens/LogFoodScreen';
import { WaterTrackingScreen } from './src/screens/WaterTrackingScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AIChatScreen } from './src/screens/AIChatScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import type { RootTabParamList } from './src/navigation/NavigationConfig';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator();

const ICONS: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  LogFood: 'add-circle',
  Water: 'water',
  Insights: 'bar-chart',
  Settings: 'person',
};

function TabIcon({ name, focused }: { name: keyof RootTabParamList; focused: boolean }) {
  return (
    <Ionicons
      name={ICONS[name]}
      size={24}
      color={focused ? COLORS.accent : COLORS.inactiveIcon}
    />
  );
}

function MainNavigator() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  
  return (
    <Stack.Navigator id="MainStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  
  return (
    <View style={{ flex: 1 }}>
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
      
      {/* Floating Action Button for AI Chat */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 80 + insets.bottom,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: 'grey',
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          opacity: 1,
        }}
        onPress={() => {
          navigation.navigate('AIChat');
        }}
      >
        <Ionicons name="chatbubble" size={24} color="#143109" />
      </TouchableOpacity>
    </View>
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
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: '#000000'
          }}>
            <Image
              source={require('./assets/Logo.png')}
              style={{ 
                width: 120, 
                height: 120, 
                marginBottom: 30,
                resizeMode: 'contain'
              }}
            />
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={{ 
              marginTop: 20, 
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '500'
            }}>
              Preparing LOAF…
            </Text>
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

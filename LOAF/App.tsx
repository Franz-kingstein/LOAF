/**
 * Main App Component
 * Entry point for LOAF (Lifestyle Optimization & Activity Fusion)
 *
 * Features:
 * - Dark theme only
 * - Global theme context provider
 * - Safe area handling for notches/bezels
 * - Minimalist UI with semantic spacing
 *
 * Structure:
 * 1. StatusBar configured for dark mode
 * 2. SafeAreaView for device safety
 * 3. Global background color from theme
 * 4. Centered app title placeholder
 */

import { SafeAreaView, View, Text, StyleSheet, StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { colors } from './constants/theme';

/**
 * AppContent Component
 * Contains the actual app UI, wrapped by ThemeProvider
 */
function AppContent() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    contentWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    titleText: {
      fontSize: theme.typography.sizes.h1,
      fontWeight: theme.typography.weights.bold as any,
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    subtitleText: {
      fontSize: theme.typography.sizes.bodySmall,
      fontWeight: theme.typography.weights.regular as any,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.contentWrapper}>
        <Text style={styles.titleText}>LOAF</Text>
        <Text style={styles.subtitleText}>
          Lifestyle Optimization & Activity Fusion
        </Text>
      </View>
    </SafeAreaView>
  );
}

/**
 * Root App Component
 * Wraps AppContent with ThemeProvider to enable global theme access
 */
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

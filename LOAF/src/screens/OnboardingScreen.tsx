import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../context/ThemeContext';

const DIET_TYPES = ['Vegetarian', 'Egg', 'Non-vegetarian'];

interface OnboardingData {
  age: string;
  height: string;
  weight: string;
  dietType: string;
}

interface OnboardingScreenProps {
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<OnboardingData>({
    age: '',
    height: '',
    weight: '',
    dietType: '',
  });

  const handleContinue = () => {
    onComplete(data);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    scrollContent: {
      padding: 24,
    },
    header: {
      marginBottom: 32,
      marginTop: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: COLORS.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: COLORS.textSecondary,
      lineHeight: 20,
    },
    section: {
      marginBottom: 28,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textPrimary,
      marginBottom: 10,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      backgroundColor: COLORS.inputBackground,
      borderWidth: 1,
      borderColor: COLORS.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: COLORS.textPrimary,
      fontWeight: '500',
    },
    unit: {
      marginLeft: 12,
      fontSize: 14,
      color: COLORS.textSecondary,
    },
    dietContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    dietButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: COLORS.inputBorder,
      borderRadius: 8,
      alignItems: 'center',
    },
    dietButtonActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    dietText: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.textSecondary,
    },
    dietTextActive: {
      color: COLORS.secondary,
    },
    footerContainer: {
      padding: 24,
      paddingTop: 0,
    },
    button: {
      backgroundColor: COLORS.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 12,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.secondary,
    },
    skipButton: {
      paddingVertical: 12,
      alignItems: 'center',
    },
    skipButtonText: {
      fontSize: 14,
      color: COLORS.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Let's Get Started</Text>
          <Text style={styles.subtitle}>
            Tell us a bit about yourself. You can update this anytime.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Age</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="18"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="number-pad"
              value={data.age}
              onChangeText={(age) => setData({ ...data, age })}
            />
            <Text style={styles.unit}>years</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Height</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="170"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="decimal-pad"
              value={data.height}
              onChangeText={(height) => setData({ ...data, height })}
            />
            <Text style={styles.unit}>cm</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Weight</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="65"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="decimal-pad"
              value={data.weight}
              onChangeText={(weight) => setData({ ...data, weight })}
            />
            <Text style={styles.unit}>kg</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Diet Type</Text>
          <View style={styles.dietContainer}>
            {DIET_TYPES.map((diet) => (
              <TouchableOpacity
                key={diet}
                style={[
                  styles.dietButton,
                  data.dietType === diet && styles.dietButtonActive,
                ]}
                onPress={() => setData({ ...data, dietType: diet })}
              >
                <Text
                  style={[
                    styles.dietText,
                    data.dietType === diet && styles.dietTextActive,
                  ]}
                >
                  {diet}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleContinue}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logMeal } from '../db/mealRepo';
import { getUserProfile } from '../db/userRepo';
import { COLORS } from '../context/ThemeContext';

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
};

interface QuantityOption {
  label: string;
  multiplier: number;
}

const QUANTITY_OPTIONS: QuantityOption[] = [
  { label: '0.5x', multiplier: 0.5 },
  { label: '1x', multiplier: 1 },
  { label: '2x', multiplier: 2 },
];

export function LogFoodScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  
  // State
  const [foodName, setFoodName] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = useCallback(async () => {
    if (!foodName.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    if (selectedQuantity <= 0) {
      Alert.alert('Error', 'Please select a valid quantity');
      return;
    }

    setIsLoading(true);

    try {
      const userProfile = await getUserProfile();
      if (!userProfile) {
        Alert.alert('Error', 'User profile not found. Please complete onboarding.');
        setIsLoading(false);
        return;
      }

      // Estimate basic nutrition (placeholder values until AI/database integration)
      const baseCalories = 200;
      const estimatedNutrition = {
        date: new Date().toISOString().split('T')[0],
        food_id: `manual_${Date.now()}`,
        food_name: foodName.trim(),
        portion_label: `${selectedQuantity}x`,
        portion_grams: 100 * selectedQuantity,
        calories: Math.round(baseCalories * selectedQuantity),
        protein: Math.round(20 * selectedQuantity),
        carbs: Math.round(25 * selectedQuantity),
        fat: Math.round(7 * selectedQuantity),
        fiber: Math.round(3 * selectedQuantity),
        iron: Math.round(1.5 * selectedQuantity * 10) / 10,
        calcium: Math.round(100 * selectedQuantity),
        vitamin_d_ug: Math.round(1 * selectedQuantity * 10) / 10,
      };

      await logMeal(estimatedNutrition);

      // Reset form
      setFoodName('');
      setSelectedQuantity(1);

      Alert.alert('Success', `Logged "${foodName}" (${selectedQuantity}x portion)`);
    } catch (error) {
      console.error('Error logging meal:', error);
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [foodName, selectedQuantity]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.header}>Log Your Meal</Text>

        {/* Food Name Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Food Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter food or meal name"
            placeholderTextColor={COLORS.textSecondary}
            value={foodName}
            onChangeText={setFoodName}
            editable={!isLoading}
          />
        </View>

        {/* Quantity Selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Portion Size</Text>
          <View style={styles.quantityContainer}>
            {QUANTITY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.multiplier}
                style={[
                  styles.quantityButton,
                  selectedQuantity === option.multiplier &&
                    styles.quantityButtonActive,
                ]}
                onPress={() => setSelectedQuantity(option.multiplier)}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.quantityButtonText,
                    selectedQuantity === option.multiplier &&
                      styles.quantityButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Display selected quantity info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            {selectedQuantity === 1
              ? '1x serving'
              : selectedQuantity === 0.5
                ? 'Half serving'
                : `${selectedQuantity}x serving`}
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            isLoading && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.textPrimary} />
          ) : (
            <Text style={styles.saveButtonText}>Save Meal</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: 'System',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  quantityButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
  },
  quantityButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quantityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  quantityButtonTextActive: {
    color: COLORS.secondary,
  },
  infoBox: {
    backgroundColor: COLORS.cardBackground,
    borderColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.secondary,
  },
});

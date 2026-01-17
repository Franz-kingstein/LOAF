import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  searchFoods,
  calculateNutrition,
  getPortionOptions,
  formatNutrition,
  IndianFood,
  FoodNutrition,
} from '../utils/foodSearch';

const COLORS = {
  background: '#000000',
  surface: '#0E0E0E',
  primary: '#143109',
  secondary: '#B5BFA1',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  textTertiary: '#666666',
  border: '#1A1A1A',
  error: '#EF4444',
};

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
  xl: 16,
};

interface SelectedFood {
  food: IndianFood;
  portion: number;
  nutrition: FoodNutrition;
}

const PORTION_PRESETS = [100, 150, 200, 250, 300];

export function LogFoodScreenComponent(): React.ReactElement {
  const insets = useSafeAreaInsets();

  // Search & selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<IndianFood | null>(null);
  const [selectedPortion, setSelectedPortion] = useState(150);
  const [isSearching, setIsSearching] = useState(false);
  const [loggedMeals, setLoggedMeals] = useState<SelectedFood[]>([]);

  // Search results (memoized for performance)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    setIsSearching(true);
    const results = searchFoods(searchQuery, 15);
    setIsSearching(false);
    return results;
  }, [searchQuery]);

  // Calculate nutrition for selected portion
  const currentNutrition = useMemo(() => {
    if (!selectedFood) return null;
    return calculateNutrition(selectedFood, selectedPortion);
  }, [selectedFood, selectedPortion]);

  const handleSelectFood = useCallback((food: IndianFood) => {
    setSelectedFood(food);
    setSelectedPortion(150);
    setSearchQuery('');
  }, []);

  const handleLogMeal = useCallback(() => {
    if (!selectedFood || !currentNutrition) return;

    const meal: SelectedFood = {
      food: selectedFood,
      portion: selectedPortion,
      nutrition: currentNutrition,
    };

    setLoggedMeals([...loggedMeals, meal]);
    setSelectedFood(null);
    setSelectedPortion(150);
  }, [selectedFood, selectedPortion, currentNutrition, loggedMeals]);

  const handleRemoveMeal = useCallback((index: number) => {
    setLoggedMeals(loggedMeals.filter((_, i) => i !== index));
  }, [loggedMeals]);

  const handleClearAll = useCallback(() => {
    setLoggedMeals([]);
  }, []);

  // Calculate daily totals
  const dailyTotals = useMemo(() => {
    if (loggedMeals.length === 0) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        iron: 0,
        calcium: 0,
        vitaminD: 0,
      };
    }

    return loggedMeals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.nutrition.calories,
        protein: totals.protein + meal.nutrition.protein,
        carbs: totals.carbs + meal.nutrition.carbohydrates,
        fat: totals.fat + meal.nutrition.fat,
        fiber: totals.fiber + meal.nutrition.fiber,
        iron: totals.iron + meal.nutrition.iron,
        calcium: totals.calcium + meal.nutrition.calcium,
        vitaminD: totals.vitaminD + meal.nutrition.vitaminD,
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        iron: 0,
        calcium: 0,
        vitaminD: 0,
      }
    );
  }, [loggedMeals]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    content: {
      flex: 1,
      padding: SPACING.lg,
    },
    searchContainer: {
      marginBottom: SPACING.lg,
    },
    searchInput: {
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      color: COLORS.textPrimary,
      fontSize: 16,
    },
    searchPlaceholder: {
      color: COLORS.textTertiary,
    },
    searchResultsContainer: {
      maxHeight: 250,
      backgroundColor: COLORS.surface,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: COLORS.border,
      overflow: 'hidden',
    },
    foodItemContainer: {
      padding: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    foodItemName: {
      color: COLORS.textPrimary,
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 4,
    },
    foodItemCategory: {
      color: COLORS.textSecondary,
      fontSize: 12,
    },
    foodItemTouchable: {
      padding: SPACING.md,
    },
    selectedFoodContainer: {
      backgroundColor: COLORS.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.lg,
      borderWidth: 2,
      borderColor: COLORS.primary,
    },
    selectedFoodName: {
      color: COLORS.textPrimary,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: SPACING.sm,
    },
    portionSection: {
      marginBottom: SPACING.lg,
    },
    portionLabel: {
      color: COLORS.textPrimary,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: SPACING.sm,
    },
    portionPresets: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginBottom: SPACING.md,
      flexWrap: 'wrap',
    },
    presetButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: RADIUS.sm,
    },
    presetButtonActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    presetButtonText: {
      color: COLORS.textPrimary,
      fontSize: 13,
    },
    presetButtonTextActive: {
      color: COLORS.textPrimary,
      fontWeight: '600',
    },
    customPortionInput: {
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: RADIUS.sm,
      padding: SPACING.sm,
      color: COLORS.textPrimary,
      fontSize: 14,
      flex: 1,
    },
    nutritionGrid: {
      marginBottom: SPACING.lg,
    },
    nutritionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    nutritionLabel: {
      color: COLORS.textSecondary,
      fontSize: 13,
      flex: 1,
    },
    nutritionValue: {
      color: COLORS.textPrimary,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'right',
      flex: 1,
    },
    logButton: {
      backgroundColor: COLORS.primary,
      padding: SPACING.md,
      borderRadius: RADIUS.md,
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    logButtonText: {
      color: COLORS.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    loggedMealsSection: {
      marginTop: SPACING.lg,
    },
    loggedMealsSectionTitle: {
      color: COLORS.textPrimary,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: SPACING.md,
    },
    loggedMealItem: {
      backgroundColor: COLORS.surface,
      borderRadius: RADIUS.md,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderLeftWidth: 3,
      borderLeftColor: COLORS.secondary,
    },
    loggedMealName: {
      color: COLORS.textPrimary,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    loggedMealPortion: {
      color: COLORS.textSecondary,
      fontSize: 12,
      marginBottom: 8,
    },
    loggedMealNutrition: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    loggedMealNutritionItem: {
      alignItems: 'center',
      flex: 1,
    },
    loggedMealNutritionLabel: {
      color: COLORS.textTertiary,
      fontSize: 10,
    },
    loggedMealNutritionValue: {
      color: COLORS.secondary,
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
    },
    removeButton: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      backgroundColor: COLORS.error,
      borderRadius: RADIUS.sm,
      alignItems: 'center',
      marginTop: 8,
    },
    removeButtonText: {
      color: COLORS.textPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    dailyTotalsContainer: {
      backgroundColor: COLORS.surface,
      borderRadius: RADIUS.lg,
      padding: SPACING.lg,
      borderTopWidth: 2,
      borderTopColor: COLORS.secondary,
    },
    dailyTotalsTitle: {
      color: COLORS.textPrimary,
      fontSize: 15,
      fontWeight: '700',
      marginBottom: SPACING.md,
    },
    totalGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
    },
    totalItem: {
      flex: 1,
      minWidth: '48%',
      backgroundColor: COLORS.background,
      padding: SPACING.md,
      borderRadius: RADIUS.sm,
      borderWidth: 1,
      borderColor: COLORS.border,
      alignItems: 'center',
    },
    totalLabel: {
      color: COLORS.textSecondary,
      fontSize: 11,
      marginBottom: 4,
    },
    totalValue: {
      color: COLORS.secondary,
      fontSize: 14,
      fontWeight: '700',
    },
    clearButton: {
      marginTop: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: COLORS.error,
      alignItems: 'center',
    },
    clearButtonText: {
      color: COLORS.error,
      fontSize: 13,
      fontWeight: '600',
    },
    emptyMessage: {
      color: COLORS.textTertiary,
      fontSize: 14,
      textAlign: 'center',
      paddingVertical: SPACING.lg,
    },
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: SPACING.lg,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholderTextColor={COLORS.textTertiary}
            placeholder="🔍 Search Indian foods..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Search Results */}
        {isSearching && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.secondary} />
          </View>
        )}

        {searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <FlatList
              data={searchResults}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.foodItemTouchable}
                  onPress={() => handleSelectFood(item)}
                >
                  <View style={styles.foodItemContainer}>
                    <Text style={styles.foodItemName}>{item.name}</Text>
                    <Text style={styles.foodItemCategory}>
                      {item.category} • Food
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Selected Food Details */}
        {selectedFood && currentNutrition && (
          <View style={styles.selectedFoodContainer}>
            <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>

            {/* Portion Selection */}
            <View style={styles.portionSection}>
              <Text style={styles.portionLabel}>Portion Size (grams)</Text>

              <View style={styles.portionPresets}>
                {PORTION_PRESETS.map(preset => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetButton,
                      selectedPortion === preset && styles.presetButtonActive,
                    ]}
                    onPress={() => setSelectedPortion(preset)}
                  >
                    <Text
                      style={[
                        styles.presetButtonText,
                        selectedPortion === preset && styles.presetButtonTextActive,
                      ]}
                    >
                      {preset}g
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.customPortionInput}
                placeholderTextColor={COLORS.textTertiary}
                placeholder="Or enter custom grams..."
                keyboardType="number-pad"
                value={selectedPortion.toString()}
                onChangeText={text => {
                  const num = parseInt(text, 10);
                  if (!isNaN(num) && num > 0) setSelectedPortion(num);
                }}
              />
            </View>

            {/* Nutrition Facts */}
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Calories</Text>
                <Text style={styles.nutritionValue}>
                  {currentNutrition.calories.toFixed(0)} kcal
                </Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Protein</Text>
                <Text style={styles.nutritionValue}>{currentNutrition.protein.toFixed(1)}g</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Carbohydrates</Text>
                <Text style={styles.nutritionValue}>
                  {currentNutrition.carbohydrates.toFixed(1)}g
                </Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Fat</Text>
                <Text style={styles.nutritionValue}>{currentNutrition.fat.toFixed(1)}g</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Fiber</Text>
                <Text style={styles.nutritionValue}>{currentNutrition.fiber.toFixed(1)}g</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Iron</Text>
                <Text style={styles.nutritionValue}>{currentNutrition.iron.toFixed(2)}mg</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Calcium</Text>
                <Text style={styles.nutritionValue}>{currentNutrition.calcium.toFixed(0)}mg</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Vitamin D</Text>
                <Text style={styles.nutritionValue}>{currentNutrition.vitaminD.toFixed(1)}µg</Text>
              </View>
            </View>

            {/* Log Button */}
            <TouchableOpacity style={styles.logButton} onPress={handleLogMeal}>
              <Text style={styles.logButtonText}>✓ Log Meal</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Logged Meals */}
        {loggedMeals.length > 0 && (
          <View style={styles.loggedMealsSection}>
            <Text style={styles.loggedMealsSectionTitle}>Today's Meals ({loggedMeals.length})</Text>

            {loggedMeals.map((meal, index) => (
              <View key={index} style={styles.loggedMealItem}>
                <Text style={styles.loggedMealName}>{meal.food.name}</Text>
                <Text style={styles.loggedMealPortion}>{meal.portion}g serving</Text>

                <View style={styles.loggedMealNutrition}>
                  <View style={styles.loggedMealNutritionItem}>
                    <Text style={styles.loggedMealNutritionLabel}>Calories</Text>
                    <Text style={styles.loggedMealNutritionValue}>
                      {meal.nutrition.calories.toFixed(0)}
                    </Text>
                  </View>
                  <View style={styles.loggedMealNutritionItem}>
                    <Text style={styles.loggedMealNutritionLabel}>Protein</Text>
                    <Text style={styles.loggedMealNutritionValue}>
                      {meal.nutrition.protein.toFixed(1)}g
                    </Text>
                  </View>
                  <View style={styles.loggedMealNutritionItem}>
                    <Text style={styles.loggedMealNutritionLabel}>Carbs</Text>
                    <Text style={styles.loggedMealNutritionValue}>
                      {meal.nutrition.carbohydrates.toFixed(1)}g
                    </Text>
                  </View>
                  <View style={styles.loggedMealNutritionItem}>
                    <Text style={styles.loggedMealNutritionLabel}>Fiber</Text>
                    <Text style={styles.loggedMealNutritionValue}>
                      {meal.nutrition.fiber.toFixed(1)}g
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveMeal(index)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Daily Totals */}
            <View style={styles.dailyTotalsContainer}>
              <Text style={styles.dailyTotalsTitle}>Daily Totals</Text>
              <View style={styles.totalGrid}>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Calories</Text>
                  <Text style={styles.totalValue}>{dailyTotals.calories.toFixed(0)}</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Protein</Text>
                  <Text style={styles.totalValue}>{dailyTotals.protein.toFixed(1)}g</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Carbs</Text>
                  <Text style={styles.totalValue}>{dailyTotals.carbs.toFixed(1)}g</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Fat</Text>
                  <Text style={styles.totalValue}>{dailyTotals.fat.toFixed(1)}g</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Fiber</Text>
                  <Text style={styles.totalValue}>{dailyTotals.fiber.toFixed(1)}g</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Iron</Text>
                  <Text style={styles.totalValue}>{dailyTotals.iron.toFixed(2)}mg</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Calcium</Text>
                  <Text style={styles.totalValue}>{dailyTotals.calcium.toFixed(0)}mg</Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Vitamin D</Text>
                  <Text style={styles.totalValue}>{dailyTotals.vitaminD.toFixed(1)}µg</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
                <Text style={styles.clearButtonText}>Clear All Meals</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!selectedFood && loggedMeals.length === 0 && searchResults.length === 0 && !searchQuery && (
          <Text style={styles.emptyMessage}>🍽️ Search for foods to get started</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

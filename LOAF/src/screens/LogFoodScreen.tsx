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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { logMeal } from '../db/mealRepo';
import { saveCustomFood } from '../db/customFoodRepo';
import { getUserProfile } from '../db/userRepo';
import { COLORS } from '../context/ThemeContext';
import { Food } from '../data/loadFoodData';
import { FoodSearchInput } from '../components/FoodSearchInput';
import { PortionPicker } from '../components/PortionPicker';
import { calculateNutritionFromGrams, formatNutrition } from '../utils/nutritionCalculator';
import { predictFoodFromImage, pickImage, takePhoto } from '../services/imageInference';
import { findBestMatch } from '../services/foodMatcher';

export function LogFoodScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  
  // State
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [selectedPortionLabel, setSelectedPortionLabel] = useState<string>('');
  const [portionGrams, setPortionGrams] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('snack');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    weight: '100'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const handleFoodSelect = (food: Food) => {
    setSelectedFood(food);
    setIsCustomMode(false);
    const firstPortion = Object.entries(food.portionHints)[0];
    if (firstPortion) {
      setSelectedPortionLabel(firstPortion[0]);
      setPortionGrams(firstPortion[1]);
    }
  };

  const handleImageInput = async (mode: 'camera' | 'library') => {
    try {
      const uri = mode === 'camera' ? await takePhoto() : await pickImage();
      if (!uri) return;

      setIsProcessingImage(true);
      const predictions = await predictFoodFromImage(uri);
      
      if (predictions.length > 0) {
        const topPrediction = predictions[0].label;
        const match = findBestMatch(topPrediction);
        
        if (match && predictions[0].score > 0.6) {
          handleFoodSelect(match);
          Alert.alert('Matched Food', `Identified: ${match.name} (${Math.round(predictions[0].score * 100)}% confidence)`);
        } else {
          Alert.alert('Low Confidence', 'Could not reliably match image to database. Please search manually.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to process image');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const resetForm = () => {
    setSelectedFood(null);
    setQuantity(1);
    setIsCustomMode(false);
    setCustomFood({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      weight: '100'
    });
  };

  const handleSave = useCallback(async () => {
    if (!selectedFood && !isCustomMode) {
      Alert.alert('Error', 'Please select or enter a food');
      return;
    }

    setIsLoading(true);

    try {
      let mealEntry;

      if (isCustomMode) {
        if (!customFood.name || !customFood.calories) {
          Alert.alert('Error', 'Please fill in food name and calories');
          setIsLoading(false);
          return;
        }

        const calories = parseFloat(customFood.calories) || 0;
        const protein = parseFloat(customFood.protein) || 0;
        const carbs = parseFloat(customFood.carbs) || 0;
        const fat = parseFloat(customFood.fat) || 0;
        const fiber = parseFloat(customFood.fiber) || 0;
        const weight = parseFloat(customFood.weight) || 100;

        // Permanent save to custom dictionary
        const customId = await saveCustomFood({
          name: customFood.name,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          weight_grams: weight
        });

        mealEntry = {
          date: new Date().toISOString().split('T')[0],
          food_id: customId,
          food_name: customFood.name,
          meal_type: mealType,
          portion_label: 'Custom serving',
          portion_grams: weight,
          quantity: 1,
          total_grams: weight,
          calories,
          protein,
          carbs,
          fat,
          fiber,
          confidence: 1.0,
          source: 'user_input',
          timestamp: new Date().toISOString(),
        };
      } else if (selectedFood) {
        const totalGrams = portionGrams * quantity;
        const rawNutrition = calculateNutritionFromGrams(selectedFood, totalGrams);
        const displayNutrition = formatNutrition(rawNutrition);

        mealEntry = {
          date: new Date().toISOString().split('T')[0],
          food_id: selectedFood.id,
          food_name: selectedFood.name,
          meal_type: mealType,
          portion_label: selectedPortionLabel,
          portion_grams: portionGrams,
          quantity: quantity,
          total_grams: totalGrams,
          ...displayNutrition,
          confidence: selectedFood.confidence,
          source: selectedFood.source,
          timestamp: new Date().toISOString(),
        };
      }

      if (mealEntry) {
        await logMeal(mealEntry as any);
        Alert.alert('Success', `Logged ${mealEntry.food_name} for ${mealType}`);
        resetForm();
      }
    } catch (error) {
      console.error('Error logging meal:', error);
      Alert.alert('Error', 'Failed to save meal.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFood, portionGrams, quantity, selectedPortionLabel, mealType, isCustomMode, customFood]);

  const nutritionPreview = selectedFood ? formatNutrition(calculateNutritionFromGrams(selectedFood, portionGrams * quantity)) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Log Food</Text>
          <TouchableOpacity 
            onPress={() => {
              setIsCustomMode(!isCustomMode);
              setSelectedFood(null);
            }}
            style={[styles.customToggle, isCustomMode && styles.customToggleActive]}
          >
            <Text style={styles.customToggleText}>{isCustomMode ? 'Search Mode' : '+ Custom'}</Text>
          </TouchableOpacity>
        </View>

        {/* Meal Type Selector */}
        <View style={styles.mealTypeSection}>
          <Text style={styles.label}>When are you eating?</Text>
          <View style={styles.mealTypeGrid}>
            {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setMealType(type as any)}
                style={[styles.mealTypeBtn, mealType === type && styles.mealTypeBtnActive]}
              >
                <Text style={[styles.mealTypeBtnText, mealType === type && styles.mealTypeBtnActiveText]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {!isCustomMode ? (
          <>
            <View style={styles.cameraActions}>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleImageInput('camera')}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="camera" size={16} color={COLORS.secondary} style={{ marginRight: 4 }} />
                  <Text style={styles.buttonTextSmall}>Camera</Text>
                </View>
              </TouchableOpacity>
            </View>

            <FoodSearchInput onSelect={handleFoodSelect} />

            {isProcessingImage && <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 20 }} />}

            {selectedFood && (
              <View style={styles.detailsCard}>
                <Text style={styles.foodName}>{selectedFood.name}</Text>
                
                <PortionPicker 
                  options={Object.entries(selectedFood.portionHints).map(([label, grams]) => ({ label, grams }))}
                  selectedLabel={selectedPortionLabel}
                  onSelect={(opt) => {
                    setSelectedPortionLabel(opt.label);
                    setPortionGrams(opt.grams);
                  }}
                />

                <View style={styles.section}>
                  <Text style={styles.label}>Quantity</Text>
                  <View style={styles.quantitySelector}>
                    <TouchableOpacity onPress={() => setQuantity(Math.max(0.5, quantity - 0.5))} style={styles.qBtn}><Text style={styles.qBtnText}>-</Text></TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}x</Text>
                    <TouchableOpacity onPress={() => setQuantity(quantity + 0.5)} style={styles.qBtn}><Text style={styles.qBtnText}>+</Text></TouchableOpacity>
                  </View>
                </View>

                {nutritionPreview && (
                  <View style={styles.nutritionBox}>
                    <Text style={styles.nutritionTitle}>Nutrition Summary ({portionGrams * quantity}g)</Text>
                    <View style={styles.nutritionGrid}>
                      <Text style={styles.nutrient}>Cal: {nutritionPreview.calories}</Text>
                      <Text style={styles.nutrient}>Prot: {nutritionPreview.protein}g</Text>
                      <Text style={styles.nutrient}>Carbs: {nutritionPreview.carbs}g</Text>
                      <Text style={styles.nutrient}>Fat: {nutritionPreview.fat}g</Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.saveButton, isLoading && styles.disabledButton]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={COLORS.textPrimary} />
                  ) : (
                    <Text style={styles.saveButtonText}>Add to Meal Log</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <View style={styles.detailsCard}>
            <Text style={styles.foodName}>Custom Food Entry</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Food Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Grandma's Secret Stew"
                placeholderTextColor={COLORS.textSecondary}
                value={customFood.name}
                onChangeText={(t) => setCustomFood({ ...customFood, name: t })}
              />
            </View>

            <View style={styles.nutritionInputGrid}>
              <View style={styles.inputGroupFull}>
                <Text style={styles.inputLabel}>Calories (kcal)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
                  value={customFood.calories}
                  onChangeText={(t) => setCustomFood({ ...customFood, calories: t })}
                />
              </View>
              
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
                  value={customFood.protein}
                  onChangeText={(t) => setCustomFood({ ...customFood, protein: t })}
                />
              </View>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
                  value={customFood.carbs}
                  onChangeText={(t) => setCustomFood({ ...customFood, carbs: t })}
                />
              </View>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Fat (g)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textSecondary}
                  value={customFood.fat}
                  onChangeText={(t) => setCustomFood({ ...customFood, fat: t })}
                />
              </View>
              <View style={styles.inputGroupHalf}>
                <Text style={styles.inputLabel}>Weight (g)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="100"
                  placeholderTextColor={COLORS.textSecondary}
                  value={customFood.weight}
                  onChangeText={(t) => setCustomFood({ ...customFood, weight: t })}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.textPrimary} />
              ) : (
                <Text style={styles.saveButtonText}>Save Custom Meal</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: '5%',
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  customToggle: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  customToggleActive: {
    backgroundColor: COLORS.accent,
  },
  customToggleText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  mealTypeSection: {
    marginBottom: 20,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  mealTypeBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  mealTypeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.secondary,
  },
  mealTypeBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  mealTypeBtnActiveText: {
    color: COLORS.textPrimary,
  },
  cameraActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16,
  },
  iconButton: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  buttonTextSmall: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  detailsCard: {
    marginTop: 20,
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  foodName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    padding: 12,
    borderRadius: 12,
  },
  qBtn: {
    backgroundColor: COLORS.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qBtnText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  nutritionBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  nutritionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nutrient: {
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  nutritionInputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputGroupFull: {
    width: '100%',
    marginBottom: 12,
  },
  inputGroupHalf: {
    width: '48%',
    marginBottom: 12,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

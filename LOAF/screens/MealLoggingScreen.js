/**
 * Meal Logging Screen Component
 * UI for logging meals, viewing daily nutrition, and managing meal entries
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import mealLoggingService from '../services/mealLoggingService';

const MealLoggingScreen = ({ userId = 'user_001' }) => {
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');

  // Form state
  const [foodQuery, setFoodQuery] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [quantityUnit, setQuantityUnit] = useState('g');
  const [notes, setNotes] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const quantityUnits = ['g', 'ml', '1 cup', '1 glass', '1 katori', '1 piece', '1 spoon', 'oz', 'lb'];

  useEffect(() => {
    initializeAndLoadData();
  }, []);

  const initializeAndLoadData = async () => {
    try {
      setLoading(true);
      await mealLoggingService.initialize();
      const log = mealLoggingService.getTodayMealLog(userId);
      setTodayLog(log);
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize meal logging');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodSearch = (text) => {
    setFoodQuery(text);
    if (text.length > 1) {
      const results = mealLoggingService.foodDatabase.foods?.filter(food =>
        food.name.toLowerCase().includes(text.toLowerCase()) ||
        (food.aliases && food.aliases.some(alias =>
          alias.toLowerCase().includes(text.toLowerCase())
        ))
      ).slice(0, 5) || [];
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleAddMeal = async (selectedFood = null) => {
    try {
      const query = selectedFood ? selectedFood.name : foodQuery;

      if (!query.trim()) {
        Alert.alert('Error', 'Please enter a food name');
        return;
      }

      if (!quantity || isNaN(quantity)) {
        Alert.alert('Error', 'Please enter a valid quantity');
        return;
      }

      const result = await mealLoggingService.addMeal(
        userId,
        query,
        parseFloat(quantity),
        quantityUnit,
        selectedMealType,
        notes
      );

      if (result.success) {
        setTodayLog(result.dailyLog);
        resetForm();
        setModalVisible(false);
        Alert.alert('Success', 'Meal logged successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to log meal');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add meal');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFoodQuery('');
    setQuantity('100');
    setQuantityUnit('g');
    setNotes('');
    setSearchResults([]);
  };

  const handleRemoveMeal = (mealId) => {
    Alert.alert('Remove Meal', 'Are you sure?', [
      { text: 'Cancel', onPress: () => { } },
      {
        text: 'Remove',
        onPress: async () => {
          const result = await mealLoggingService.removeMeal(
            todayLog.logId,
            mealId
          );
          if (result.success) {
            setTodayLog(result.log);
            Alert.alert('Success', 'Meal removed');
          }
        },
      },
    ]);
  };

  const handleUpdateMeal = (mealId) => {
    Alert.prompt(
      'Update Quantity',
      'Enter new quantity',
      [
        {
          text: 'Cancel',
          onPress: () => { },
        },
        {
          text: 'Update',
          onPress: async (newQuantity) => {
            const result = await mealLoggingService.updateMeal(
              todayLog.logId,
              mealId,
              { quantity: parseFloat(newQuantity) }
            );
            if (result.success) {
              setTodayLog(result.log);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const dailyNutrition = todayLog?.dayDailyNutrition || {};
  const nutritionVsTarget = todayLog?.nutritionVsTarget || {};
  const meals = todayLog?.meals || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meal Logging</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Daily Nutrition Summary */}
        <View style={styles.nutritionCard}>
          <Text style={styles.cardTitle}>Today's Nutrition</Text>

          <View style={styles.nutritionRow}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Calories</Text>
              <Text style={styles.nutritionValue}>
                {Math.round(dailyNutrition.totalCalories || 0)}
              </Text>
              <Text style={styles.nutritionTarget}>
                {Math.round(nutritionVsTarget.caloriePercentage || 0)}%
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Protein</Text>
              <Text style={styles.nutritionValue}>
                {Math.round(dailyNutrition.totalProtein?.value || 0)}g
              </Text>
              <Text style={styles.nutritionTarget}>
                {Math.round(nutritionVsTarget.proteinPercentage || 0)}%
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Carbs</Text>
              <Text style={styles.nutritionValue}>
                {Math.round(dailyNutrition.totalCarbohydrates?.value || 0)}g
              </Text>
              <Text style={styles.nutritionTarget}>
                {Math.round(nutritionVsTarget.carbohydratePercentage || 0)}%
              </Text>
            </View>

            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionLabel}>Fat</Text>
              <Text style={styles.nutritionValue}>
                {Math.round(dailyNutrition.totalFat?.value || 0)}g
              </Text>
              <Text style={styles.nutritionTarget}>
                {Math.round(nutritionVsTarget.fatPercentage || 0)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Meals by Type */}
        {mealTypes.map(mealType => {
          const mealsOfType = todayLog?.mealsByType?.[mealType] || [];
          return (
            <View key={mealType} style={styles.mealTypeSection}>
              <View style={styles.mealTypeHeader}>
                <Text style={styles.mealTypeTitle}>
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </Text>
                <Text style={styles.mealCount}>
                  {mealsOfType.length} item{mealsOfType.length !== 1 ? 's' : ''}
                </Text>
              </View>

              {mealsOfType.length > 0 ? (
                mealsOfType.map(meal => (
                  <View key={meal.mealId} style={styles.mealItem}>
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealName}>{meal.foodName}</Text>
                      <Text style={styles.mealQuantity}>
                        {meal.quantity} {meal.quantityUnit}
                      </Text>
                      {meal.notes && (
                        <Text style={styles.mealNotes}>{meal.notes}</Text>
                      )}
                      <Text style={styles.mealCalories}>
                        {Math.round(meal.nutrition.calories)} cal
                      </Text>
                    </View>

                    <View style={styles.mealActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleUpdateMeal(meal.mealId)}
                      >
                        <Text style={styles.actionButtonText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleRemoveMeal(meal.mealId)}
                      >
                        <Text style={styles.actionButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No meals logged</Text>
              )}

              <TouchableOpacity
                style={[styles.addButton, { marginTop: 10 }]}
                onPress={() => {
                  setSelectedMealType(mealType);
                  resetForm();
                  setModalVisible(true);
                }}
              >
                <Text style={styles.addButtonText}>+ Add {mealType}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Add {selectedMealType}</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Food Search */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Food Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Search food..."
                value={foodQuery}
                onChangeText={handleFoodSearch}
                placeholderTextColor="#999"
              />

              {searchResults.length > 0 && (
                <View style={styles.searchResults}>
                  {searchResults.map(food => (
                    <TouchableOpacity
                      key={food.id}
                      style={styles.searchResult}
                      onPress={() => {
                        handleAddMeal(food);
                      }}
                    >
                      <Text style={styles.searchResultName}>{food.name}</Text>
                      <Text style={styles.searchResultInfo}>
                        {Math.round(food.nutrition.calories)} cal
                        {food.aliases && ` • ${food.aliases.length} aliases`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Quantity */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Quantity</Text>
              <View style={styles.quantityRow}>
                <TextInput
                  style={[styles.input, styles.quantityInput]}
                  placeholder="100"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.unitPicker}
                  onPress={() => {
                    Alert.alert('Select Unit', 'Choose a unit', [
                      ...quantityUnits.map(unit => ({
                        text: unit,
                        onPress: () => setQuantityUnit(unit)
                      })),
                      { text: 'Cancel', onPress: () => { }, style: 'cancel' }
                    ]);
                  }}
                >
                  <Text style={styles.unitPickerText}>{quantityUnit}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="e.g., Added extra salt"
                value={notes}
                onChangeText={setNotes}
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={3}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleAddMeal()}
              >
                <Text style={styles.submitButtonText}>Add Meal</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  nutritionCard: {
    margin: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    flex: 1,
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionTarget: {
    fontSize: 11,
    color: '#007AFF',
    marginTop: 2,
  },
  mealTypeSection: {
    marginHorizontal: 12,
    marginVertical: 8,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mealTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mealCount: {
    fontSize: 12,
    color: '#999',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 6,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  mealQuantity: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  mealNotes: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 2,
  },
  mealCalories: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 4,
  },
  mealActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ffe0e0',
  },
  actionButtonText: {
    fontSize: 16,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
    paddingVertical: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalContent: {
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#666',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
    color: '#333',
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quantityInput: {
    flex: 1,
  },
  unitPicker: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
  },
  unitPickerText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  searchResults: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  searchResult: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  searchResultInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default MealLoggingScreen;

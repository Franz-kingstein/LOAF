/**
 * Meal Logging Service
 * Complete logic for logging meals, calculating nutrition, and tracking daily intake
 */

import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

class MealLoggingService {
  constructor() {
    this.mealLogsPath = FileSystem.documentDirectory + 'mealLogs.json';
    this.foodDatabasePath = FileSystem.documentDirectory + 'foodDatabase.json';
    this.userProfilesPath = FileSystem.documentDirectory + 'userProfiles.json';
    this.rdaPath = FileSystem.documentDirectory + 'rdaRecommendations.json';
    this.mealLogs = [];
    this.foodDatabase = {};
    this.userProfiles = {};
    this.rdaRecommendations = {};
  }

  /**
   * Initialize and load all required data
   */
  async initialize() {
    try {
      // Load meal logs
      await this.loadMealLogs();
      // Load food database
      await this.loadFoodDatabase();
      // Load user profiles
      await this.loadUserProfiles();
      // Load RDA recommendations
      await this.loadRDARecommendations();
      console.log('✅ Meal Logging Service initialized');
      return true;
    } catch (error) {
      console.error('❌ Error initializing Meal Logging Service:', error);
      return false;
    }
  }

  /**
   * Load meal logs from file or create new
   */
  async loadMealLogs() {
    try {
      const fileExists = await FileSystem.getInfoAsync(this.mealLogsPath);
      if (fileExists.exists) {
        const data = await FileSystem.readAsStringAsync(this.mealLogsPath);
        this.mealLogs = JSON.parse(data).mealLogs || [];
      } else {
        this.mealLogs = [];
      }
    } catch (error) {
      console.error('Error loading meal logs:', error);
      this.mealLogs = [];
    }
  }

  /**
   * Load food database
   */
  async loadFoodDatabase() {
    try {
      const fileExists = await FileSystem.getInfoAsync(this.foodDatabasePath);
      if (fileExists.exists) {
        const data = await FileSystem.readAsStringAsync(this.foodDatabasePath);
        const parsed = JSON.parse(data);
        this.foodDatabase = parsed.foodDatabase || parsed;
      }
    } catch (error) {
      console.error('Error loading food database:', error);
      this.foodDatabase = { foods: [] };
    }
  }

  /**
   * Load user profiles
   */
  async loadUserProfiles() {
    try {
      const fileExists = await FileSystem.getInfoAsync(this.userProfilesPath);
      if (fileExists.exists) {
        const data = await FileSystem.readAsStringAsync(this.userProfilesPath);
        const parsed = JSON.parse(data);
        this.userProfiles = parsed.userProfiles || parsed;
      }
    } catch (error) {
      console.error('Error loading user profiles:', error);
      this.userProfiles = {};
    }
  }

  /**
   * Load RDA recommendations
   */
  async loadRDARecommendations() {
    try {
      const fileExists = await FileSystem.getInfoAsync(this.rdaPath);
      if (fileExists.exists) {
        const data = await FileSystem.readAsStringAsync(this.rdaPath);
        const parsed = JSON.parse(data);
        this.rdaRecommendations = parsed.rdaRecommendations || parsed;
      }
    } catch (error) {
      console.error('Error loading RDA recommendations:', error);
      this.rdaRecommendations = {};
    }
  }

  /**
   * Find food by ID, name, or alias
   */
  findFood(query) {
    const foods = this.foodDatabase.foods || [];
    const queryLower = query.toLowerCase();

    // Search by ID
    let food = foods.find(f => f.id === query);
    if (food) return food;

    // Search by name
    food = foods.find(f => f.name.toLowerCase() === queryLower);
    if (food) return food;

    // Search by alias
    food = foods.find(f =>
      f.aliases && f.aliases.some(alias => alias.toLowerCase() === queryLower)
    );
    if (food) return food;

    // Fuzzy search (partial match)
    food = foods.find(f =>
      f.name.toLowerCase().includes(queryLower) ||
      (f.aliases && f.aliases.some(alias => alias.toLowerCase().includes(queryLower)))
    );

    return food || null;
  }

  /**
   * Calculate nutrition for a food quantity
   */
  calculateNutrition(food, quantity, servingSize = food.servingSize) {
    if (!food || !food.nutrition) return null;

    const multiplier = quantity / servingSize;
    const nutrition = food.nutrition;

    return {
      calories: Math.round(nutrition.calories * multiplier * 100) / 100,
      protein: {
        value: Math.round(nutrition.protein?.value * multiplier * 100) / 100,
        unit: nutrition.protein?.unit || 'g'
      },
      carbohydrates: {
        value: Math.round(nutrition.carbohydrates?.value * multiplier * 100) / 100,
        unit: nutrition.carbohydrates?.unit || 'g'
      },
      fat: {
        value: Math.round(nutrition.fat?.value * multiplier * 100) / 100,
        unit: nutrition.fat?.unit || 'g'
      },
      fiber: {
        value: Math.round(nutrition.fiber?.value * multiplier * 100) / 100,
        unit: nutrition.fiber?.unit || 'g'
      },
      sugar: {
        value: Math.round(nutrition.sugar?.value * multiplier * 100) / 100,
        unit: nutrition.sugar?.unit || 'g'
      },
      sodium: {
        value: Math.round(nutrition.sodium?.value * multiplier * 100) / 100,
        unit: nutrition.sodium?.unit || 'mg'
      },
      calcium: {
        value: Math.round(nutrition.calcium?.value * multiplier * 100) / 100,
        unit: nutrition.calcium?.unit || 'mg'
      },
      iron: {
        value: Math.round(nutrition.iron?.value * multiplier * 100) / 100,
        unit: nutrition.iron?.unit || 'mg'
      },
      vitaminC: {
        value: Math.round(nutrition.vitaminC?.value * multiplier * 100) / 100,
        unit: nutrition.vitaminC?.unit || 'mg'
      },
      folate: {
        value: Math.round(nutrition.folate?.value * multiplier * 100) / 100,
        unit: nutrition.folate?.unit || 'µg'
      }
    };
  }

  /**
   * Add a meal to the log
   */
  async addMeal(userId, foodQuery, quantity, quantityUnit = 'g', mealType = 'snack', notes = '') {
    try {
      // Find food
      const food = this.findFood(foodQuery);
      if (!food) {
        throw new Error(`Food not found: ${foodQuery}`);
      }

      // Convert quantity to grams if needed
      const quantityInGrams = this.convertToGrams(quantity, quantityUnit, food);

      // Calculate nutrition
      const nutrition = this.calculateNutrition(food, quantityInGrams);

      // Create meal entry
      const meal = {
        mealId: `meal_${Date.now()}`,
        foodId: food.id,
        foodName: food.name,
        quantity: quantity,
        quantityUnit: quantityUnit,
        quantityInGrams: quantityInGrams,
        timestamp: new Date().toISOString(),
        nutrition: nutrition,
        notes: notes
      };

      // Get or create today's log
      const today = new Date().toISOString().split('T')[0];
      let todayLog = this.mealLogs.find(
        log => log.userId === userId && log.date === today
      );

      if (!todayLog) {
        todayLog = {
          logId: `log_${Date.now()}`,
          userId: userId,
          date: today,
          meals: [],
          mealsByType: {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: []
          },
          dayDailyNutrition: {},
          nutritionVsTarget: {}
        };
        this.mealLogs.push(todayLog);
      }

      // Add meal to appropriate meal type
      if (!todayLog.meals) {
        todayLog.meals = [];
      }
      todayLog.meals.push(meal);

      if (!todayLog.mealsByType) {
        todayLog.mealsByType = {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: []
        };
      }
      if (!todayLog.mealsByType[mealType]) {
        todayLog.mealsByType[mealType] = [];
      }
      todayLog.mealsByType[mealType].push(meal);

      // Recalculate daily nutrition
      await this.recalculateDailyNutrition(todayLog, userId);

      // Save to file
      await this.saveMealLogs();

      return {
        success: true,
        meal: meal,
        dailyLog: todayLog
      };
    } catch (error) {
      console.error('Error adding meal:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Convert quantity to grams based on unit and food portion hints
   */
  convertToGrams(quantity, unit, food) {
    const unitLower = unit.toLowerCase();

    // Direct conversions
    const conversions = {
      'g': 1,
      'gram': 1,
      'grams': 1,
      'kg': 1000,
      'kilogram': 1000,
      'ml': 1,
      'milliliter': 1,
      'l': 1000,
      'liter': 1000,
      'oz': 28.35,
      'ounce': 28.35,
      'lb': 453.6,
      'pound': 453.6
    };

    if (conversions[unitLower]) {
      return quantity * conversions[unitLower];
    }

    // Check portion hints
    const portionHints = food.portionHints || {};
    const key = Object.keys(portionHints).find(
      k => k.toLowerCase().replace(/_/g, ' ') === unitLower.replace(/_/g, ' ')
    );

    if (key && portionHints[key]) {
      return quantity * portionHints[key];
    }

    // Default to grams
    console.warn(`Unknown unit: ${unit}, defaulting to grams`);
    return quantity;
  }

  /**
   * Recalculate daily nutrition totals and compare to targets
   */
  async recalculateDailyNutrition(todayLog, userId) {
    try {
      // Sum all nutrition from meals
      const dailyNutrition = {
        totalCalories: 0,
        totalProtein: { value: 0, unit: 'g' },
        totalCarbohydrates: { value: 0, unit: 'g' },
        totalFat: { value: 0, unit: 'g' },
        totalFiber: { value: 0, unit: 'g' },
        totalSugar: { value: 0, unit: 'g' },
        totalSodium: { value: 0, unit: 'mg' },
        totalCalcium: { value: 0, unit: 'mg' },
        totalIron: { value: 0, unit: 'mg' },
        totalVitaminC: { value: 0, unit: 'mg' },
        totalFolate: { value: 0, unit: 'µg' }
      };

      // Aggregate nutrition
      todayLog.meals.forEach(meal => {
        const nut = meal.nutrition;
        dailyNutrition.totalCalories += nut.calories;
        dailyNutrition.totalProtein.value += nut.protein?.value || 0;
        dailyNutrition.totalCarbohydrates.value += nut.carbohydrates?.value || 0;
        dailyNutrition.totalFat.value += nut.fat?.value || 0;
        dailyNutrition.totalFiber.value += nut.fiber?.value || 0;
        dailyNutrition.totalSugar.value += nut.sugar?.value || 0;
        dailyNutrition.totalSodium.value += nut.sodium?.value || 0;
        dailyNutrition.totalCalcium.value += nut.calcium?.value || 0;
        dailyNutrition.totalIron.value += nut.iron?.value || 0;
        dailyNutrition.totalVitaminC.value += nut.vitaminC?.value || 0;
        dailyNutrition.totalFolate.value += nut.folate?.value || 0;
      });

      // Round values
      Object.keys(dailyNutrition).forEach(key => {
        if (typeof dailyNutrition[key] === 'object' && dailyNutrition[key].value) {
          dailyNutrition[key].value = Math.round(dailyNutrition[key].value * 100) / 100;
        } else if (typeof dailyNutrition[key] === 'number') {
          dailyNutrition[key] = Math.round(dailyNutrition[key] * 100) / 100;
        }
      });

      todayLog.dayDailyNutrition = dailyNutrition;

      // Get user targets
      const user = this.userProfiles[userId] || this.userProfiles[Object.keys(this.userProfiles)[0]];
      const targets = user?.dailyTargets || this.getDefaultTargets();

      // Calculate vs targets
      todayLog.nutritionVsTarget = {
        caloriePercentage: Math.round((dailyNutrition.totalCalories / targets.calories) * 100),
        proteinPercentage: Math.round((dailyNutrition.totalProtein.value / targets.protein) * 100),
        carbohydratePercentage: Math.round((dailyNutrition.totalCarbohydrates.value / targets.carbohydrates) * 100),
        fatPercentage: Math.round((dailyNutrition.totalFat.value / targets.fat) * 100),
        fiberPercentage: Math.round((dailyNutrition.totalFiber.value / targets.fiber) * 100),
        sodiumPercentage: Math.round((dailyNutrition.totalSodium.value / targets.sodium) * 100),
        calciumPercentage: Math.round((dailyNutrition.totalCalcium.value / targets.calcium) * 100),
        ironPercentage: Math.round((dailyNutrition.totalIron.value / targets.iron) * 100)
      };

      return true;
    } catch (error) {
      console.error('Error recalculating daily nutrition:', error);
      return false;
    }
  }

  /**
   * Get default nutrition targets
   */
  getDefaultTargets() {
    return {
      calories: 2000,
      protein: 50,
      carbohydrates: 250,
      fat: 65,
      fiber: 25,
      sodium: 2300,
      calcium: 1000,
      iron: 18
    };
  }

  /**
   * Remove a meal from the log
   */
  async removeMeal(logId, mealId) {
    try {
      const log = this.mealLogs.find(l => l.logId === logId);
      if (!log) throw new Error(`Log not found: ${logId}`);

      const mealIndex = log.meals.findIndex(m => m.mealId === mealId);
      if (mealIndex === -1) throw new Error(`Meal not found: ${mealId}`);

      log.meals.splice(mealIndex, 1);

      // Recalculate nutrition
      await this.recalculateDailyNutrition(log, log.userId);

      // Save
      await this.saveMealLogs();

      return { success: true, log: log };
    } catch (error) {
      console.error('Error removing meal:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update meal quantity/notes
   */
  async updateMeal(logId, mealId, updates) {
    try {
      const log = this.mealLogs.find(l => l.logId === logId);
      if (!log) throw new Error(`Log not found: ${logId}`);

      const meal = log.meals.find(m => m.mealId === mealId);
      if (!meal) throw new Error(`Meal not found: ${mealId}`);

      // Update quantity if provided
      if (updates.quantity !== undefined || updates.quantityUnit !== undefined) {
        const food = this.findFood(meal.foodId);
        const quantity = updates.quantity ?? meal.quantity;
        const unit = updates.quantityUnit ?? meal.quantityUnit;

        const quantityInGrams = this.convertToGrams(quantity, unit, food);
        meal.quantity = quantity;
        meal.quantityUnit = unit;
        meal.quantityInGrams = quantityInGrams;

        // Recalculate nutrition
        meal.nutrition = this.calculateNutrition(food, quantityInGrams);
      }

      // Update notes if provided
      if (updates.notes !== undefined) {
        meal.notes = updates.notes;
      }

      // Recalculate daily nutrition
      await this.recalculateDailyNutrition(log, log.userId);

      // Save
      await this.saveMealLogs();

      return { success: true, meal: meal, log: log };
    } catch (error) {
      console.error('Error updating meal:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get today's meal log
   */
  getTodayMealLog(userId) {
    const today = new Date().toISOString().split('T')[0];
    return this.mealLogs.find(
      log => log.userId === userId && log.date === today
    ) || null;
  }

  /**
   * Get meal log for specific date
   */
  getMealLogForDate(userId, date) {
    return this.mealLogs.find(
      log => log.userId === userId && log.date === date
    ) || null;
  }

  /**
   * Get all meal logs for user
   */
  getUserMealLogs(userId) {
    return this.mealLogs.filter(log => log.userId === userId);
  }

  /**
   * Get nutrition summary for a date range
   */
  getNutritionSummary(userId, startDate, endDate) {
    const logs = this.getUserMealLogs(userId).filter(log => {
      return log.date >= startDate && log.date <= endDate;
    });

    const summary = {
      totalDays: logs.length,
      avgCalories: 0,
      avgProtein: 0,
      avgCarbs: 0,
      avgFat: 0,
      avgFiber: 0,
      totalMeals: 0,
      dayByDay: []
    };

    let totalCals = 0, totalProt = 0, totalCarbs = 0, totalFat = 0, totalFiber = 0;

    logs.forEach(log => {
      const daily = log.dayDailyNutrition;
      totalCals += daily.totalCalories || 0;
      totalProt += daily.totalProtein?.value || 0;
      totalCarbs += daily.totalCarbohydrates?.value || 0;
      totalFat += daily.totalFat?.value || 0;
      totalFiber += daily.totalFiber?.value || 0;
      summary.totalMeals += (log.meals || []).length;

      summary.dayByDay.push({
        date: log.date,
        calories: daily.totalCalories,
        protein: daily.totalProtein?.value,
        carbs: daily.totalCarbohydrates?.value,
        fat: daily.totalFat?.value,
        fiber: daily.totalFiber?.value,
        mealCount: (log.meals || []).length
      });
    });

    if (logs.length > 0) {
      summary.avgCalories = Math.round(totalCals / logs.length);
      summary.avgProtein = Math.round((totalProt / logs.length) * 100) / 100;
      summary.avgCarbs = Math.round((totalCarbs / logs.length) * 100) / 100;
      summary.avgFat = Math.round((totalFat / logs.length) * 100) / 100;
      summary.avgFiber = Math.round((totalFiber / logs.length) * 100) / 100;
    }

    return summary;
  }

  /**
   * Get meals by type for a date
   */
  getMealsByType(userId, date, mealType) {
    const log = this.getMealLogForDate(userId, date);
    if (!log) return [];

    return (log.mealsByType?.[mealType] || []);
  }

  /**
   * Save meal logs to file
   */
  async saveMealLogs() {
    try {
      const data = JSON.stringify({ mealLogs: this.mealLogs }, null, 2);
      await FileSystem.writeAsStringAsync(this.mealLogsPath, data);
      return true;
    } catch (error) {
      console.error('Error saving meal logs:', error);
      return false;
    }
  }

  /**
   * Export meal logs as JSON
   */
  exportMealLogs() {
    return JSON.stringify({ mealLogs: this.mealLogs }, null, 2);
  }

  /**
   * Clear all meal logs (for testing)
   */
  async clearMealLogs() {
    try {
      this.mealLogs = [];
      await this.saveMealLogs();
      return true;
    } catch (error) {
      console.error('Error clearing meal logs:', error);
      return false;
    }
  }
}

// Create singleton instance
const mealLoggingService = new MealLoggingService();

export default mealLoggingService;

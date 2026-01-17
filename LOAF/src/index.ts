// Database initialization
export { initializeDatabase, getDatabase } from './db/db';

// User management
export {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  type UserProfile,
} from './db/userRepo';

// Meal logging
export {
  logMeal,
  getMealsForDate,
  getTodayMeals,
  deleteMeal,
  type MealLog,
} from './db/mealRepo';

// Water tracking
export {
  logWater,
  getWaterForDate,
  getTotalWaterForDate,
  getTodayWaterTotal,
  deleteWaterLog,
  type WaterLog,
} from './db/waterRepo';

// Nutrition summary
export {
  computeDailySummary,
  saveDailySummary,
  getDailySummary,
  getTodaySummary,
  getNutritionRange,
  type DailyNutritionSummary,
} from './db/summaryRepo';

// Data loaders
export {
  loadFoodData,
  searchFoods,
  getFoodById,
  getPortionOptions,
  calculateNutrition,
  type Food,
} from './data/loadFoodData';

export {
  loadGoals,
  getGoalById,
  getGoalsByName,
  getAllGoals,
  getKeyNutrients,
  getTopFoodsForGoal,
  type Goal,
} from './data/loadGoals';

export {
  loadRDA,
  getRDAByAgeAndGender,
  getDefaultDailyTargets,
  type RDARecommendation,
} from './data/loadRDA';

export {
  loadNutritionAnalytics,
  getNutrientInfo,
  getAllNutrients,
  getNutrientDescription,
  type NutrientInfo,
} from './data/loadNutrition';

// Helpers
export { generateId, todayDate, formatDate, parseDate } from './utils/helpers';

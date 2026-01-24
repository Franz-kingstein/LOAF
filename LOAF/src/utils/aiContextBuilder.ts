import { getMealsForDate } from '../db/mealRepo';
import { getTodaySummary } from '../db/summaryRepo';
import { getUserProfile } from '../db/userRepo';
import { todayDate } from '../utils/helpers';
import goalMappings from '../../data/goalMappings.json';
import foodDatabase from '../../data/foodDatabase.json';

export interface AIContext {
  goals: string[];
  todayMeals: string[];
  nutrientGaps: string[];
  allowedFoods: string[];
}

export async function buildAIContext(): Promise<AIContext> {
  const [meals, summary, profile] = await Promise.all([
    getMealsForDate(todayDate()),
    getTodaySummary(),
    getUserProfile(),
  ]);

  // Goals
  const goals = profile?.active_goals || [];

  // Today meals
  const todayMeals = meals.map(meal => meal.food_name);

  // Nutrient gaps - simple logic based on goals
  const nutrientGaps: string[] = [];
  if (goals.includes('weight_loss') || goals.includes('general_health')) {
    if ((summary.fiber || 0) < 25) nutrientGaps.push('fiber');
    if ((summary.protein || 0) < 50) nutrientGaps.push('protein');
  }
  if (goals.includes('muscle_gain')) {
    if ((summary.protein || 0) < 100) nutrientGaps.push('protein');
  }
  if ((summary.water_ml || 0) < 2000) nutrientGaps.push('water');

  // Allowed foods - from foodDatabase, limited to relevant ones
  const allowedFoods = foodDatabase.foods
    .filter(food => {
      // Filter based on goals
      const goalMapping = goalMappings.mappings.find(m => goals.includes(m.goalId));
      if (goalMapping) {
        return goalMapping.topFoods.some(topFood =>
          food.name.toLowerCase().includes(topFood.toLowerCase()) ||
          food.aliases?.some(alias => alias.toLowerCase().includes(topFood.toLowerCase()))
        );
      }
      return true; // If no specific goals, allow all
    })
    .slice(0, 50) // Limit to 50 for API
    .map(food => food.name);

  return {
    goals,
    todayMeals,
    nutrientGaps,
    allowedFoods,
  };
}

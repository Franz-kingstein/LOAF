
import { Food } from '../data/loadFoodData';

export interface CalculatedNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
  vitaminD: number;
}

/**
 * Calculates nutrition based on grams.
 * Everything is derived from nutritionPer100g.
 * 
 * formula: (nutrientPer100g / 100) * totalGrams
 */
export function calculateNutritionFromGrams(food: Food, totalGrams: number): CalculatedNutrition {
  // Use nutritionPer100g as source of truth if available, otherwise fallback to nutrition
  const source = (food as any).nutritionPer100g || food.nutrition;
  
  const factor = totalGrams / 100;

  return {
    calories: (source.calories || 0) * factor,
    protein: (source.protein || 0) * factor,
    carbs: (source.carbs || 0) * factor,
    fat: (source.fat || 0) * factor,
    fiber: (source.fiber || 0) * factor,
    iron: (source.iron || 0) * factor,
    calcium: (source.calcium || 0) * factor,
    vitaminD: (source.vitaminD_ug || source.vitaminD || 0) * factor,
  };
}

/**
 * Formats nutrition for display, rounding only at the final step.
 */
export function formatNutrition(nutrition: CalculatedNutrition) {
  return {
    calories: Math.round(nutrition.calories),
    protein: Number(nutrition.protein.toFixed(1)),
    carbs: Number(nutrition.carbs.toFixed(1)),
    fat: Number(nutrition.fat.toFixed(1)),
    fiber: Number(nutrition.fiber.toFixed(1)),
    iron: Number(nutrition.iron.toFixed(2)),
    calcium: Math.round(nutrition.calcium),
    vitaminD: Number(nutrition.vitaminD.toFixed(2)),
  };
}

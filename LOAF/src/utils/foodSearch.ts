/**
 * Food Search & Selection Utilities
 * Deterministic, offline-first food database operations
 */

import foodDatabaseRaw from '../../data/foodDatabase.json';

export interface FoodNutrition {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
  vitaminD: number;
}

export interface IndianFood {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  servingSize: number;
  servingSizeUnit: string;
  portionHints: Record<string, number>;
  nutrition: {
    calories: number;
    protein: { value: number; unit: string };
    carbohydrates: { value: number; unit: string };
    fat: { value: number; unit: string };
    fiber: { value: number; unit: string };
    iron: { value: number; unit: string };
    calcium: { value: number; unit: string };
    vitaminC?: { value: number; unit: string };
  };
  confidence: number;
  source: string;
  lastVerified: string;
  vegetarian?: boolean;
  vegan?: boolean;
  isHealthy?: boolean;
}

let cachedFoods: IndianFood[] | null = null;

/**
 * Load the complete Indian food database from JSON
 * Caches result to avoid repeated parsing
 */
export function loadIndianFoodDatabase(): IndianFood[] {
  if (cachedFoods) return cachedFoods;

  const raw = foodDatabaseRaw as any;
  cachedFoods = raw.foodDatabase?.foods || [];

  console.log(`✅ Loaded ${cachedFoods.length} foods from database`);
  return cachedFoods;
}

/**
 * Search foods by name or aliases (case-insensitive)
 * Returns results sorted by relevance
 */
export function searchFoods(query: string, limit: number = 20): IndianFood[] {
  const foods = loadIndianFoodDatabase();
  const q = query.toLowerCase().trim();

  if (!q) return foods.slice(0, limit);

  const results = foods
    .map(food => {
      let score = 0;

      // Exact name match = highest score
      if (food.name.toLowerCase() === q) score = 1000;
      // Name starts with query
      else if (food.name.toLowerCase().startsWith(q)) score = 100;
      // Name contains query
      else if (food.name.toLowerCase().includes(q)) score = 50;

      // Alias matches
      const aliasMatch = food.aliases.find(
        alias => alias.toLowerCase() === q || alias.toLowerCase().startsWith(q)
      );
      if (aliasMatch) score = Math.max(score, 75);
      else if (food.aliases.some(alias => alias.toLowerCase().includes(q))) {
        score = Math.max(score, 25);
      }

      return { food, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ food }) => food);

  return results;
}

/**
 * Get a single food by ID
 */
export function getFoodById(id: string): IndianFood | undefined {
  const foods = loadIndianFoodDatabase();
  return foods.find(f => f.id === id);
}

/**
 * Get all portion options for a food with human-readable labels
 */
export function getPortionOptions(food: IndianFood): Array<{
  label: string;
  grams: number;
  unit: string;
}> {
  return Object.entries(food.portionHints).map(([key, grams]) => {
    const label = key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      label,
      grams,
      unit: `(${grams}g)`,
    };
  });
}

/**
 * Calculate nutrition for a specific serving size
 * Uses per-100g base and scales proportionally
 */
export function calculateNutrition(
  food: IndianFood,
  servingGrams: number
): FoodNutrition {
  const baseServingSize = food.servingSize || 100;
  const multiplier = servingGrams / baseServingSize;

  return {
    calories: Math.round(food.nutrition.calories * multiplier * 100) / 100,
    protein: Math.round(food.nutrition.protein.value * multiplier * 10) / 10,
    carbohydrates: Math.round(food.nutrition.carbohydrates.value * multiplier * 10) / 10,
    fat: Math.round(food.nutrition.fat.value * multiplier * 10) / 10,
    fiber: Math.round(food.nutrition.fiber.value * multiplier * 10) / 10,
    iron: Math.round(food.nutrition.iron.value * multiplier * 100) / 100,
    calcium: Math.round(food.nutrition.calcium.value * multiplier),
    vitaminD: food.nutrition.vitaminC ? Math.round(food.nutrition.vitaminC.value * multiplier * 10) / 10 : 0,
  };
}

/**
 * Search by category
 */
export function getFoodsByCategory(category: string): IndianFood[] {
  const foods = loadIndianFoodDatabase();
  return foods.filter(f => f.category.toLowerCase() === category.toLowerCase());
}

/**
 * Get food categories
 */
export function getCategories(): string[] {
  const foods = loadIndianFoodDatabase();
  const categories = new Set(foods.map(f => f.category));
  return Array.from(categories).sort();
}

/**
 * Filter vegetarian/vegan foods
 */
export function filterByDiet(foods: IndianFood[], dietType: 'all' | 'vegetarian' | 'vegan'): IndianFood[] {
  if (dietType === 'all') return foods;
  if (dietType === 'vegetarian') return foods.filter(f => f.vegetarian !== false);
  if (dietType === 'vegan') return foods.filter(f => f.vegan === true);
  return foods;
}

/**
 * Get healthy foods
 */
export function getHealthyFoods(): IndianFood[] {
  const foods = loadIndianFoodDatabase();
  return foods.filter(f => f.isHealthy === true);
}

/**
 * Format nutrition for display
 */
export function formatNutrition(nutrition: FoodNutrition): Record<string, string> {
  return {
    calories: `${nutrition.calories.toFixed(0)} cal`,
    protein: `${nutrition.protein.toFixed(1)}g`,
    carbs: `${nutrition.carbohydrates.toFixed(1)}g`,
    fat: `${nutrition.fat.toFixed(1)}g`,
    fiber: `${nutrition.fiber.toFixed(1)}g`,
    iron: `${nutrition.iron.toFixed(2)}mg`,
    calcium: `${nutrition.calcium.toFixed(0)}mg`,
    vitaminD: `${nutrition.vitaminD.toFixed(1)}µg`,
  };
}

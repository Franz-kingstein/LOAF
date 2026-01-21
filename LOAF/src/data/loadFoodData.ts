import foodDatabaseRaw from '../../data/foodDatabase.json';
import { getAllCustomFoods } from '../db/customFoodRepo';

export interface Food {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  portionHints: Record<string, number>;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    iron: number;
    calcium: number;
    vitaminD_ug: number;
  };
  confidence: number;
  source: string;
  lastVerified: string;
}

let foodDatabase: Food[] | null = null;
let cachedCustomFoods: Food[] = [];

export async function loadFoodDataAsync(): Promise<Food[]> {
  const baseFoods = (foodDatabaseRaw as any).foods || [];
  
  try {
    const custom = await getAllCustomFoods();
    cachedCustomFoods = custom.map(c => ({
      id: c.id,
      name: c.name,
      category: 'CUSTOM',
      aliases: [],
      portionHints: { '1_serving': c.weight_grams },
      nutrition: {
        calories: c.calories,
        protein: c.protein,
        carbs: c.carbs,
        fat: c.fat,
        fiber: c.fiber,
        iron: 0,
        calcium: 0,
        vitaminD_ug: 0
      },
      confidence: 1.0,
      source: 'user_custom',
      lastVerified: new Date().toISOString()
    }));
  } catch (e) {
    console.warn('Could not load custom foods', e);
  }

  foodDatabase = [...baseFoods, ...cachedCustomFoods];
  return foodDatabase;
}

export function loadFoodData(): Food[] {
  if (foodDatabase) return foodDatabase;

  foodDatabase = (foodDatabaseRaw as any).foods || [];
  return foodDatabase;
}

export function searchFoods(query: string): Food[] {
  const foods = loadFoodData();
  const q = query.toLowerCase().trim();

  return foods.filter(food => {
    const nameMatch = food.name.toLowerCase().includes(q);
    const aliasMatch = food.aliases.some(alias =>
      alias.toLowerCase().includes(q)
    );
    return nameMatch || aliasMatch;
  });
}

export function getFoodById(id: string): Food | undefined {
  const foods = loadFoodData();
  return foods.find(f => f.id === id);
}

export function getPortionOptions(food: Food): Array<{ label: string; grams: number }> {
  return Object.entries(food.portionHints).map(([label, grams]) => ({
    label: label.replace(/_/g, ' '),
    grams,
  }));
}

export function calculateNutrition(food: Food, grams: number) {
  const perGram = grams / 100;
  return {
    calories: Math.round(food.nutrition.calories * perGram),
    protein: Math.round(food.nutrition.protein * perGram * 10) / 10,
    carbs: Math.round(food.nutrition.carbs * perGram * 10) / 10,
    fat: Math.round(food.nutrition.fat * perGram * 10) / 10,
    fiber: Math.round(food.nutrition.fiber * perGram * 10) / 10,
    iron: Math.round(food.nutrition.iron * perGram * 100) / 100,
    calcium: Math.round(food.nutrition.calcium * perGram),
    vitaminD_ug: Math.round(food.nutrition.vitaminD_ug * perGram * 10) / 10,
  };
}

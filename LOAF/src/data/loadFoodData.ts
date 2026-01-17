import foodDatabaseRaw from '../../data/foodDatabase.json';

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

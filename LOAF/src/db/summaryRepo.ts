import { getDatabase } from './db';
import { getMealsForDate } from './mealRepo';
import { getTotalWaterForDate } from './waterRepo';
import { todayDate } from '../utils/helpers';

export interface DailyNutritionSummary {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
  vitamin_d_ug: number;
  water_ml: number;
  updated_at: string;
}

export async function computeDailySummary(date: string): Promise<DailyNutritionSummary> {
  const meals = await getMealsForDate(date);
  const water_ml = await getTotalWaterForDate(date);

  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
      fiber: acc.fiber + meal.fiber,
      iron: acc.iron + meal.iron,
      calcium: acc.calcium + meal.calcium,
      vitamin_d_ug: acc.vitamin_d_ug + meal.vitamin_d_ug,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, iron: 0, calcium: 0, vitamin_d_ug: 0 }
  );

  const now = new Date().toISOString();

  return {
    date,
    ...totals,
    water_ml,
    updated_at: now,
  };
}

export async function saveDailySummary(summary: DailyNutritionSummary): Promise<void> {
  const db = getDatabase();

  await db.runAsync(
    `INSERT OR REPLACE INTO daily_nutrition_summary (date, calories, protein, carbs, fat, fiber, iron, calcium, vitamin_d_ug, water_ml, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [summary.date, summary.calories, summary.protein, summary.carbs, summary.fat, 
     summary.fiber, summary.iron, summary.calcium, summary.vitamin_d_ug, summary.water_ml, summary.updated_at]
  );
}

export async function getDailySummary(date: string): Promise<DailyNutritionSummary> {
  return computeDailySummary(date);
}

export async function getTodaySummary(): Promise<DailyNutritionSummary> {
  return getDailySummary(todayDate());
}

export async function getNutritionRange(startDate: string, endDate: string): Promise<DailyNutritionSummary[]> {
  const db = getDatabase();
  const results = await db.getAllAsync<DailyNutritionSummary>(
    `SELECT * FROM daily_nutrition_summary WHERE date BETWEEN ? AND ? ORDER BY date DESC`,
    [startDate, endDate]
  );
  return results || [];
}

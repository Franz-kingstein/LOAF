import { getDatabase } from './db';
import { getMealsForDate } from './mealRepo';
import { getTotalWaterForDate } from './waterRepo';
import { todayDate } from '../utils/helpers';
import { supabase } from '../utils/supabase';

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

// Supabase sync functions for backup
export async function syncSummariesToSupabase(userId: string): Promise<void> {
  try {
    const db = getDatabase();
    const summaries = await db.getAllAsync<DailyNutritionSummary>('SELECT * FROM daily_nutrition_summary');
    for (const summary of summaries) {
      await supabase.from('summaries').upsert({
        user_id: userId,
        date: summary.date,
        total_calories: summary.calories,
        total_protein: summary.protein,
        total_carbs: summary.carbs,
        total_fat: summary.fat,
        water_intake: summary.water_ml,
        updated_at: summary.updated_at,
      });
    }
  } catch (error) {
    console.error('Error syncing summaries to Supabase:', error);
  }
}

export async function loadSummariesFromSupabase(userId: string): Promise<void> {
  try {
    const { data } = await supabase.from('summaries').select('*').eq('user_id', userId);
    if (data) {
      const db = getDatabase();
      for (const summary of data) {
        await db.runAsync(
          `INSERT OR REPLACE INTO daily_nutrition_summary (date, calories, protein, carbs, fat, fiber, iron, calcium, vitamin_d_ug, water_ml, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [summary.date, summary.total_calories || 0, summary.total_protein || 0, summary.total_carbs || 0, summary.total_fat || 0, 
           0, 0, 0, 0, summary.water_intake || 0, summary.updated_at]
        );
      }
    }
  } catch (error) {
    console.error('Error loading summaries from Supabase:', error);
  }
}

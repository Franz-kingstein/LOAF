import { getDatabase } from './db';
import { generateId, todayDate } from '../utils/helpers';
import { supabase } from '../utils/supabase';

export interface MealLog {
  id: string;
  date: string;
  food_id: string;
  food_name: string;
  portion_label: string;
  portion_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
  vitamin_d_ug: number;
  created_at: string;
}

export async function logMeal(data: Omit<MealLog, 'id' | 'created_at'>): Promise<MealLog> {
  const db = getDatabase();
  const id = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO meal_logs (id, date, food_id, food_name, portion_label, portion_grams, calories, protein, carbs, fat, fiber, iron, calcium, vitamin_d_ug, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.date, data.food_id, data.food_name, data.portion_label, data.portion_grams, 
     data.calories, data.protein, data.carbs, data.fat, data.fiber, data.iron, data.calcium, data.vitamin_d_ug, now]
  );

  return { id, ...data, created_at: now };
}

export async function getMealsForDate(date: string): Promise<MealLog[]> {
  const db = getDatabase();
  const results = await db.getAllAsync<MealLog>(
    'SELECT * FROM meal_logs WHERE date = ? ORDER BY created_at DESC',
    [date]
  );
  return results || [];
}

export async function deleteMeal(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM meal_logs WHERE id = ?', [id]);
}

export async function getTodayMeals(): Promise<MealLog[]> {
  return getMealsForDate(todayDate());
}

// Supabase sync functions for backup
export async function syncMealsToSupabase(userId: string): Promise<void> {
  try {
    const db = getDatabase();
    const meals = await db.getAllAsync<MealLog>('SELECT * FROM meal_logs');
    for (const meal of meals) {
      await supabase.from('meals').upsert({
        id: meal.id,
        user_id: userId,
        food_name: meal.food_name,
        quantity: meal.portion_grams,
        unit: meal.portion_label,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        date: meal.date,
        created_at: meal.created_at,
      });
    }
  } catch (error) {
    console.error('Error syncing meals to Supabase:', error);
  }
}

export async function loadMealsFromSupabase(userId: string): Promise<void> {
  try {
    const { data } = await supabase.from('meals').select('*').eq('user_id', userId);
    if (data) {
      const db = getDatabase();
      for (const meal of data) {
        // Check if exists
        const existing = await db.getFirstAsync('SELECT id FROM meal_logs WHERE id = ?', [meal.id]);
        if (!existing) {
          await db.runAsync(
            `INSERT INTO meal_logs (id, date, food_id, food_name, portion_label, portion_grams, calories, protein, carbs, fat, fiber, iron, calcium, vitamin_d_ug, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [meal.id, meal.date, meal.food_id || '', meal.food_name, meal.unit, meal.quantity, 
             meal.calories || 0, meal.protein || 0, meal.carbs || 0, meal.fat || 0, meal.fiber || 0, meal.iron || 0, meal.calcium || 0, meal.vitamin_d_ug || 0, meal.created_at]
          );
        }
      }
    }
  } catch (error) {
    console.error('Error loading meals from Supabase:', error);
  }
}

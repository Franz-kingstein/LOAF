import { getDatabase } from './db';
import { generateId, todayDate } from '../utils/helpers';

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

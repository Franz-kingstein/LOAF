
import { initializeDatabase } from './db';

export interface CustomFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  weight_grams: number;
}

export async function saveCustomFood(food: Omit<CustomFood, 'id'>): Promise<string> {
  const db = await initializeDatabase();
  const id = `custom_${Date.now()}`;
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO custom_foods (id, name, calories, protein, carbs, fat, fiber, weight_grams, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, food.name, food.calories, food.protein, food.carbs, food.fat, food.fiber, food.weight_grams, now]
  );

  return id;
}

export async function getAllCustomFoods(): Promise<CustomFood[]> {
  const db = await initializeDatabase();
  const results = await db.getAllAsync<any>('SELECT * FROM custom_foods ORDER BY name ASC');
  
  return results.map(row => ({
    id: row.id,
    name: row.name,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    fiber: row.fiber,
    weight_grams: row.weight_grams
  }));
}

export async function deleteCustomFood(id: string): Promise<void> {
  const db = await initializeDatabase();
  await db.runAsync('DELETE FROM custom_foods WHERE id = ?', [id]);
}

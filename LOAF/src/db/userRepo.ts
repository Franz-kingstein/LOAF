import { getDatabase } from './db';

function generateId(): string {
  // simple unique id generator (timestamp + random)
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export interface UserProfile {
  id: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  diet_type: string;
  active_goals: string[];
  created_at: string;
}

export async function createUserProfile(data: Omit<UserProfile, 'id' | 'created_at'>): Promise<UserProfile> {
  const db = getDatabase();
  const id = generateId();
  const now = new Date().toISOString();
  const goalsJson = JSON.stringify(data.active_goals);

  await db.runAsync(
    `INSERT INTO user_profile (id, age, gender, height_cm, weight_kg, diet_type, active_goals, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.age, data.gender, data.height_cm, data.weight_kg, data.diet_type, goalsJson, now]
  );

  return { id, ...data, created_at: now };
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const db = getDatabase();
  const result = await db.getFirstAsync<any>(
    'SELECT * FROM user_profile LIMIT 1'
  );

  if (!result) return null;

  return {
    ...result,
    active_goals: JSON.parse(result.active_goals || '[]'),
  };
}

export async function updateUserProfile(data: Partial<Omit<UserProfile, 'id' | 'created_at'>>): Promise<void> {
  const db = getDatabase();
  const updates: string[] = [];
  const values: any[] = [];

  if (data.age !== undefined) {
    updates.push('age = ?');
    values.push(data.age);
  }
  if (data.gender !== undefined) {
    updates.push('gender = ?');
    values.push(data.gender);
  }
  if (data.height_cm !== undefined) {
    updates.push('height_cm = ?');
    values.push(data.height_cm);
  }
  if (data.weight_kg !== undefined) {
    updates.push('weight_kg = ?');
    values.push(data.weight_kg);
  }
  if (data.diet_type !== undefined) {
    updates.push('diet_type = ?');
    values.push(data.diet_type);
  }
  if (data.active_goals !== undefined) {
    updates.push('active_goals = ?');
    values.push(JSON.stringify(data.active_goals));
  }

  if (updates.length === 0) return;

  await db.runAsync(
    `UPDATE user_profile SET ${updates.join(', ')} LIMIT 1`,
    values
  );
}

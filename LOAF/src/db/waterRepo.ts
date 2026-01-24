import { getDatabase } from './db';
import { generateId, todayDate } from '../utils/helpers';
import { supabase } from '../utils/supabase';

export interface WaterLog {
  id: string;
  date: string;
  amount_ml: number;
  created_at: string;
}

export async function logWater(amount_ml: number, date: string = todayDate()): Promise<WaterLog> {
  const db = getDatabase();
  const id = generateId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO water_logs (id, date, amount_ml, created_at)
     VALUES (?, ?, ?, ?)`,
    [id, date, amount_ml, now]
  );

  return { id, date, amount_ml, created_at: now };
}

export async function getWaterForDate(date: string): Promise<WaterLog[]> {
  const db = getDatabase();
  const results = await db.getAllAsync<WaterLog>(
    'SELECT * FROM water_logs WHERE date = ? ORDER BY created_at',
    [date]
  );
  return results || [];
}

export async function getTotalWaterForDate(date: string): Promise<number> {
  const db = getDatabase();
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT SUM(amount_ml) as total FROM water_logs WHERE date = ?',
    [date]
  );
  return result?.total || 0;
}

export async function getTodayWaterTotal(): Promise<number> {
  return getTotalWaterForDate(todayDate());
}

export async function deleteWaterLog(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM water_logs WHERE id = ?', [id]);
}

// Supabase sync functions for backup
export async function syncWaterLogsToSupabase(userId: string): Promise<void> {
  try {
    const db = getDatabase();
    const logs = await db.getAllAsync<WaterLog>('SELECT * FROM water_logs');
    for (const log of logs) {
      await supabase.from('water_logs').upsert({
        id: log.id,
        user_id: userId,
        amount: log.amount_ml,
        date: log.date,
        created_at: log.created_at,
      });
    }
  } catch (error) {
    console.error('Error syncing water logs to Supabase:', error);
  }
}

export async function loadWaterLogsFromSupabase(userId: string): Promise<void> {
  try {
    const { data } = await supabase.from('water_logs').select('*').eq('user_id', userId);
    if (data) {
      const db = getDatabase();
      for (const log of data) {
        const existing = await db.getFirstAsync('SELECT id FROM water_logs WHERE id = ?', [log.id]);
        if (!existing) {
          await db.runAsync(
            `INSERT INTO water_logs (id, date, amount_ml, created_at)
             VALUES (?, ?, ?, ?)`,
            [log.id, log.date, log.amount, log.created_at]
          );
        }
      }
    }
  } catch (error) {
    console.error('Error loading water logs from Supabase:', error);
  }
}

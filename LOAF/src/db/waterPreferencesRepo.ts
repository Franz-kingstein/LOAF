import { getDatabase } from './db';
import { generateId } from '../utils/helpers';

export interface WaterTrackingPreferences {
  id: string;
  daily_goal_ml: number;
  wake_up_time: string; // Format: "HH:mm" (e.g., "06:00")
  sleep_time: string; // Format: "HH:mm" (e.g., "22:00")
  reminder_interval_minutes: number;
  reminders_enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Default water goal based on common recommendations (8-10 cups = 2000-2500ml)
 */
export const DEFAULT_WATER_GOAL_ML = 2500;

/**
 * Create or get water tracking preferences
 */
export async function getOrCreateWaterPreferences(): Promise<WaterTrackingPreferences> {
  const db = getDatabase();
  
  // Try to get existing preferences
  const existing = await db.getFirstAsync<any>(
    'SELECT * FROM water_tracking_preferences LIMIT 1'
  );

  if (existing) {
    return {
      ...existing,
      reminders_enabled: Boolean(existing.reminders_enabled),
    };
  }

  // Create new default preferences
  const id = generateId();
  const now = new Date().toISOString();
  const defaults = {
    daily_goal_ml: DEFAULT_WATER_GOAL_ML,
    wake_up_time: '06:00',
    sleep_time: '22:00',
    reminder_interval_minutes: 120, // Every 2 hours
    reminders_enabled: true,
  };

  await db.runAsync(
    `INSERT INTO water_tracking_preferences 
     (id, daily_goal_ml, wake_up_time, sleep_time, reminder_interval_minutes, reminders_enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      defaults.daily_goal_ml,
      defaults.wake_up_time,
      defaults.sleep_time,
      defaults.reminder_interval_minutes,
      defaults.reminders_enabled ? 1 : 0,
      now,
      now,
    ]
  );

  return {
    id,
    ...defaults,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Update water tracking preferences
 */
export async function updateWaterPreferences(
  updates: Partial<Omit<WaterTrackingPreferences, 'id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const db = getDatabase();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.daily_goal_ml !== undefined) {
    fields.push('daily_goal_ml = ?');
    values.push(updates.daily_goal_ml);
  }
  if (updates.wake_up_time !== undefined) {
    fields.push('wake_up_time = ?');
    values.push(updates.wake_up_time);
  }
  if (updates.sleep_time !== undefined) {
    fields.push('sleep_time = ?');
    values.push(updates.sleep_time);
  }
  if (updates.reminder_interval_minutes !== undefined) {
    fields.push('reminder_interval_minutes = ?');
    values.push(updates.reminder_interval_minutes);
  }
  if (updates.reminders_enabled !== undefined) {
    fields.push('reminders_enabled = ?');
    values.push(updates.reminders_enabled ? 1 : 0);
  }

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  values.push(now);

  await db.runAsync(
    `UPDATE water_tracking_preferences SET ${fields.join(', ')}`,
    values
  );
}

/**
 * Get daily water goal in ml
 */
export async function getDailyWaterGoal(): Promise<number> {
  const prefs = await getOrCreateWaterPreferences();
  return prefs.daily_goal_ml;
}

/**
 * Toggle reminders on/off
 */
export async function toggleReminders(enabled: boolean): Promise<void> {
  await updateWaterPreferences({ reminders_enabled: enabled });
}

/**
 * Check if reminders are enabled
 */
export async function areRemindersEnabled(): Promise<boolean> {
  const prefs = await getOrCreateWaterPreferences();
  return prefs.reminders_enabled;
}

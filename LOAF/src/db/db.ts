import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  try {
    db = await SQLite.openDatabaseAsync('loaf.db');
    await createTables();
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

async function createTables(): Promise<void> {
  if (!db) throw new Error('Database not initialized');

  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id TEXT PRIMARY KEY,
        age INTEGER,
        gender TEXT,
        height_cm REAL,
        weight_kg REAL,
        diet_type TEXT,
        active_goals TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS meal_logs (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        food_id TEXT NOT NULL,
        food_name TEXT NOT NULL,
        portion_label TEXT,
        portion_grams REAL,
        calories INTEGER,
        protein REAL,
        carbs REAL,
        fat REAL,
        fiber REAL,
        iron REAL,
        calcium REAL,
        vitamin_d_ug REAL,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS custom_foods (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        calories REAL,
        protein REAL,
        carbs REAL,
        fat REAL,
        fiber REAL,
        weight_grams REAL,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS water_logs (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        amount_ml REAL,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS daily_nutrition_summary (
        date TEXT PRIMARY KEY,
        calories INTEGER,
        protein REAL,
        carbs REAL,
        fat REAL,
        fiber REAL,
        iron REAL,
        calcium REAL,
        vitamin_d_ug REAL,
        water_ml REAL,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS water_tracking_preferences (
        id TEXT PRIMARY KEY,
        daily_goal_ml INTEGER,
        wake_up_time TEXT,
        sleep_time TEXT,
        reminder_interval_minutes INTEGER,
        reminders_enabled INTEGER,
        created_at TEXT,
        updated_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_meal_logs_date ON meal_logs(date);
      CREATE INDEX IF NOT EXISTS idx_water_logs_date ON water_logs(date);
    `);
  } catch (error) {
    console.error('Table creation error:', error);
    throw error;
  }
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized. Call initializeDatabase() first.');
  return db;
}

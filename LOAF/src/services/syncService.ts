import { syncMealsToSupabase, loadMealsFromSupabase } from '../db/mealRepo';
import { syncSummariesToSupabase, loadSummariesFromSupabase } from '../db/summaryRepo';
import { syncWaterLogsToSupabase, loadWaterLogsFromSupabase } from '../db/waterRepo';
import { syncWaterPreferencesToSupabase, loadWaterPreferencesFromSupabase } from '../db/waterPreferencesRepo';

export async function syncAllDataToSupabase(userId: string): Promise<void> {
  try {
    console.log('Starting sync to Supabase...');
    await Promise.all([
      syncMealsToSupabase(userId),
      syncSummariesToSupabase(userId),
      syncWaterLogsToSupabase(userId),
      syncWaterPreferencesToSupabase(userId),
    ]);
    console.log('Sync to Supabase completed.');
  } catch (error) {
    console.error('Error syncing data to Supabase:', error);
  }
}

export async function loadAllDataFromSupabase(userId: string): Promise<void> {
  try {
    console.log('Starting load from Supabase...');
    await Promise.all([
      loadMealsFromSupabase(userId),
      loadSummariesFromSupabase(userId),
      loadWaterLogsFromSupabase(userId),
      loadWaterPreferencesFromSupabase(userId),
    ]);
    console.log('Load from Supabase completed.');
  } catch (error) {
    console.error('Error loading data from Supabase:', error);
  }
}

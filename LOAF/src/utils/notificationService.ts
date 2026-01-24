import * as Notifications from 'expo-notifications';
import { getOrCreateWaterPreferences } from '../db/waterPreferencesRepo';

/**
 * Configure notification handling
 * This runs when app is in foreground and a notification is received
 */
export async function configureNotificationHandler(): Promise<void> {
  // Handle notifications when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Request permissions (required for iOS)
  await requestNotificationPermissions();
}

/**
 * Request user permission for notifications
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { granted } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowCriticalAlerts: false,
      },
    });
    return granted;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export async function isNotificationEnabled(): Promise<boolean> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    return settings.granted;
  } catch (error) {
    console.error('Error checking notification status:', error);
    return false;
  }
}

/**
 * Get time between wake and sleep in minutes
 */
function getActiveHoursInMinutes(wakeTime: string, sleepTime: string): number {
  const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
  const [sleepHour, sleepMin] = sleepTime.split(':').map(Number);

  const wakeMinutes = wakeHour * 60 + wakeMin;
  const sleepMinutes = sleepHour * 60 + sleepMin;

  if (sleepMinutes > wakeMinutes) {
    return sleepMinutes - wakeMinutes;
  } else {
    // Sleep time is next day
    return 24 * 60 - wakeMinutes + sleepMinutes;
  }
}

/**
 * Calculate reminder times for the day
 * Splits reminders evenly throughout waking hours
 */
function calculateReminderTimes(
  wakeTime: string,
  sleepTime: string,
  intervalMinutes: number
): string[] {
  const times: string[] = [];
  const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);

  let currentMinutes = wakeHour * 60 + wakeMin;
  const endMinutes = calculateEndTime(wakeTime, sleepTime);

  while (currentMinutes < endMinutes) {
    const hour = Math.floor(currentMinutes / 60) % 24;
    const min = currentMinutes % 60;
    times.push(`${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
    currentMinutes += intervalMinutes;
  }

  return times;
}

/**
 * Calculate end time in minutes for the day
 */
function calculateEndTime(wakeTime: string, sleepTime: string): number {
  const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
  const [sleepHour, sleepMin] = sleepTime.split(':').map(Number);

  const wakeMinutes = wakeHour * 60 + wakeMin;
  const sleepMinutes = sleepHour * 60 + sleepMin;

  if (sleepMinutes > wakeMinutes) {
    return sleepMinutes;
  } else {
    return 24 * 60 + sleepMinutes;
  }
}

/**
 * Time string to minutes since midnight
 */
function timeToMinutes(timeStr: string): number {
  const [hour, min] = timeStr.split(':').map(Number);
  return hour * 60 + min;
}

/**
 * Schedule water reminder notifications for the entire day
 * Respects wake-up and sleep times for gentle reminders
 */
export async function scheduleWaterReminders(): Promise<void> {
  try {
    // Cancel all existing water reminders
    await Notifications.cancelAllScheduledNotificationsAsync();

    const prefs = await getOrCreateWaterPreferences();

    if (!prefs.reminders_enabled) {
      return;
    }

    const isEnabled = await isNotificationEnabled();
    if (!isEnabled) {
      console.warn('Notifications not enabled. Skipping water reminder scheduling.');
      return;
    }

    const reminderTimes = calculateReminderTimes(
      prefs.wake_up_time,
      prefs.sleep_time,
      prefs.reminder_interval_minutes
    );

    const today = new Date();

    for (const timeStr of reminderTimes) {
      const [hour, minute] = timeStr.split(':').map(Number);

      // Create trigger for this specific time today
      const triggerDate = new Date(today);
      triggerDate.setHours(hour, minute, 0, 0);

      // If this time has already passed today, schedule for tomorrow
      if (triggerDate < today) {
        triggerDate.setDate(triggerDate.getDate() + 1);
      }

      const secondsUntilTrigger = Math.floor((triggerDate.getTime() - Date.now()) / 1000);

      if (secondsUntilTrigger > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '💧 Time to hydrate!',
            body: 'Remember to drink water and stay hydrated',
            sound: 'default',
            priority: 'default',
            data: {
              type: 'water_reminder',
              timestamp: new Date().toISOString(),
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: secondsUntilTrigger,
            repeats: true, // Repeats daily
          },
        });
      }
    }

    console.log(`✅ Scheduled ${reminderTimes.length} water reminders`);
  } catch (error) {
    console.error('Error scheduling water reminders:', error);
  }
}

/**
 * Send immediate water reminder
 */
export async function sendImmediateWaterReminder(): Promise<void> {
  try {
    const isEnabled = await isNotificationEnabled();
    if (!isEnabled) {
      console.warn('Notifications not enabled');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Drink some water!',
        body: 'You\'re doing great. Keep up the hydration!',
        sound: 'default',
        priority: 'default',
        data: {
          type: 'water_manual_reminder',
          timestamp: new Date().toISOString(),
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      }, // Send immediately
    });
  } catch (error) {
    console.error('Error sending immediate water reminder:', error);
  }
}

/**
 * Clear all scheduled reminders
 */
export async function clearAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All reminders cleared');
  } catch (error) {
    console.error('Error clearing reminders:', error);
  }
}

/**
 * Reschedule reminders (call after preferences change)
 */
export async function rescheduleReminders(): Promise<void> {
  await clearAllReminders();
  await scheduleWaterReminders();
}

/**
 * Get scheduled notifications
 */
export async function getScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled reminders:', error);
    return [];
  }
}

/**
 * Convert seconds to minutes
 */
export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}

/**
 * Format time string (HH:mm)
 */
export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Parse time string to hours and minutes
 */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
}

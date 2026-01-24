import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
  Switch,
} from 'react-native';
import { logWater, getTodayWaterTotal, getWaterForDate } from '../db/waterRepo';
import {
  getOrCreateWaterPreferences,
  updateWaterPreferences,
  getDailyWaterGoal,
} from '../db/waterPreferencesRepo';
import { todayDate } from '../utils/helpers';
import { sendImmediateWaterReminder, rescheduleReminders } from '../utils/notificationService';
import { COLORS } from '../context/ThemeContext';

const QUICK_ADD_AMOUNTS = [250, 500, 750]; // ml

export function WaterTrackingScreen(): React.ReactElement {
  const [todayTotal, setTodayTotal] = useState<number>(0);
  const [dailyGoal, setDailyGoal] = useState<number>(2500);
  const [waterLogs, setWaterLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<any | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showPreferences, setShowPreferences] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const today = todayDate();

      // Load water intake for today
      const total = await getTodayWaterTotal();
      setTodayTotal(total);

      // Load all logs for today
      const logs = await getWaterForDate(today);
      setWaterLogs(logs.reverse()); // Most recent first

      // Load preferences and goal
      const prefs = await getOrCreateWaterPreferences();
      setPreferences(prefs);
      setDailyGoal(prefs.daily_goal_ml);
    } catch (error) {
      console.error('Error loading water data:', error);
      Alert.alert('Error', 'Failed to load water tracking data');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQuickAdd = useCallback(
    async (amount: number) => {
      try {
        await logWater(amount);
        await loadData(); // Refresh data
      } catch (error) {
        console.error('Error logging water:', error);
        Alert.alert('Error', 'Failed to log water intake');
      }
    },
    []
  );

  const handleCustomAdd = useCallback(async () => {
    const amount = parseInt(customAmount, 10);

    if (!customAmount || isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number greater than 0');
      return;
    }

    if (amount > 5000) {
      Alert.alert('Warning', 'That seems like a lot! Are you sure?', [
        { text: 'Cancel' },
        {
          text: 'Yes, Add It',
          onPress: async () => {
            try {
              await logWater(amount);
              setCustomAmount('');
              await loadData();
            } catch (error) {
              console.error('Error logging water:', error);
              Alert.alert('Error', 'Failed to log water intake');
            }
          },
        },
      ]);
    } else {
      try {
        await logWater(amount);
        setCustomAmount('');
        await loadData();
      } catch (error) {
        console.error('Error logging water:', error);
        Alert.alert('Error', 'Failed to log water intake');
      }
    }
  }, [customAmount]);

  const handleGoalChange = useCallback(
    async (newGoal: string) => {
      const goal = parseInt(newGoal, 10);
      if (!isNaN(goal) && goal > 0) {
        try {
          await updateWaterPreferences({ daily_goal_ml: goal });
          setDailyGoal(goal);
          await loadData();
        } catch (error) {
          console.error('Error updating goal:', error);
          Alert.alert('Error', 'Failed to update daily goal');
        }
      }
    },
    []
  );

  const handleWakeTimeChange = useCallback(
    async (newTime: string) => {
      try {
        await updateWaterPreferences({ wake_up_time: newTime });
        await rescheduleReminders();
        await loadData();
      } catch (error) {
        console.error('Error updating wake time:', error);
      }
    },
    []
  );

  const handleSleepTimeChange = useCallback(
    async (newTime: string) => {
      try {
        await updateWaterPreferences({ sleep_time: newTime });
        await rescheduleReminders();
        await loadData();
      } catch (error) {
        console.error('Error updating sleep time:', error);
      }
    },
    []
  );

  const handleRemindersToggle = useCallback(
    async (enabled: boolean) => {
      try {
        await updateWaterPreferences({ reminders_enabled: enabled });
        if (enabled) {
          await rescheduleReminders();
        }
        await loadData();
      } catch (error) {
        console.error('Error toggling reminders:', error);
      }
    },
    []
  );

  const handleTestReminder = useCallback(async () => {
    try {
      await sendImmediateWaterReminder();
      Alert.alert('Success', 'Test reminder sent!');
    } catch (error) {
      console.error('Error sending test reminder:', error);
      Alert.alert('Error', 'Failed to send test reminder');
    }
  }, []);

  const progressPercentage = Math.min((todayTotal / dailyGoal) * 100, 100);
  const progressColor = progressPercentage >= 100 ? COLORS.success : COLORS.accent;
  const remainingWater = Math.max(dailyGoal - todayTotal, 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading water data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>💧 Water Tracking</Text>
          <Text style={styles.subtitle}>Stay hydrated throughout the day</Text>
        </View>

        {/* Progress Circle Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressCircleContainer}>
            <View style={[styles.progressCircle, { borderColor: progressColor }]}>
              <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
          </View>

          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Today</Text>
              <Text style={styles.statValue}>{todayTotal} ml</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Goal</Text>
              <Text style={styles.statValue}>{dailyGoal} ml</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={[styles.statValue, { color: COLORS.accent }]}>
                {remainingWater} ml
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: progressColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressBarLabel}>
            {progressPercentage >= 100
              ? '✨ Goal achieved! Keep it up!'
              : `${remainingWater} ml to go`}
          </Text>
        </View>

        {/* Quick Add Buttons */}
        <View style={styles.quickAddSection}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddButtons}>
            {QUICK_ADD_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.quickAddButton}
                onPress={() => handleQuickAdd(amount)}
              >
                <Text style={styles.quickAddButtonText}>{amount}ml</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Amount */}
        <View style={styles.customSection}>
          <Text style={styles.sectionTitle}>Custom Amount</Text>
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              placeholder="Enter ml"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="number-pad"
              value={customAmount}
              onChangeText={setCustomAmount}
              maxLength={4}
            />
            <TouchableOpacity
              style={[styles.addButton, { flex: 1, marginLeft: 10 }]}
              onPress={handleCustomAdd}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Logs */}
        <View style={styles.logsSection}>
          <Text style={styles.sectionTitle}>Today's Logs</Text>
          {waterLogs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No water logged yet today</Text>
              <Text style={styles.emptySubtext}>Start by clicking a quick add button above</Text>
            </View>
          ) : (
            waterLogs.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View style={styles.logContent}>
                  <Text style={styles.logAmount}>{log.amount_ml} ml</Text>
                  <Text style={styles.logTime}>
                    {new Date(log.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={styles.logIcon}>💧</Text>
              </View>
            ))
          )}
        </View>

        {/* Preferences Section */}
        <TouchableOpacity
          style={styles.preferencesHeader}
          onPress={() => setShowPreferences(!showPreferences)}
        >
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>
          <Text style={styles.toggleArrow}>{showPreferences ? '▼' : '▶'}</Text>
        </TouchableOpacity>

        {showPreferences && preferences && (
          <View style={styles.preferencesSection}>
            {/* Daily Goal */}
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Daily Goal (ml)</Text>
              <TextInput
                style={styles.preferenceInput}
                placeholder="Enter goal"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="number-pad"
                value={dailyGoal.toString()}
                onChangeText={handleGoalChange}
                maxLength={4}
              />
            </View>

            {/* Wake Up Time */}
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Wake Up Time</Text>
              <TextInput
                style={styles.preferenceInput}
                placeholder="HH:mm"
                placeholderTextColor={COLORS.textSecondary}
                defaultValue={preferences.wake_up_time}
                onEndEditing={(e) => handleWakeTimeChange(e.nativeEvent.text)}
                maxLength={5}
              />
            </View>

            {/* Sleep Time */}
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Sleep Time</Text>
              <TextInput
                style={styles.preferenceInput}
                placeholder="HH:mm"
                placeholderTextColor={COLORS.textSecondary}
                defaultValue={preferences.sleep_time}
                onEndEditing={(e) => handleSleepTimeChange(e.nativeEvent.text)}
                maxLength={5}
              />
            </View>

            {/* Reminder Interval */}
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Reminder Interval (minutes)</Text>
              <TextInput
                style={styles.preferenceInput}
                placeholder="Minutes"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="number-pad"
                defaultValue={preferences.reminder_interval_minutes.toString()}
                onEndEditing={(e) =>
                  updateWaterPreferences({
                    reminder_interval_minutes: parseInt(e.nativeEvent.text, 10),
                  }).then(() => rescheduleReminders())
                }
                maxLength={3}
              />
            </View>

            {/* Reminders Toggle */}
            <View style={styles.reminderToggle}>
              <Text style={styles.preferenceLabel}>Enable Reminders</Text>
              <Switch
                value={preferences.reminders_enabled}
                onValueChange={handleRemindersToggle}
                trackColor={{ false: '#767577', true: COLORS.accent }}
                thumbColor={preferences.reminders_enabled ? COLORS.success : '#f4f3f4'}
              />
            </View>

            {/* Test Reminder Button */}
            <TouchableOpacity style={styles.testButton} onPress={handleTestReminder}>
              <Text style={styles.testButtonText}>📢 Send Test Reminder</Text>
            </TouchableOpacity>

            <Text style={styles.preferencesNote}>
              💡 Reminders will be sent between wake-up and sleep times at your chosen interval.
              They're gentle and respect your schedule.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textPrimary,
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  progressCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#222222',
  },
  progressCircleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: COLORS.accent,
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#333333',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#333333',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  progressBarLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  quickAddSection: {
    marginBottom: 20,
  },
  quickAddButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  quickAddButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  customSection: {
    marginBottom: 20,
  },
  customInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: '#333333',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  logsSection: {
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    opacity: 0.7,
  },
  logItem: {
    backgroundColor: '#111111',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  logContent: {
    flex: 1,
  },
  logAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  logTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  logIcon: {
    fontSize: 18,
    marginLeft: 12,
  },
  preferencesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 10,
  },
  toggleArrow: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  preferencesSection: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 16,
  },
  preferenceItem: {
    marginBottom: 12,
  },
  preferenceLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  preferenceInput: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: '#333333',
    fontSize: 14,
  },
  reminderToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 6,
  },
  testButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  preferencesNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 8,
  },
});

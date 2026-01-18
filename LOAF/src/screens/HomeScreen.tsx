import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../context/ThemeContext';
import { getTodayWaterTotal } from '../db/waterRepo';
import { getTodaySummary } from '../db/summaryRepo';
import { getUserProfile } from '../db/userRepo';
import { ensureFitnessPermissions, getTodayFitnessSummary, isAuthorized, GOOGLE_CLIENT_ID } from '../services/fitness';

export function HomeScreen(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [todayWater, setTodayWater] = useState(0);
  const [todayNutrition, setTodayNutrition] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [fitness, setFitness] = useState<{ steps: number; activeMinutes: number } | null>(null);
  const [fitAuth, setFitAuth] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load user profile
      const profile = await getUserProfile();
      setUserProfile(profile);

      // Load water
      const water = await getTodayWaterTotal();
      setTodayWater(water);

      // Load nutrition summary
      const nutrition = await getTodaySummary();
      setTodayNutrition(nutrition);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    // Try fetching fitness if authorized
    (async () => {
      if (isAuthorized()) {
        const summary = await getTodayFitnessSummary();
        setFitness(summary);
        setFitAuth(true);
      }
    })();
  }, []);

  const handleConnectGoogleFit = useCallback(async () => {
    const ok = await ensureFitnessPermissions();
    setFitAuth(ok);
    if (ok) {
      const summary = await getTodayFitnessSummary();
      setFitness(summary);
    }
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Welcome, {userProfile?.name || 'User'}!
          </Text>
          <Text style={styles.subtitle}>Here's your daily overview</Text>
        </View>

        {/* Water Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>💧 Water Intake</Text>
            <Text style={styles.cardValue}>{todayWater} ml</Text>
          </View>
          <View style={styles.cardBar}>
            <View
              style={[
                styles.cardBarFill,
                {
                  width: `${Math.min((todayWater / 2500) * 100, 100)}%`,
                  backgroundColor:
                    todayWater >= 2500 ? COLORS.success : COLORS.accent,
                },
              ]}
            />
          </View>
          <Text style={styles.cardSubtext}>Goal: 2500 ml</Text>
        </View>

        {/* Nutrition Card */}
        {todayNutrition && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>🍽️ Nutrition Today</Text>
              <Text style={styles.cardValue}>
                {Math.round(todayNutrition.calories || 0)} kcal
              </Text>
            </View>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Protein</Text>
                <Text style={styles.nutritionValue}>
                  {Math.round(todayNutrition.protein || 0)}g
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Carbs</Text>
                <Text style={styles.nutritionValue}>
                  {Math.round(todayNutrition.carbs || 0)}g
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Fat</Text>
                <Text style={styles.nutritionValue}>
                  {Math.round(todayNutrition.fat || 0)}g
                </Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Fiber</Text>
                <Text style={styles.nutritionValue}>
                  {Math.round(todayNutrition.fiber || 0)}g
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Activity Summary (Google Fit) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🏃 Activity Today</Text>
            {!fitAuth && (
              <TouchableOpacity onPress={handleConnectGoogleFit}>
                <Text style={{ color: COLORS.accent }}>Connect Google Fit</Text>
              </TouchableOpacity>
            )}
          </View>
          {fitness ? (
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Steps</Text>
                <Text style={styles.nutritionValue}>{fitness.steps}</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Active Minutes</Text>
                <Text style={styles.nutritionValue}>{fitness.activeMinutes}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.cardSubtext}>
              {fitAuth ? 'No activity data yet' : 'Grant permission to view activity'}
            </Text>
          )}
          <Text style={styles.cardSubtext}>
            Used to adjust calorie context only. No gamification or ranking.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📝 Log Food</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>💧 Log Water</Text>
          </TouchableOpacity>
        </View>
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
  card: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accent,
  },
  cardBar: {
    height: 10,
    backgroundColor: '#333333',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  cardBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  cardSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  actionButtonText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

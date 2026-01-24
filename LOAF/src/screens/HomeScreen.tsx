import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../context/ThemeContext';
import { getTodayWaterTotal } from '../db/waterRepo';
import { getTodaySummary } from '../db/summaryRepo';
import { getUserProfile } from '../db/userRepo';
import { getMealsForDate, MealLog } from '../db/mealRepo';
import { ensureFitnessPermissions, getTodayFitnessSummary, isAuthorized, GOOGLE_CLIENT_ID } from '../services/fitness';
import { buildAIContext } from '../utils/aiContextBuilder';
import { getFoodSuggestions } from '../services/ai/openRouterClient';

interface AISuggestion {
  food: string;
  reason: string;
}

interface AIResponse {
  suggestions: AISuggestion[];
  hydrationTip: string;
}

export function HomeScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { width } = Dimensions.get('window');

  const [loading, setLoading] = useState(true);
  const [todayWater, setTodayWater] = useState(0);
  const [todayNutrition, setTodayNutrition] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [fitness, setFitness] = useState<{ steps: number; activeMinutes: number } | null>(null);
  const [fitAuth, setFitAuth] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<AIResponse | null>(null);
  const [todayMeals, setTodayMeals] = useState<MealLog[]>([]);

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

      // Load today's meals
      const todayDate = new Date().toISOString().split('T')[0];
      const meals = await getMealsForDate(todayDate);
      setTodayMeals(meals);

      // Load AI suggestions
      try {
        const context = await buildAIContext();
        const suggestions = await getFoodSuggestions(context);
        setAiSuggestions(suggestions);
      } catch (aiError) {
        console.error('AI loading error:', aiError);
        setAiSuggestions(null);
      }
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: insets.bottom + 20 }
        ]}
      >
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="water" size={20} color={COLORS.accent} style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Water Intake</Text>
            </View>
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="restaurant" size={20} color={COLORS.accent} style={{ marginRight: 8 }} />
                <Text style={styles.cardTitle}>Nutrition Today</Text>
              </View>
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

        {/* Today's Meals */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📝 Today's Meals</Text>
          </View>
          {todayMeals.length > 0 ? (
            <View style={styles.mealsList}>
              {todayMeals.map((meal) => (
                <View key={meal.id} style={styles.mealItem}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealName}>{meal.food_name}</Text>
                    <Text style={styles.mealCalories}>{Math.round(meal.calories)} kcal</Text>
                  </View>
                  <Text style={styles.mealDetails}>
                    {meal.portion_label} ({meal.portion_grams}g)
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.cardSubtext}>No meals logged today yet.</Text>
          )}
        </View>

        {/* Activity Summary (Google Fit) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="fitness" size={20} color={COLORS.accent} style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Activity Today</Text>
            </View>
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

        {/* AI Suggestions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="bulb" size={20} color={COLORS.accent} style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>AI Suggestions for Today</Text>
            </View>
          </View>
          {aiSuggestions ? (
            <View>
              {aiSuggestions.suggestions.slice(0, 3).map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <Text style={styles.suggestionFood}>{suggestion.food}</Text>
                  <Text style={styles.suggestionReason}>{suggestion.reason}</Text>
                </View>
              ))}
              <Text style={styles.hydrationTip}>{aiSuggestions.hydrationTip}</Text>
            </View>
          ) : (
            <Text style={styles.cardSubtext}>
              Based on your goals, consider foods rich in fiber and protein today.
            </Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('LogFood')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="add-circle" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.actionButtonText}>Log Food</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate('Water')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="water" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.actionButtonText}>Log Water</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: '5%',
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#222222',
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 10,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  suggestionItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
  },
  suggestionFood: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  suggestionReason: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  hydrationTip: {
    fontSize: 14,
    color: COLORS.accent,
    fontStyle: 'italic',
    marginTop: 8,
  },
  mealsList: {
    marginTop: 8,
  },
  mealItem: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.accent,
  },
  mealDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

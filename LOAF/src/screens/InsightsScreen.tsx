import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { COLORS } from '../context/ThemeContext';
import { getTotalWaterForDate } from '../db/waterRepo';
import { formatDate } from '../utils/helpers';
import { getTodayFitnessSummary, ensureFitnessPermissions } from '../services/fitness';

export function InsightsScreen(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [waterToday, setWaterToday] = useState(0);
  const [nutrients, setNutrients] = useState<{ label: string; value: number; target: number; unit: string }[]>([]);
  const [activity, setActivity] = useState<{ steps: number; activeMinutes: number } | null>(null);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    setLoading(true);
    try {
      const dateStr = formatDate(new Date());
      const water = await getTotalWaterForDate(dateStr);
      setWaterToday(water || 0);

      const exampleNutrients = [
        { label: 'Protein', value: 42, target: 50, unit: 'g' },
        { label: 'Fiber', value: 18, target: 25, unit: 'g' },
        { label: 'Iron', value: 9, target: 14, unit: 'mg' },
        { label: 'Vitamin C', value: 55, target: 75, unit: 'mg' },
      ];
      setNutrients(exampleNutrients);

      try {
        await ensureFitnessPermissions();
        const summary = await getTodayFitnessSummary();
        if (summary) setActivity({ steps: summary.steps || 0, activeMinutes: summary.activeMinutes || 0 });
      } catch {
        setActivity(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading today’s summary…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>Today’s overview for awareness</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily nutrients</Text>
          {nutrients.map((n, idx) => (
            <View key={idx} style={styles.metricBlock}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>{n.label}</Text>
                <Text style={styles.metricValue}>{n.value} {n.unit}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min((n.value / n.target) * 100, 100)}%`, backgroundColor: COLORS.accent }]} />
              </View>
              <Text style={styles.metricTarget}>Target: {n.target} {n.unit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Water intake</Text>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Today</Text>
            <Text style={styles.metricValue}>{waterToday} ml</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min((waterToday / 2500) * 100, 100)}%`, backgroundColor: COLORS.accent }]} />
          </View>
          <Text style={styles.metricTarget}>Reference: 2500 ml</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activity summary</Text>
          <View style={styles.metricBlock}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Steps</Text>
              <Text style={styles.metricValue}>{activity?.steps ?? 0}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(((activity?.steps ?? 0) / 8000) * 100, 100)}%`, backgroundColor: COLORS.accent }]} />
            </View>
            <Text style={styles.metricTarget}>Reference: 8,000</Text>
          </View>
          <View style={styles.metricBlock}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Active minutes</Text>
              <Text style={styles.metricValue}>{activity?.activeMinutes ?? 0}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(((activity?.activeMinutes ?? 0) / 30) * 100, 100)}%`, backgroundColor: COLORS.accent }]} />
            </View>
            <Text style={styles.metricTarget}>Reference: 30</Text>
          </View>
          {!activity && (
            <Text style={styles.explainer}>Connect activity to see today’s steps and active minutes.</Text>
          )}
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
    paddingBottom: 24,
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
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  metricBlock: {
    marginBottom: 10,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  metricValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  metricTarget: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  explainer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});

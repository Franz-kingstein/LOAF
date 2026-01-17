import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../context/ThemeContext';
import { getTotalWaterForDate } from '../db/waterRepo';
import { todayDate, formatDate, parseDate } from '../utils/helpers';

export function InsightsScreen(): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const data = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date);
        const water = await getTotalWaterForDate(dateStr);

        data.push({
          date: dateStr,
          day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
          water,
        });
      }

      setWeeklyData(data);
    } catch (error) {
      console.error('Error loading weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const avgWater = weeklyData.length
    ? Math.round(weeklyData.reduce((sum, d) => sum + d.water, 0) / weeklyData.length)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📊 Weekly Insights</Text>
          <Text style={styles.subtitle}>Your 7-day overview</Text>
        </View>

        {/* Water Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💧 Water Intake</Text>
          <Text style={styles.statLabel}>Weekly Average</Text>
          <Text style={styles.statValue}>{avgWater} ml</Text>

          {/* Weekly Chart */}
          <View style={styles.chartContainer}>
            {weeklyData.map((item, index) => {
              const maxWater = 3000;
              const height = (item.water / maxWater) * 150;

              return (
                <View key={index} style={styles.chartItem}>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height,
                        backgroundColor:
                          item.water >= 2500 ? COLORS.success : COLORS.accent,
                      },
                    ]}
                  />
                  <Text style={styles.chartLabel}>{item.day}</Text>
                  <Text style={styles.chartValue}>{item.water}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Daily Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Daily Breakdown</Text>
          {weeklyData.map((item, index) => (
            <View key={index} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownDay}>{item.day}</Text>
                <Text style={styles.breakdownDate}>{item.date}</Text>
              </View>
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.breakdownBarFill,
                    {
                      width: `${Math.min((item.water / 2500) * 100, 100)}%`,
                      backgroundColor:
                        item.water >= 2500 ? COLORS.success : COLORS.accent,
                    },
                  ]}
                />
              </View>
              <Text style={styles.breakdownValue}>{item.water} ml / 2500 ml</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Days Met Goal:</Text>
            <Text style={styles.summaryValue}>
              {weeklyData.filter((d) => d.water >= 2500).length}/7
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Water:</Text>
            <Text style={styles.summaryValue}>
              {weeklyData.reduce((sum, d) => sum + d.water, 0)} ml
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Highest Day:</Text>
            <Text style={styles.summaryValue}>
              {Math.max(...weeklyData.map((d) => d.water))} ml
            </Text>
          </View>
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingVertical: 16,
  },
  chartItem: {
    alignItems: 'center',
  },
  chartBar: {
    width: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  chartValue: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  breakdownItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownDay: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  breakdownDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  breakdownBar: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

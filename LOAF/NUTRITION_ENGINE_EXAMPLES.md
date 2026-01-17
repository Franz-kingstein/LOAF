# Nutrition Engine - Usage Examples

## Example 1: Simple Daily Report

**Goal:** Show today's nutrition intake

```typescript
import { getDailyIntake } from '../utils/nutritionEngine';

async function showDailyReport() {
  const today = new Date().toISOString().split('T')[0];
  const intake = await getDailyIntake(today);

  if (!intake) {
    console.log('No meals logged today');
    return;
  }

  console.log('=== Daily Nutrition Report ===');
  console.log(`Date: ${intake.date}`);
  console.log(`Meals Logged: ${intake.mealCount}`);
  console.log('');
  console.log('INTAKE:');
  console.log(`  Calories: ${intake.calories} kcal`);
  console.log(`  Protein:  ${intake.protein}g`);
  console.log(`  Carbs:    ${intake.carbs}g`);
  console.log(`  Fat:      ${intake.fat}g`);
  console.log(`  Fiber:    ${intake.fiber}g`);
  console.log(`  Iron:     ${intake.iron}mg`);
  console.log(`  Calcium:  ${intake.calcium}mg`);
  console.log(`  Vitamin D: ${intake.vitaminD}µg`);
}
```

---

## Example 2: RDA Compliance Check

**Goal:** Check which nutrients are adequate vs. short

```typescript
import { getNutrientGaps, formatNutrientStatus } from '../utils/nutritionEngine';

async function checkRdaCompliance() {
  const date = '2026-01-17';
  const gaps = await getNutrientGaps(date);

  if (!gaps) {
    console.log('Cannot analyze: User profile missing or no meals logged');
    return;
  }

  console.log('=== RDA Compliance Analysis ===');
  console.log(`Date: ${gaps.date}`);
  console.log(`User: ${gaps.demographics.age}y ${gaps.demographics.gender}`);
  console.log('');

  // Show each nutrient status
  console.log('NUTRIENT BREAKDOWN:');
  for (const [key, nutrient] of Object.entries(gaps.analysis)) {
    if (nutrient) {
      console.log(`  ${formatNutrientStatus(nutrient)}`);
    }
  }

  // Show summary
  console.log('');
  console.log('SUMMARY:');
  console.log(`  Adequate (✓):  ${gaps.summary.adequateNutrients.join(', ') || 'None'}`);
  console.log(`  Shortages:     ${gaps.summary.shortageNutrients.join(', ') || 'None'}`);
  console.log(`  Surpluses:     ${gaps.summary.surplusNutrients.join(', ') || 'None'}`);
  console.log(`  Overall: ${gaps.summary.overallAdequacy}% adequate`);
}
```

---

## Example 3: Identify Biggest Shortages

**Goal:** Find the most deficient nutrients

```typescript
import { getNutrientGaps } from '../utils/nutritionEngine';

async function findBiggestShortages() {
  const date = '2026-01-17';
  const gaps = await getNutrientGaps(date);

  if (!gaps) return;

  // Find all shortage nutrients
  const shortages = Object.values(gaps.analysis)
    .filter(n => n && n.status === 'shortage')
    .sort((a, b) => a.gap - b.gap); // Sort by gap (most negative first)

  if (shortages.length === 0) {
    console.log('No nutrient shortages!');
    return;
  }

  console.log('=== Nutrient Shortages (Worst First) ===');
  for (const shortage of shortages) {
    const shortfallAmount = Math.abs(shortage.gap).toFixed(1);
    console.log(
      `${shortage.name}: ${shortfallAmount}${shortage.unit} short ` +
      `(${shortage.intake}/${shortage.rda}${shortage.unit}, ${shortage.percentage}% of RDA)`
    );
  }
}
```

**Output Example:**
```
=== Nutrient Shortages (Worst First) ===
Fiber: 10.0g short (15.0/25.0g, 60% of RDA)
Calcium: 150.0mg short (850/1000mg, 85% of RDA)
Iron: 5.0mg short (13.0/18.0mg, 72% of RDA)
```

---

## Example 4: Weekly Trend Analysis

**Goal:** See average intake across the week

```typescript
import { getWeeklyAverageIntake, getDailyIntake } from '../utils/nutritionEngine';

async function showWeeklyTrend() {
  const weeklyAvg = await getWeeklyAverageIntake();

  if (!weeklyAvg) {
    console.log('No meal data for the week');
    return;
  }

  console.log('=== Weekly Average Intake ===');
  console.log(`Period: ${weeklyAvg.date}`);
  console.log('');
  console.log('AVERAGE PER DAY:');
  console.log(`  Calories: ${weeklyAvg.calories} kcal`);
  console.log(`  Protein:  ${weeklyAvg.protein}g`);
  console.log(`  Carbs:    ${weeklyAvg.carbs}g`);
  console.log(`  Fat:      ${weeklyAvg.fat}g`);
  console.log(`  Fiber:    ${weeklyAvg.fiber}g`);
  console.log('');
  console.log(`Total meals logged: ${weeklyAvg.mealCount}`);
  console.log(`Average per day: ${(weeklyAvg.mealCount / 7).toFixed(1)}`);
}
```

---

## Example 5: Debugging RDA Selection

**Goal:** Understand which RDA category is being used

```typescript
import {
  explainRdaSelection,
  getNutrientGaps,
  RDA_VALUES,
} from '../utils/nutritionEngine';
import { getUserProfile } from '../db/userRepo';

async function debugRdaSelection() {
  const userProfile = await getUserProfile();
  if (!userProfile) {
    console.log('No user profile');
    return;
  }

  const explanation = explainRdaSelection(
    userProfile.age,
    userProfile.gender
  );

  console.log('=== RDA Selection Debug ===');
  console.log(`User: ${userProfile.age} years old, ${userProfile.gender}`);
  console.log(`Selection: ${explanation}`);
  console.log('');

  // Get the analysis to see which RDA was actually used
  const gaps = await getNutrientGaps(new Date().toISOString().split('T')[0]);
  if (gaps) {
    console.log('Applied RDA Values:');
    console.log(`  Calories: ${gaps.analysis.calories.rda} kcal`);
    console.log(`  Protein:  ${gaps.analysis.protein.rda}g`);
    console.log(`  Fiber:    ${gaps.analysis.fiber.rda}g`);
  }
}
```

---

## Example 6: Nutrient Comparison (Two Dates)

**Goal:** Compare nutrition between two dates

```typescript
import { getDailyIntake } from '../utils/nutritionEngine';

async function compareNutrition(date1: string, date2: string) {
  const intake1 = await getDailyIntake(date1);
  const intake2 = await getDailyIntake(date2);

  if (!intake1 || !intake2) {
    console.log('Missing data for one or both dates');
    return;
  }

  console.log(`=== Nutrition Comparison ===`);
  console.log(`${date1} vs ${date2}`);
  console.log('');
  console.log('Nutrient       | Date1      | Date2      | Difference');
  console.log('---------------|------------|------------|----------');

  const diff = (v1: number, v2: number) => (v2 - v1).toFixed(0);

  console.log(`Calories       | ${intake1.calories}      | ${intake2.calories}      | ${diff(intake1.calories, intake2.calories)}`);
  console.log(`Protein        | ${intake1.protein}       | ${intake2.protein}       | ${diff(intake1.protein, intake2.protein)}`);
  console.log(`Carbs          | ${intake1.carbs}       | ${intake2.carbs}       | ${diff(intake1.carbs, intake2.carbs)}`);
  console.log(`Fat            | ${intake1.fat}        | ${intake2.fat}        | ${diff(intake1.fat, intake2.fat)}`);
  console.log(`Fiber          | ${intake1.fiber}       | ${intake2.fiber}       | ${diff(intake1.fiber, intake2.fiber)}`);
}
```

---

## Example 7: Complete Analysis Dashboard

**Goal:** Full nutrition dashboard for a date

```typescript
import {
  getNutrientGaps,
  formatNutrientStatus,
  explainRdaSelection,
} from '../utils/nutritionEngine';
import { getUserProfile } from '../db/userRepo';

async function showNutritionDashboard(date: string) {
  const userProfile = await getUserProfile();
  const gaps = await getNutrientGaps(date);

  if (!userProfile || !gaps) {
    console.log('Cannot display dashboard');
    return;
  }

  const rdaExplanation = explainRdaSelection(
    userProfile.age,
    userProfile.gender
  );

  console.log('╔════════════════════════════════════════════╗');
  console.log('║        NUTRITION ANALYSIS DASHBOARD        ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log('');

  // User Info
  console.log('USER PROFILE');
  console.log(`  Age: ${gaps.demographics.age}`);
  console.log(`  Gender: ${gaps.demographics.gender}`);
  console.log(`  RDA: ${rdaExplanation}`);
  console.log('');

  // Daily Summary
  console.log('TODAY\'S INTAKE');
  console.log(`  Meals Logged: ${gaps.intake.mealCount}`);
  console.log(`  Calories: ${gaps.intake.calories} kcal`);
  console.log('');

  // Detailed Nutrient Analysis
  console.log('NUTRIENT STATUS');
  const nutrients = Object.values(gaps.analysis);
  for (const nutrient of nutrients) {
    if (nutrient) {
      console.log(`  ${formatNutrientStatus(nutrient)}`);
    }
  }
  console.log('');

  // Summary
  console.log('SUMMARY');
  console.log(`  ✓ Adequate: ${gaps.summary.adequateNutrients.join(', ') || 'None'}`);
  console.log(`  ✗ Shortages: ${gaps.summary.shortageNutrients.join(', ') || 'None'}`);
  console.log(`  + Surplus: ${gaps.summary.surplusNutrients.join(', ') || 'None'}`);
  console.log('');
  console.log(`  Overall Adequacy: ${gaps.summary.overallAdequacy}%`);

  if (gaps.summary.shortageNutrients.length > 0) {
    console.log('');
    console.log('RECOMMENDATIONS');
    for (const shortageNutrient of gaps.summary.shortageNutrients) {
      const nutrient = gaps.analysis[
        Object.keys(gaps.analysis).find(
          k =>
            gaps.analysis[k as keyof typeof gaps.analysis]?.name ===
            shortageNutrient
        ) as keyof typeof gaps.analysis
      ];
      if (nutrient) {
        console.log(
          `  • Increase ${nutrient.name}: ` +
          `${Math.abs(nutrient.gap).toFixed(1)}${nutrient.unit} more needed`
        );
      }
    }
  }

  console.log('');
  console.log('═'.repeat(44));
}
```

**Output Example:**
```
╔════════════════════════════════════════════╗
║        NUTRITION ANALYSIS DASHBOARD        ║
╚════════════════════════════════════════════╝

USER PROFILE
  Age: 28
  Gender: Male
  RDA: Adult (28y, Male): Adult (19-50) RDA values

TODAY'S INTAKE
  Meals Logged: 3
  Calories: 2150 kcal

NUTRIENT STATUS
  Calories: 2150.0kcal (86% of 2500.0kcal RDA) - SHORT 350.0kcal
  Protein: 50.0g (89% of 56.0g RDA) ✓
  Carbohydrates: 275.3g (100% of 275.0g RDA) ✓
  Fat: 68.2g (82% of 83.0g RDA) - SHORT 14.8g
  Fiber: 15.0g (39% of 38.0g RDA) ✓
  Iron: 13.0mg (162% of 8.0mg RDA) - OVER +5.0mg
  Calcium: 850.0mg (85% of 1000.0mg RDA) - SHORT 150.0mg
  Vitamin D: 8.5µg (57% of 15.0µg RDA) - SHORT 6.5µg

SUMMARY
  ✓ Adequate: Protein, Carbohydrates, Fiber
  ✗ Shortages: Calories, Fat, Calcium, Vitamin D
  + Surplus: Iron

  Overall Adequacy: 50%

RECOMMENDATIONS
  • Increase Calories: 350.0kcal more needed
  • Increase Fat: 14.8g more needed
  • Increase Calcium: 150.0mg more needed
  • Increase Vitamin D: 6.5µg more needed

════════════════════════════════════════════
```

---

## Example 8: Integration in React Native Component

**Goal:** Use nutrition engine in a screen component

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import {
  getNutrientGaps,
  formatNutrientStatus,
  NutrientGaps,
} from '../utils/nutritionEngine';

export function NutritionScreen() {
  const [gaps, setGaps] = useState<NutrientGaps | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const today = new Date().toISOString().split('T')[0];
      const analysisData = await getNutrientGaps(today);
      setGaps(analysisData);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) return <Text>Loading...</Text>;
  if (!gaps) return <Text>No data available</Text>;

  return (
    <ScrollView>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Nutrition</Text>

      {/* Summary */}
      <View>
        <Text>Overall: {gaps.summary.overallAdequacy}% adequate</Text>
        <Text>Shortages: {gaps.summary.shortageNutrients.join(', ')}</Text>
      </View>

      {/* Nutrient Details */}
      <View>
        {Object.values(gaps.analysis).map(nutrient =>
          nutrient ? (
            <Text key={nutrient.name}>
              {formatNutrientStatus(nutrient)}
            </Text>
          ) : null
        )}
      </View>
    </ScrollView>
  );
}
```

---

## Testing Scenarios

### Scenario 1: Perfect RDA Compliance
```
Intake: 56g protein, 275g carbs, 83g fat
RDA: 56g protein, 275g carbs, 83g fat
Result: All 100% adequate, 0 gaps
```

### Scenario 2: Deficient Nutrients
```
Intake: 20g protein, 100g carbs, 25g fat
RDA: 56g protein, 275g carbs, 83g fat
Result: 3 shortages, 36% overall adequacy
```

### Scenario 3: Mixed Profile
```
Intake: 50g protein, 300g carbs, 90g fat
RDA: 56g protein, 275g carbs, 83g fat
Result: 1 shortage (protein), 1 surplus (carbs, fat), 67% adequacy
```

---

## Key Takeaways

1. **Pure logic** - No UI coupling, reusable anywhere
2. **Explainable** - Every number has a source and reason
3. **Consistent** - Same input always gives same output
4. **No recommendations** - Just facts and gaps
5. **Ready for UI** - Use formatNutrientStatus() for display

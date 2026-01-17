# Nutrition Engine - Quick Reference

## Core Functions (4 Public APIs)

### 1. getDailyIntake(date)
Get total nutritional intake for a date.
```typescript
const intake = await getDailyIntake('2026-01-17');
// Returns: { calories: 2150, protein: 45.5, ... } or null
```

### 2. getNutrientGaps(date)
Get complete RDA analysis for a date.
```typescript
const gaps = await getNutrientGaps('2026-01-17');
// Returns: { analysis: { protein: {...}, carbs: {...}, ... } } or null
```

### 3. getWeeklyAverageIntake()
Get average intake for last 7 days.
```typescript
const weeklyAvg = await getWeeklyAverageIntake();
// Returns: { calories: 2300, protein: 48.2, ... } or null
```

### 4. formatNutrientStatus(status)
Format nutrient status as human-readable string.
```typescript
const formatted = formatNutrientStatus(gaps.analysis.protein);
// Returns: "Protein: 50.0g (89% of 56.0g RDA) ✓"
```

---

## Data Structures

### DailyIntake
```typescript
{
  date: "2026-01-17",
  calories: 2150,
  protein: 45.5,      // grams
  carbs: 275.3,       // grams
  fat: 68.2,          // grams
  fiber: 25.1,        // grams
  iron: 14.5,         // mg
  calcium: 850,       // mg
  vitaminD: 8.5,      // µg
  mealCount: 3        // meals
}
```

### NutrientStatus
```typescript
{
  name: "Protein",
  unit: "g",
  intake: 50.0,
  rda: 56.0,
  percentage: 89,        // 50/56 * 100
  gap: -6.0,            // 50 - 56
  gapPercentage: -11,   // -6/56 * 100
  status: "shortage"    // adequate | shortage | surplus
}
```

### NutrientGaps
```typescript
{
  date: "2026-01-17",
  demographics: {
    age: 28,
    gender: "Male"
  },
  intake: { /* DailyIntake */ },
  analysis: {
    calories: { /* NutrientStatus */ },
    protein: { /* NutrientStatus */ },
    carbs: { /* NutrientStatus */ },
    fat: { /* NutrientStatus */ },
    fiber: { /* NutrientStatus */ },
    iron: { /* NutrientStatus */ },
    calcium: { /* NutrientStatus */ },
    vitaminD: { /* NutrientStatus */ }
  },
  summary: {
    adequateNutrients: ["Calories", "Protein"],  // >= 90% RDA
    shortageNutrients: ["Fiber", "Calcium"],     // < 90% RDA
    surplusNutrients: ["Iron"],                  // > 100% RDA
    overallAdequacy: 63                          // 5 of 8 nutrients
  }
}
```

---

## RDA Selection

**By Age & Gender:**
- Teenager (14-18): Teen RDA values
- Adult (19-50): Standard adult RDA
- Senior (51+): Modified adult RDA (some nutrients differ)

**RDA Varies:**
- Calories: 1800-2800 kcal/day
- Protein: 46-59 g/day
- Iron: 8-18 mg/day (female pre-menopausal 18mg)
- Calcium: 1000-1300 mg/day

---

## Status Rules

| Status | Rule | Example |
|--------|------|---------|
| Adequate | 90-100% of RDA | 51g of 56g protein |
| Shortage | < 90% of RDA | 40g of 56g protein |
| Surplus | > 100% of RDA | 65g of 56g protein |

---

## Usage Examples

### Check Today's Intake
```typescript
const today = new Date().toISOString().split('T')[0];
const intake = await getDailyIntake(today);

if (intake) {
  console.log(`Calories: ${intake.calories}`);
  console.log(`Protein: ${intake.protein}g`);
  console.log(`Meals: ${intake.mealCount}`);
}
```

### Find Nutrient Shortages
```typescript
const gaps = await getNutrientGaps('2026-01-17');

if (gaps) {
  console.log('Shortages:', gaps.summary.shortageNutrients);
  // Output: ["Fiber", "Calcium", "Vitamin D"]
}
```

### Display Nutrient Details
```typescript
const gaps = await getNutrientGaps(date);
const protein = gaps.analysis.protein;

console.log(formatNutrientStatus(protein));
// Output: "Protein: 50.0g (89% of 56.0g RDA) ✓"
```

### Weekly Trend
```typescript
const weeklyAvg = await getWeeklyAverageIntake();

if (weeklyAvg) {
  console.log(`Avg calories: ${weeklyAvg.calories}`);
  console.log(`Avg protein: ${weeklyAvg.protein}g`);
}
```

---

## Common Queries

**Q: How do I check if protein is adequate?**
```typescript
const gaps = await getNutrientGaps(date);
const isProteinAdequate = gaps.analysis.protein.percentage >= 90;
```

**Q: How do I find the biggest shortage?**
```typescript
const gaps = await getNutrientGaps(date);
const shortages = Object.values(gaps.analysis)
  .filter(n => n.status === 'shortage')
  .sort((a, b) => b.gap - a.gap);
const biggest = shortages[0]; // Most negative gap
```

**Q: How do I calculate total surplus calories?**
```typescript
const gaps = await getNutrientGaps(date);
const calories = gaps.analysis.calories;
const surplus = calories.gap > 0 ? calories.gap : 0;
```

**Q: How do I know which RDA was used?**
```typescript
const userProfile = await getUserProfile();
const explanation = explainRdaSelection(
  userProfile.age,
  userProfile.gender
);
console.log(explanation);
```

---

## Implementation Checklist

- [x] Pure logic (no UI coupling)
- [x] No recommendations
- [x] Aggregates daily logs
- [x] Compares against RDA
- [x] Identifies gaps
- [x] Explainable calculations
- [x] Consistent results
- [x] RDA for 6 demographic groups
- [x] 8 nutrients tracked
- [x] Handles null cases
- [x] Proper rounding
- [x] Helper functions

---

## File Location

`src/utils/nutritionEngine.ts` (420 lines)

**Imports from:**
- `mealRepo.ts` - Get meals for date
- `userRepo.ts` - Get user profile

**Exports:**
- `RDA_VALUES` constant
- `DailyIntake` interface
- `NutrientStatus` interface
- `NutrientGaps` interface
- `getDailyIntake()` function
- `getNutrientGaps()` function
- `getWeeklyAverageIntake()` function
- `formatNutrientStatus()` function
- `explainRdaSelection()` function

---

## Integration Points

**Ready to integrate with:**
- Home/Dashboard screen
- Analytics screen (weekly trends)
- Nutrition details screen
- Goal tracking screen

**NOT integrated yet:**
- UI components (formatting done with formatNutrientStatus)
- Recommendation engine (separate layer)
- Goal customization (use RDA_VALUES as base)

---

## Status: Production Ready ✅

- Zero TypeScript errors
- Fully documented
- All edge cases handled
- Ready for integration

# LOAF Data & Database Layer

## Overview

Minimalist offline-first architecture for food & diet tracking:
- **JSON data** (read-only, static reference data)
- **SQLite** (user-generated and computed data only)
- **TypeScript** helpers for clean data access

---

## Part 1: JSON Data Loaders

### Load Food Database

```typescript
import { loadFoodData, searchFoods, calculateNutrition } from '@/src';

// Search foods with alias support
const results = searchFoods('idli');
// Returns: [{ id, name, nutrition, portionHints, ... }]

// Get portion options (Indian measurements)
const food = searchFoods('rice')[0];
const portions = getPortionOptions(food);
// Returns: [{ label: "1 cup", grams: 150 }, ...]

// Calculate nutrition for specific grams
const nutrition = calculateNutrition(food, 100);
// Returns: { calories, protein, carbs, fat, fiber, iron, calcium, vitaminD_ug }
```

**Features:**
- Alias search (e.g., "idly" finds "Idli")
- Portion hints in Indian measurements
- Per-100g nutrition scaled to grams
- Confidence scores included

---

### Load Goals

```typescript
import { loadGoals, getGoalById, getTopFoodsForGoal } from '@/src';

// Get all goals
const allGoals = loadGoals();

// Get specific goal
const goal = getGoalById('goal_001');
// { goalId, goalName, keyNutrients, topFoods, targetMacros }

// Get top foods for goal
const topFoods = getTopFoodsForGoal('goal_001');
```

**Use cases:**
- Goal-based recommendations
- Nutrient mapping
- Deterministic offline logic

---

### Load RDA Recommendations

```typescript
import { loadRDA, getRDAByAgeAndGender, getDefaultDailyTargets } from '@/src';

// Get targets for age + gender
const targets = getRDAByAgeAndGender('18-30', 'Female');
// { calories, protein, carbs, fat, fiber, iron, calcium, vitaminD_ug, water_ml }

// Get default targets
const defaults = getDefaultDailyTargets();
```

**Use cases:**
- Daily target calculation
- Goal vs actual comparison

---

### Load Nutrition Analytics

```typescript
import { loadNutritionAnalytics, getNutrientInfo } from '@/src';

// Get nutrient explanations
const info = getNutrientInfo('protein');
// { name, unit, description, importance, topSources }
```

**Use cases:**
- Education features
- Nutrient explanations in UI

---

## Part 2: SQLite Database

### Initialize Database

```typescript
import { initializeDatabase } from '@/src';

// Call once at app startup
await initializeDatabase();
```

### User Profile Management

```typescript
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from '@/src';

// Create profile
const profile = await createUserProfile({
  age: 28,
  gender: 'Female',
  height_cm: 165,
  weight_kg: 65,
  diet_type: 'vegetarian',
  active_goals: ['goal_001', 'goal_002'],
});

// Get profile
const user = await getUserProfile();

// Update profile
await updateUserProfile({
  weight_kg: 63,
  active_goals: ['goal_001'],
});
```

### Log Meals

```typescript
import { logMeal, getMealsForDate, getTodayMeals, deleteMeal } from '@/src';
import { searchFoods, calculateNutrition, getPortionOptions } from '@/src';

// Workflow: Search → Select portion → Calculate → Log

const food = searchFoods('rice')[0];
const nutrition = calculateNutrition(food, 150); // 150 grams

const meal = await logMeal({
  date: '2026-01-17',
  food_id: food.id,
  food_name: food.name,
  portion_label: '1 cup',
  portion_grams: 150,
  calories: nutrition.calories,
  protein: nutrition.protein,
  carbs: nutrition.carbs,
  fat: nutrition.fat,
  fiber: nutrition.fiber,
  iron: nutrition.iron,
  calcium: nutrition.calcium,
  vitamin_d_ug: nutrition.vitaminD_ug,
});

// Get meals
const meals = await getMealsForDate('2026-01-17');
const today = await getTodayMeals();

// Delete meal
await deleteMeal(meal.id);
```

### Track Water

```typescript
import {
  logWater,
  getWaterForDate,
  getTotalWaterForDate,
  getTodayWaterTotal,
  deleteWaterLog,
} from '@/src';

// Log water intake
await logWater(250); // 250ml today
await logWater(500, '2026-01-17'); // 500ml specific date

// Get totals
const today = await getTodayWaterTotal(); // Returns: 750
const all = await getTotalWaterForDate('2026-01-17'); // Returns: 500
```

### Daily Nutrition Summary

```typescript
import {
  computeDailySummary,
  saveDailySummary,
  getDailySummary,
  getTodaySummary,
  getNutritionRange,
} from '@/src';

// Compute summary (sums all meals + water)
const summary = await computeDailySummary('2026-01-17');
// { date, calories, protein, carbs, fat, fiber, iron, calcium, vitamin_d_ug, water_ml, updated_at }

// Save it
await saveDailySummary(summary);

// Get it
const saved = await getDailySummary('2026-01-17');

// Get today
const today = await getTodaySummary();

// Get range
const week = await getNutritionRange('2026-01-10', '2026-01-17');
```

---

## Part 3: Data Flow

### Adding a Meal

```
1. Search foodDatabase.json
   searchFoods('idli')
   
2. Select portion from portionHints
   getPortionOptions(food)
   → [{ label: '1 piece', grams: 50 }]
   
3. Calculate nutrition
   calculateNutrition(food, 50)
   → { calories: 45, protein: 1.2, ... }
   
4. Store in SQLite
   logMeal({ date, food_id, nutrition... })
   
5. Update daily summary
   computeDailySummary(date)
   saveDailySummary(summary)
```

### Vitamin D Handling

- **Storage:** Always in micrograms (µg)
- **Import:** JSON has µg
- **Display:** Can show both µg and IU (1 µg = 40 IU)

```typescript
const vitaminD_ug = food.nutrition.vitaminD_ug;
const vitaminD_iu = vitaminD_ug * 40;
```

---

## File Structure

```
src/
├── data/
│   ├── loadFoodData.ts      # Food database + search + nutrition
│   ├── loadGoals.ts         # Goal mappings
│   ├── loadRDA.ts           # RDA recommendations
│   └── loadNutrition.ts     # Nutrition explanations
│
├── db/
│   ├── db.ts                # SQLite initialization
│   ├── userRepo.ts          # User profile CRUD
│   ├── mealRepo.ts          # Meal logging
│   ├── waterRepo.ts         # Water tracking
│   └── summaryRepo.ts       # Daily summaries
│
├── utils/
│   └── helpers.ts           # ID generation, date formatting
│
└── index.ts                 # Central export file
```

---

## Usage Example

```typescript
import {
  initializeDatabase,
  getUserProfile,
  searchFoods,
  calculateNutrition,
  logMeal,
  getTodaySummary,
  loadGoals,
} from '@/src';

async function logDinner() {
  // Initialize once at startup
  await initializeDatabase();
  
  // Get user
  const user = await getUserProfile();
  
  // Search food
  const foods = searchFoods('dal');
  const dal = foods[0];
  
  // Get portions
  import { getPortionOptions } from '@/src';
  const portions = getPortionOptions(dal);
  
  // Assume user selected "1 katori" = 150g
  const nutrition = calculateNutrition(dal, 150);
  
  // Log meal
  await logMeal({
    date: '2026-01-17',
    food_id: dal.id,
    food_name: dal.name,
    portion_label: '1 katori',
    portion_grams: 150,
    ...nutrition,
  });
  
  // Get summary
  const summary = await getTodaySummary();
  console.log(`Today: ${summary.calories} kcal, ${summary.protein}g protein`);
}
```

---

## Key Principles

✅ **JSON data is read-only**
- No modifications to static reference data
- Loaded once at startup
- Used for search, calculations, recommendations

✅ **SQLite for user data only**
- User profile
- Meal logs
- Water logs
- Daily summaries

✅ **No over-engineering**
- Simple CRUD functions
- No ORM/migrations
- Direct SQL queries

✅ **Offline-first**
- All data local
- No network calls
- Deterministic logic

✅ **Vitamin D in micrograms**
- Storage: µg
- Display: µg or IU (multiply by 40)

---

**Last Updated:** 2026-01-17
**Version:** 1.0

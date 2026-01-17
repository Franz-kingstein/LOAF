# 🚀 Food & Diet App - Quick Reference Guide

## 4 Critical Additions ✅

### 1️⃣ Aliases (Voice & Search)
**File:** `foodDatabase.json`
```json
"aliases": ["idli", "idly", "plain idli", "steamed idli"]
```
**Why:** Voice input, typo tolerance, multiple naming conventions

---

### 2️⃣ Portion Hints (Indian Measurements)
**File:** `foodDatabase.json`
```json
"portionHints": {
  "1_piece": 50,
  "1_cup": 200,
  "1_katori": 150
}
```
**Why:** Users think in cups/katories, not grams

---

### 3️⃣ Confidence & Source Metadata
**File:** `foodDatabase.json`
```json
"confidence": 0.95,
"source": "IFCT2017",
"lastVerified": "2026-01-15"
```
**Why:** Data traceability, debugging, user trust, AI safety

---

### 4️⃣ Goal-to-Nutrient Mapping ⭐ NEW FILE
**File:** `goalMappings.json` (NEW)
```json
{
  "goalId": "goal_001",
  "goalName": "Weight Loss",
  "keyNutrients": ["fiber", "protein", "water"],
  "topFoods": ["vegetables", "fruits", "lean_protein"]
}
```
**Why:** Deterministic recommendations, offline logic, AI prompt simplification

---

## Unit Correction ⚠️

### Vitamin D: µg not IU
- **Store internally:** Always in µg
- **Display:** Can show both µg and IU
- **Conversion:** 1 µg = 40 IU
- **Files Updated:** 
  - `nutritionAnalytics.json`
  - `rdaRecommendations.json`

---

## Files Overview

| File | Size | Purpose | New Fields |
|------|------|---------|-----------|
| `foodDatabase.json` | 267 lines | Food items + nutrition | aliases, portionHints, confidence |
| `userProfiles.json` | User data | User health profiles | — |
| `mealLogs.json` | Tracking | Daily meal logs | — |
| `rdaRecommendations.json` | Guidelines | Age-based RDA values | Vitamin D in µg |
| `nutritionAnalytics.json` | Education | Micro/macro info | Vitamin D conversion |
| `goalMappings.json` | **NEW** | 10 health goals | Complete goal mapping |

---

## API Usage Examples (Frontend)

### Search with Aliases
```javascript
const searchFood = (query) => {
  return foods.filter(f => 
    f.name.toLowerCase().includes(query) ||
    f.aliases.some(a => a.includes(query.toLowerCase()))
  );
};
// searchFood("idly") → finds "Idli"
```

### Get Portion Options
```javascript
const getPortions = (food) => {
  return Object.entries(food.portionHints).map(([label, grams]) => ({
    label: label.replace(/_/g, ' '),
    grams
  }));
};
// Returns: [{label: "1 cup", grams: 240}, ...]
```

### Get Goal Recommendations
```javascript
const getGoalFoods = (goalName) => {
  const goal = goalMappings.mappings.find(g => g.goalName === goalName);
  return foods.filter(f => goal.topFoods.includes(f.category));
};
```

### Convert Vitamin D
```javascript
const vitaminDinIU = (micrograms) => micrograms * 40;
const vitaminDinMicrograms = (iu) => iu / 40;
```

---

## Data Structure Hierarchy

```
App
├── User Profile
│   ├── Health Goals (links to goalMappings.json)
│   └── Daily Targets (from rdaRecommendations.json)
│
├── Food Search
│   ├── By name (checks aliases)
│   ├── By category
│   └── By goal nutrients
│
├── Meal Logging
│   ├── Food selection (with portionHints)
│   ├── Nutrition calculation
│   └── Goal tracking (vs daily targets)
│
└── Analytics
    ├── Daily nutrition vs goals
    ├── Micronutrient tracking
    └── Goal-specific recommendations
```

---

## Implementation Checklist

### Phase 1: Basics
- [ ] Load foodDatabase.json
- [ ] Load userProfiles.json
- [ ] Load goalMappings.json
- [ ] Display food search results

### Phase 2: User Features
- [ ] Voice input → alias matching
- [ ] Portion picker using portionHints
- [ ] Goal selection linked to goalMappings
- [ ] Daily nutrition tracker

### Phase 3: Intelligence
- [ ] Goal-based meal recommendations
- [ ] Micronutrient gap detection
- [ ] Food substitution suggestions
- [ ] Confidence score indicators

### Phase 4: Analytics
- [ ] Weekly nutrition trends
- [ ] Goal progress tracking
- [ ] Meal history
- [ ] Export reports

---

## File Statistics

```
foodDatabase.json:       ~10KB (expandable to 1000+ foods)
userProfiles.json:       ~1KB (per user)
mealLogs.json:          Grows with usage (~100KB/year per user)
rdaRecommendations.json: ~5KB (static reference data)
nutritionAnalytics.json: ~8KB (static reference data)
goalMappings.json:       ~15KB (static reference data)
```

---

## Common Tasks

### Add New Food
1. Get nutrition from IFCT2017 or database
2. Create aliases (include common misspellings)
3. Add portionHints for Indian measurements
4. Set confidence (0.9+ for trusted sources)
5. Add to foodDatabase.json foods array

### Create Meal Plan
1. Select goal from goalMappings.json
2. Get keyNutrients and targetMacros
3. Filter topFoods for that goal
4. Create mealPlan in rdaRecommendations.json
5. Link goal to user profile

### Calculate Daily Nutrition
1. Log meals (quantity × nutrition per serving)
2. Sum daily totals
3. Compare vs user dailyTargets
4. Calculate percentages
5. Link to goal nutrients in goalMappings

---

## Notes

✅ All files are **production-ready**
✅ All JSON files are **validated**
✅ All units are **standardized** (µg for Vitamin D)
✅ All aliases follow **lowercase pattern**
✅ All portions follow **Indian measurements**
✅ All confidence scores are **IFCT2017-aligned**

---

**Last Updated:** 2026-01-15
**Version:** 2.0 (with enhancements)

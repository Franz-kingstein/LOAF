# Project File Structure - Clean & Organized

## Directory Tree

```
LOAF (Root)
│
├── 📋 Configuration Files
│   ├── App.tsx                              Main app entry point
│   ├── app.json                             Expo configuration
│   ├── tsconfig.json                        TypeScript configuration
│   ├── package.json                         Dependencies
│   ├── package-lock.json                    Locked versions
│   └── .gitignore                           Git ignore rules
│
├── 📚 Documentation (5 active docs)
│   ├── README.md                            Main project overview
│   ├── QUICK_START.md                       Quick start guide
│   ├── NUTRITION_ENGINE.md                  Nutrition engine docs
│   ├── NUTRITION_ENGINE_QUICK_REF.md        Function reference
│   ├── NUTRITION_ENGINE_EXAMPLES.md         Usage examples
│   ├── NUTRITION_ENGINE_VERIFICATION.md     Verification report
│   ├── CLEANUP_PLAN.md                      Cleanup documentation
│   └── CLEANUP_COMPLETE.md                  Cleanup completion report
│
├── 🎨 Assets (Images & Icons)
│   └── assets/
│       ├── icon.png
│       ├── splash-icon.png
│       ├── adaptive-icon.png
│       ├── favicon.png
│       └── Logo.webp
│
├── 💾 Dependencies
│   ├── node_modules/                        (npm packages)
│   └── .expo/                               (Expo cache)
│
└── 📁 src/ (Main Source Code)
    │
    ├── 🎯 Components
    │   └── components/
    │       └── OnboardingGate.tsx            Onboarding wrapper component
    │
    ├── 📱 Screens (Active)
    │   └── screens/
    │       ├── LogFoodScreen.tsx             ✅ Food logging UI (295 lines)
    │       ├── OnboardingScreen.tsx          ✅ User profile setup
    │       └── [Future screens will go here]
    │           ├── HomeScreen.tsx           (To be built)
    │           ├── InsightsScreen.tsx       (To be built)
    │           ├── WaterScreen.tsx          (To be built)
    │           └── SettingsScreen.tsx       (To be built)
    │
    ├── 💾 Database Layer (5 repos)
    │   └── db/
    │       ├── db.ts                        ✅ SQLite initialization
    │       ├── userRepo.ts                  ✅ User profile CRUD
    │       ├── mealRepo.ts                  ✅ Meal logs CRUD
    │       ├── waterRepo.ts                 ✅ Water tracking CRUD
    │       └── summaryRepo.ts               ✅ Summary statistics
    │
    ├── 🔧 Utilities (3 modules)
    │   └── utils/
    │       ├── nutritionEngine.ts           ✅ RDA analysis (434 lines)
    │       ├── foodSearch.ts                ✅ Food database search
    │       └── helpers.ts                   ✅ Helper functions
    │
    ├── 🪝 Custom Hooks
    │   └── hooks/
    │       └── useOnboarding.ts             ✅ Onboarding state
    │
    ├── 📊 Data Loaders (4 modules)
    │   └── data/
    │       ├── loadFoodData.ts              ✅ Load food CSV → SQLite
    │       ├── loadRDA.ts                   ✅ Load RDA values
    │       ├── loadNutrition.ts             ✅ Load nutrition data
    │       └── loadGoals.ts                 ✅ Load goal mappings
    │
    └── 📍 Index
        └── index.ts                         ✅ DB initialization entry
```

---

## File Count Summary

### Active Source Code: 18 files
```
✅ Screens:        2 files  (LogFoodScreen, OnboardingScreen)
✅ Database:       5 files  (db, user, meal, water, summary repos)
✅ Utilities:      3 files  (nutritionEngine, foodSearch, helpers)
✅ Hooks:          1 file   (useOnboarding)
✅ Components:     1 file   (OnboardingGate)
✅ Data Loaders:   4 files  (loadFoodData, loadRDA, loadNutrition, loadGoals)
✅ Index:          1 file   (db initialization)
```

### Configuration Files: 6 files
```
✅ App.tsx
✅ app.json
✅ tsconfig.json
✅ package.json
✅ package-lock.json
✅ .gitignore
```

### Documentation: 8 files
```
✅ README.md
✅ QUICK_START.md
✅ NUTRITION_ENGINE.md
✅ NUTRITION_ENGINE_QUICK_REF.md
✅ NUTRITION_ENGINE_EXAMPLES.md
✅ NUTRITION_ENGINE_VERIFICATION.md
✅ CLEANUP_PLAN.md
✅ CLEANUP_COMPLETE.md
```

### Assets: 5 files
```
✅ icon.png
✅ splash-icon.png
✅ adaptive-icon.png
✅ favicon.png
✅ Logo.webp
```

**Total Active Files: 37 files (+ dependencies)**

---

## What Was Deleted

### Duplicate/Old Folders (8 removed)
```
❌ screens/            → Moved to src/screens/
❌ services/           → Replaced by db layer
❌ navigation/         → Replaced by App.tsx
❌ constants/          → Consolidated
❌ context/            → Removed (unused)
❌ app/                → Old Expo Router structure
❌ examples/           → Moved to docs/examples
❌ (old) data/         → Removed mock data
```

### Old Documentation (14 removed)
```
❌ BUILD_COMPLETE.md
❌ BUILD_STATUS_LOG_FOOD.md
❌ COLOR_PALETTE_AUDIT.md
❌ DATA_LAYER_GUIDE.md
❌ DEPLOYMENT_CHECKLIST.md
❌ DOCUMENTATION_INDEX.md
❌ FOOD_DATABASE_GUIDE.md
❌ FOOD_INTEGRATION_SUMMARY.md
❌ FOOD_QUICK_REFERENCE.md
❌ ICONS_GUIDE.md
❌ LOG_FOOD_CODE_REFERENCE.md
❌ LOG_FOOD_IMPLEMENTATION.md
❌ LOG_FOOD_SCREEN.md
❌ LOG_FOOD_VISUAL_GUIDE.md
```

### Mock Data Files (6 removed)
```
❌ data/foodDatabase.json
❌ data/goalMappings.json
❌ data/mealLogs.json
❌ data/nutritionAnalytics.json
❌ data/rdaRecommendations.json
❌ data/userProfiles.json
```

### Old Code Files (5 removed)
```
❌ screens/MealLoggingScreen.js
❌ services/mealLoggingService.js
❌ examples/mealLoggingExamples.js
❌ index.js (old entry point)
❌ src/screens/LogFoodScreenNew.tsx (duplicate)
```

**Total Deleted: ~40+ files and 8 folders**

---

## Active Features by Location

### 🍽️ Food Logging
```
Files:
  - src/screens/LogFoodScreen.tsx        (UI - 295 lines)
  - src/utils/foodSearch.ts              (Search API)
  - src/db/mealRepo.ts                   (Database)
  - src/data/loadFoodData.ts             (2,843 foods loaded)

Flow:
  User enters food name → Search API finds food → Selects quantity → 
  Saves to database → Aggregates in nutrition engine
```

### 📊 Nutrition Analysis
```
Files:
  - src/utils/nutritionEngine.ts         (Core engine - 434 lines)
  - src/db/userRepo.ts                   (RDA selection by demographics)
  - src/db/mealRepo.ts                   (Meal aggregation)

Features:
  - Daily intake aggregation
  - RDA comparison (6 demographic groups)
  - Nutrient gap identification
  - Weekly averaging
  - Pure logic (no UI coupling)
```

### 👤 User Management
```
Files:
  - src/screens/OnboardingScreen.tsx      (Profile creation)
  - src/db/userRepo.ts                    (Profile storage)
  - src/hooks/useOnboarding.ts            (State management)
  - src/components/OnboardingGate.tsx     (Wrapper)

Features:
  - Age + gender collection
  - RDA category selection
  - Profile persistence
```

### 💧 Water Tracking
```
Files:
  - src/db/waterRepo.ts                   (Water logs)

Status: Ready for UI screen
```

### 📈 Analytics (Future)
```
Screens to build:
  - src/screens/HomeScreen.tsx            (Daily summary)
  - src/screens/InsightsScreen.tsx        (Weekly trends)

Will use:
  - src/utils/nutritionEngine.ts
  - src/db/mealRepo.ts
  - src/db/userRepo.ts
```

---

## Development Workflow

### Adding a New Feature

```
1. Create screen component
   └── src/screens/NewFeatureScreen.tsx

2. Create database repository (if needed)
   └── src/db/newFeatureRepo.ts

3. Create utilities (if needed)
   └── src/utils/newFeatureUtils.ts

4. Create custom hooks (if needed)
   └── src/hooks/useNewFeature.ts

5. Update App.tsx with new tab/screen

6. Done! ✅
```

### Adding a Utility Function

```
1. Determine category
   ├── Pure logic         → src/utils/
   ├── Database access    → src/db/
   ├── React specific     → src/hooks/
   └── Component logic    → src/components/

2. Create or update file
   └── Add your function

3. Export from index if needed
   └── Update src/index.ts

4. Done! ✅
```

---

## Import Paths Reference

### Common Imports

```typescript
// Components
import { OnboardingGate } from './src/components/OnboardingGate';

// Screens
import { LogFoodScreen } from './src/screens/LogFoodScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';

// Database
import { getUserProfile } from './src/db/userRepo';
import { getMealsForDate } from './src/db/mealRepo';
import { getWaterIntake } from './src/db/waterRepo';

// Utilities
import { getDailyIntake, getNutrientGaps } from './src/utils/nutritionEngine';
import { searchFood, calculatePortion } from './src/utils/foodSearch';

// Hooks
import { useOnboarding } from './src/hooks/useOnboarding';

// Data Loaders
import { initializeDatabase } from './src/index';
```

---

## Next Phase: Screen Development

### Screens to Build
```
📱 src/screens/HomeScreen.tsx
   Purpose: Daily nutrition summary
   Uses: getNutrientGaps(), getDailyIntake()
   Status: Not started

📱 src/screens/InsightsScreen.tsx
   Purpose: Weekly trends and analytics
   Uses: getWeeklyAverageIntake()
   Status: Not started

📱 src/screens/WaterScreen.tsx
   Purpose: Water tracking
   Uses: getWaterIntake(), addWaterLog()
   Status: Not started

📱 src/screens/SettingsScreen.tsx
   Purpose: User settings and preferences
   Uses: getUserProfile(), updateUserProfile()
   Status: Not started
```

---

## Summary

✅ **Clean Structure:** Organized by functionality  
✅ **No Duplicates:** Single source of truth  
✅ **No Outdated Code:** All old files removed  
✅ **Clear Separation:** Components, Screens, DB, Utils, Hooks  
✅ **Easy Navigation:** Logical folder hierarchy  
✅ **Ready for Development:** All systems in place  

**Total Files: 37 active (not counting dependencies)**  
**Total Size: ~414 MB (includes node_modules)**  
**Code Size: ~50 MB (src + assets + docs)**  
**Build Status: ✅ Ready**  

---

Generated: January 17, 2026  
Last Updated: Post-cleanup verification

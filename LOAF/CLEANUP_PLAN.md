# File Structure Cleanup Plan

## CURRENT STATUS: Messy with Duplicates & Outdated Files

### Issues Identified:

1. **Duplicate Folders:**
   - `/screens/` (old) + `/src/screens/` (active)
   - `/services/` (old) + files in other places
   - `/navigation/` + files elsewhere
   - `/constants/` + files elsewhere
   - `/context/` + files elsewhere
   - `/app/` (old Expo Router) + `App.tsx` (active)
   - `/examples/` (old)
   - Root level folders mixing with `/src/`

2. **Outdated Documentation (20+ files):**
   - BUILD_*.md (outdated)
   - LOG_FOOD_*.md (old implementation)
   - FOOD_*.md (old implementation)
   - COLOR_PALETTE_AUDIT.md
   - DEPLOYMENT_CHECKLIST.md
   - DOCUMENTATION_INDEX.md
   - ICONS_GUIDE.md
   - DATA_LAYER_GUIDE.md

3. **Outdated Code:**
   - `/screens/MealLoggingScreen.js` (old)
   - `/services/mealLoggingService.js` (old)
   - `/examples/mealLoggingExamples.js` (old)
   - `/navigation/` files (old structure)
   - `/constants/` files
   - `/context/` files

4. **Old Data Files (in `/data/`):**
   - All .json files (mock data)
   - Multiple .md documentation files

---

## PROPOSED CLEAN STRUCTURE

```
/LOAF
├── 📁 src/                          (Active source code)
│   ├── 📁 components/               (Reusable components)
│   │   ├── OnboardingGate.tsx
│   │   └── [other components]
│   ├── 📁 screens/                  (Screen components)
│   │   ├── LogFoodScreen.tsx        (Active)
│   │   ├── HomeScreen.tsx           (To be built)
│   │   ├── InsightsScreen.tsx       (To be built)
│   │   ├── WaterScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── 📁 db/                       (Database layer)
│   │   ├── db.ts                    (DB initialization)
│   │   ├── userRepo.ts              (User data)
│   │   ├── mealRepo.ts              (Meal logs)
│   │   ├── waterRepo.ts             (Water tracking)
│   │   ├── summaryRepo.ts           (Summary data)
│   │   └── [others]
│   ├── 📁 utils/                    (Utilities)
│   │   ├── foodSearch.ts            (Food search API)
│   │   ├── nutritionEngine.ts       (Nutrition analysis)
│   │   ├── helpers.ts               (Helper functions)
│   │   └── [others]
│   ├── 📁 hooks/                    (Custom React hooks)
│   │   ├── useOnboarding.ts
│   │   └── [others]
│   ├── 📁 data/                     (Data loading & processing)
│   │   ├── loadFoodData.ts
│   │   ├── loadRDA.ts
│   │   └── [others]
│   └── index.ts                     (DB initialization)
│
├── 📄 App.tsx                       (Main app file)
├── 📄 app.json                      (Expo config)
├── 📄 tsconfig.json                 (TypeScript config)
├── 📄 package.json                  (Dependencies)
│
├── 📁 assets/                       (Images, icons)
│   ├── icon.png
│   ├── splash-icon.png
│   └── [others]
│
├── 📁 docs/                         (Documentation - CONSOLIDATED)
│   ├── NUTRITION_ENGINE.md
│   ├── NUTRITION_ENGINE_QUICK_REF.md
│   ├── NUTRITION_ENGINE_EXAMPLES.md
│   ├── NUTRITION_ENGINE_VERIFICATION.md
│   ├── QUICK_START.md
│   └── README.md (main)
│
├── 📄 .gitignore
├── 📄 .expo/
├── 📄 node_modules/
└── 📄 package-lock.json
```

---

## FILES TO DELETE

### Root Level Duplicates (Delete):
- ❌ `/screens/` folder (duplicates in `/src/screens/`)
- ❌ `/services/` folder (old - use repos instead)
- ❌ `/navigation/` folder (old structure)
- ❌ `/constants/` folder (old)
- ❌ `/context/` folder (old)
- ❌ `/app/` folder (old Expo Router)
- ❌ `/examples/` folder (old)
- ❌ `index.js` (old)

### Documentation to Archive (Delete):
- ❌ BUILD_COMPLETE.md
- ❌ BUILD_STATUS_LOG_FOOD.md
- ❌ COLOR_PALETTE_AUDIT.md
- ❌ DATA_LAYER_GUIDE.md
- ❌ DEPLOYMENT_CHECKLIST.md
- ❌ DOCUMENTATION_INDEX.md
- ❌ FOOD_DATABASE_GUIDE.md
- ❌ FOOD_INTEGRATION_SUMMARY.md
- ❌ FOOD_QUICK_REFERENCE.md
- ❌ ICONS_GUIDE.md
- ❌ LOG_FOOD_CODE_REFERENCE.md
- ❌ LOG_FOOD_IMPLEMENTATION.md
- ❌ LOG_FOOD_SCREEN.md
- ❌ LOG_FOOD_VISUAL_GUIDE.md
- ❌ `/data/00_START_HERE.md`
- ❌ `/data/ENHANCEMENTS_SUMMARY.md`
- ❌ `/data/FINAL_SUMMARY.md`
- ❌ `/data/IMPLEMENTATION_CHECKLIST.md`
- ❌ `/data/INDEX.md`
- ❌ `/data/QUICK_REFERENCE.md`
- ❌ `/data/README.md`

### Mock Data Files (Delete):
- ❌ `/data/foodDatabase.json` (use database instead)
- ❌ `/data/goalMappings.json` (mock)
- ❌ `/data/mealLogs.json` (use database instead)
- ❌ `/data/nutritionAnalytics.json` (mock)
- ❌ `/data/rdaRecommendations.json` (in code)
- ❌ `/data/userProfiles.json` (use database instead)

### Old Code Files (Delete):
- ❌ `/screens/MealLoggingScreen.js`
- ❌ `/services/mealLoggingService.js`
- ❌ `/examples/mealLoggingExamples.js`

---

## FILES TO KEEP

### Essential Source Code:
- ✅ `/src/components/OnboardingGate.tsx`
- ✅ `/src/screens/LogFoodScreen.tsx`
- ✅ `/src/screens/HomeScreen.tsx`
- ✅ `/src/screens/InsightsScreen.tsx`
- ✅ `/src/screens/WaterScreen.tsx`
- ✅ `/src/screens/SettingsScreen.tsx`
- ✅ `/src/db/*.ts` (all database files)
- ✅ `/src/utils/*.ts` (all utilities)
- ✅ `/src/hooks/useOnboarding.ts`
- ✅ `/src/data/*.ts` (data loaders)
- ✅ `/src/index.ts` (DB initialization)

### Essential Configuration:
- ✅ `App.tsx` (main entry)
- ✅ `app.json` (Expo config)
- ✅ `package.json` (dependencies)
- ✅ `tsconfig.json` (TS config)
- ✅ `.gitignore`
- ✅ `/node_modules/` (dependencies)
- ✅ `package-lock.json`

### Assets:
- ✅ `/assets/` (all images, icons, logos)

### Documentation (Keep):
- ✅ `NUTRITION_ENGINE.md` (active)
- ✅ `NUTRITION_ENGINE_QUICK_REF.md` (active)
- ✅ `NUTRITION_ENGINE_EXAMPLES.md` (active)
- ✅ `NUTRITION_ENGINE_VERIFICATION.md` (active)
- ✅ `QUICK_START.md` (active)
- ✅ `README.md` (main project readme)

---

## CLEANUP EXECUTION STEPS

1. ✅ Delete `/screens/` (duplicates)
2. ✅ Delete `/services/` (old)
3. ✅ Delete `/navigation/` (old)
4. ✅ Delete `/constants/` (old)
5. ✅ Delete `/context/` (old)
6. ✅ Delete `/app/` (old)
7. ✅ Delete `/examples/` (old)
8. ✅ Delete `index.js` (old)
9. ✅ Delete all old documentation files
10. ✅ Delete all mock data .json files
11. ✅ Delete old code files
12. ✅ Create `/docs/` folder (optional, for organization)
13. ✅ Move kept documentation to `/docs/` (optional)

---

## ESTIMATED IMPACT

- **Files Deleted:** ~50 files
- **Folders Deleted:** 8 folders
- **Space Freed:** ~2-3 MB
- **Clean Structure:** Organized by functionality (components, screens, db, utils)
- **No Breaking Changes:** All active code remains
- **Easier Navigation:** Clear separation of concerns

---

**Ready to execute cleanup? [YES/NO]**

Generated: January 17, 2026

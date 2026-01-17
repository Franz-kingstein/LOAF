# LOAF - Lifestyle Optimization & Activity Fusion

## 🎯 Project Overview

LOAF is a comprehensive React Native health and wellness tracking application built with Expo and TypeScript. It provides users with intelligent water intake tracking, food logging, nutrition management, and detailed analytics—all working seamlessly offline.

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Framework:** React Native + Expo  
**Language:** TypeScript (Strict Mode)

---

## ✨ Key Features

### 💧 Smart Water Tracking
- Daily water goal setting (default: 2500ml)
- Quick-add buttons: 250ml, 500ml, 750ml
- Custom volume input with validation
- Real-time progress circle (0-100%)
- Water intake history/logs
- Comprehensive settings panel

### 🔔 Intelligent Reminders
- Smart notification scheduling
- Respects wake-up and sleep times
- Evenly distributed throughout the day
- Gentle notification tone (no aggressive alerts)
- Toggle on/off capability
- Offline notification support

### 📊 Analytics & Insights
- 7-day water tracking trends
- Daily breakdown with progress bars
- Weekly average calculations
- Goal achievement tracking
- Summary statistics display
- Visual chart representation

### 🍽️ Nutrition Management
- Food logging interface
- Meal history tracking
- Nutrition summary calculations
- Daily macro/micronutrient tracking
- Quick food search

### 👤 User Profiles
- User preference management
- Profile information (age, gender, height, weight)
- Goal customization
- Notification settings
- Wake/sleep time configuration

### 🌙 Dark Theme
- Eye-friendly dark interface
- Consistent color scheme throughout
- Responsive layouts
- Touch-friendly components
- Accessible design

---

## 🏗️ Architecture Overview

### Technology Stack
```
Frontend Layer:
├── React Native 19.1.0
├── TypeScript 5.9.2 (Strict Mode)
├── Expo 54.0.31
└── React Navigation 7.x

Storage Layer:
├── SQLite (expo-sqlite 16.0.10)
└── Local persistence

Notifications:
├── expo-notifications 0.28.3
└── Device-native alerts

UI Framework:
├── React Native StyleSheet
├── SafeAreaView for safe zones
└── Responsive layouts
```

### Project Structure
```
LOAF/
├── App.tsx                          # Main entry point
├── app.json                         # App configuration
├── package.json                     # Dependencies
├── src/
│   ├── screens/                     # UI Screens
│   │   ├── HomeScreen.tsx          # Dashboard
│   │   ├── InsightsScreen.tsx      # Analytics
│   │   ├── SettingsScreen.tsx      # Preferences
│   │   ├── LogFoodScreen.tsx       # Food logging
│   │   ├── WaterTrackingScreen.tsx # Water tracking
│   │   └── OnboardingScreen.tsx    # First-time setup
│   │
│   ├── db/                          # Database Layer
│   │   ├── db.ts                   # Schema & initialization
│   │   ├── waterRepo.ts            # Water operations
│   │   ├── waterPreferencesRepo.ts # Water settings
│   │   ├── userRepo.ts             # User profile
│   │   ├── mealRepo.ts             # Food logging
│   │   └── summaryRepo.ts          # Calculations
│   │
│   ├── utils/                       # Utilities
│   │   ├── notificationService.ts  # Smart reminders
│   │   ├── nutritionEngine.ts      # Calculations
│   │   ├── helpers.ts              # Common functions
│   │   └── foodSearch.ts           # Food search
│   │
│   ├── context/                     # State Management
│   │   └── ThemeContext.tsx        # Theme provider
│   │
│   ├── navigation/                  # Navigation
│   │   └── NavigationConfig.ts     # Route config
│   │
│   ├── components/                  # Reusable Components
│   │   ├── OnboardingGate.tsx      # Auth gate
│   │   └── (other components)
│   │
│   ├── hooks/                       # Custom Hooks
│   │   └── useOnboarding.ts        # Onboarding logic
│   │
│   ├── data/                        # Static Data
│   │   └── loadGoals.ts            # Goal templates
│   │
│   └── index.ts                     # Main exports (78 lines)
│
└── DEPLOYMENT_CHECKLIST.md          # Production checklist
```

---

## 🎮 Navigation Structure

### Bottom Tab Navigation (5 Tabs)
```
┌─────────────────────────────────────┐
│  App Content (Active Screen)       │
├─────────────────────────────────────┤
│ 🏠    🍽️    💧    📊    ⚙️         │  ← Tab Bar
│ Home  Food  Water Insights Settings │
└─────────────────────────────────────┘
```

### Tab Details

#### 1. 🏠 **Home Screen**
- User dashboard overview
- Today's water intake display
- Nutrition summary card
- Quick action buttons
- Welcome message
- Real-time data updates

#### 2. 🍽️ **Log Food Screen**
- Food search interface
- Meal history display
- Quick add buttons
- Nutrition tracking
- Calorie counting

#### 3. 💧 **Water Tracking Screen**
- Progress circle (0-100%)
- Quick-add buttons (250, 500, 750ml)
- Custom ml input
- Water logs history
- Settings panel
- Notification configuration

#### 4. 📊 **Insights Screen**
- 7-day water chart
- Daily breakdown
- Weekly statistics
- Average calculations
- Goal achievement tracker
- Trend visualization

#### 5. ⚙️ **Settings Screen**
- User profile editing
- Water goals setup
- Wake/sleep time configuration
- Notification toggle
- Save/update preferences
- About section

---

## 💾 Database Schema

### Tables

#### `users`
```sql
- id (INTEGER PRIMARY KEY)
- age (INTEGER)
- gender (TEXT)
- height_cm (REAL)
- weight_kg (REAL)
- created_at (TEXT)
- updated_at (TEXT)
```

#### `water_tracking`
```sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- date (TEXT)
- amount_ml (INTEGER)
- time (TEXT)
- created_at (TEXT)
```

#### `water_tracking_preferences`
```sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- daily_goal_ml (INTEGER, default: 2500)
- wake_up_time (TEXT, default: "06:00")
- sleep_time (TEXT, default: "22:00")
- reminders_enabled (BOOLEAN, default: 1)
- reminder_interval_minutes (INTEGER, default: 120)
- created_at (TEXT)
- updated_at (TEXT)
```

#### `meals`
```sql
- id (INTEGER PRIMARY KEY)
- user_id (INTEGER)
- date (TEXT)
- meal_type (TEXT: breakfast/lunch/dinner/snack)
- food_name (TEXT)
- quantity (REAL)
- calories (INTEGER)
- protein_g (REAL)
- carbs_g (REAL)
- fat_g (REAL)
- created_at (TEXT)
```

---

## 🔔 Notification System

### Smart Reminder Algorithm

The notification system implements an intelligent scheduling algorithm:

```
Algorithm: Smart Reminder Distribution

Input:
- wake_up_time: User's wake-up time (e.g., 06:00)
- sleep_time: User's sleep time (e.g., 22:00)
- reminder_interval: Minutes between reminders (e.g., 120 min)

Process:
1. Calculate awake hours
   awake_minutes = sleep_time - wake_up_time
   
2. Calculate number of reminders
   num_reminders = awake_minutes / reminder_interval
   
3. Distribute evenly
   notification_times = [
     wake_time,
     wake_time + interval,
     wake_time + (2 * interval),
     ... until sleep_time
   ]

4. Schedule native notifications
   For each time: create PushNotification

Output:
- Reminders scheduled throughout awake hours
- Evenly spaced by configured interval
- Respects sleep schedule
- Gentle notifications (no aggressive alerts)

Example:
- Wake: 06:00, Sleep: 22:00 (16 hours awake)
- Interval: 120 min (2 hours)
- Result: 8 notifications at 06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00
```

### Notification Features
- ✅ Offline scheduling (device-native)
- ✅ Background execution support
- ✅ Persistent across app restarts
- ✅ User can toggle on/off
- ✅ Respects device settings
- ✅ No network required

---

## 📊 Data Layer Architecture

### Repository Pattern Implementation

Each domain has a dedicated repository following the repository pattern:

```typescript
// Example: waterRepo.ts
export async function addWaterEntry(amount_ml: number): Promise<void>
export async function getTodayWaterTotal(): Promise<number>
export async function getTotalWaterForDate(date: string): Promise<number>
export async function getWaterLogs(date?: string): Promise<WaterLog[]>
export async function deleteWaterEntry(id: number): Promise<void>
```

### Query Examples

**Daily Water Total:**
```typescript
SELECT SUM(amount_ml) FROM water_tracking 
WHERE date = TODAY() AND user_id = ?
```

**7-Day Trend:**
```typescript
SELECT date, SUM(amount_ml) FROM water_tracking 
WHERE date >= DATE('now', '-7 days') AND user_id = ?
GROUP BY date
```

**Nutrition Summary:**
```typescript
SELECT 
  SUM(calories) as total_calories,
  SUM(protein_g) as total_protein,
  SUM(carbs_g) as total_carbs,
  SUM(fat_g) as total_fat
FROM meals WHERE date = TODAY() AND user_id = ?
```

---

## 🎨 Theme System

### Color Palette (ThemeContext.tsx)
```typescript
const COLORS = {
  // Core Colors
  background: '#000000',        // Pure black - main background
  primary: '#143109',           // Dark green - primary theme
  secondary: '#B5BFA1',         // Light sage - accents
  accent: '#3B7EBB',            // Blue - interactive elements
  
  // Text Colors
  textPrimary: '#FFFFFF',       // White - main text
  textSecondary: 'rgba(255,255,255,0.6)',    // Dim white - secondary text
  inactiveIcon: 'rgba(255,255,255,0.4)',     // Very dim - inactive state
  
  // Status Colors
  success: '#4CAF50',           // Green - success states
  warning: '#FF9800',           // Orange - warnings
  danger: '#F44336',            // Red - errors/dangerous actions
};
```

### Theme Provider Usage
```typescript
// In App.tsx
<ThemeProvider>
  {/* All child components have access to colors */}
</ThemeProvider>

// In any component
import { COLORS } from '../context/ThemeContext';
const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.background }
});
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- Xcode (for iOS) or Android SDK (for Android)

### Installation

```bash
# Navigate to project directory
cd /home/franz/Documents/LOAF/LOAF

# Install dependencies
npm install

# Verify installation
npm list

# Check for any errors
npm run type-check
```

### Development

```bash
# Start dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web

# Build for production
eas build --platform ios
eas build --platform android
```

### Testing

```bash
# TypeScript compilation check
npx tsc --noEmit

# Manual testing steps
1. Start the app
2. Go through onboarding
3. Test each tab (Home, Food, Water, Insights, Settings)
4. Add water from Water tab
5. Check dashboard updates on Home tab
6. Check analytics on Insights tab
7. Verify settings persist on Settings tab
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "Cannot find module" errors**
```bash
Solution:
1. npm install
2. Clear cache: npm cache clean --force
3. Reinstall: rm -rf node_modules && npm install
```

**Issue: TypeScript errors in IDE**
```bash
Solution:
1. Reload VS Code window (Cmd+Shift+P → Reload Window)
2. Check TypeScript version: npx tsc --version
3. Restart TS server: Cmd+Shift+P → TypeScript: Restart TS Server
```

**Issue: Database errors on startup**
```bash
Solution:
1. Delete app data: adb shell pm clear <app-package>
2. Uninstall and reinstall
3. Check database schema in src/db/db.ts
```

**Issue: Notifications not triggering**
```bash
Solution:
1. Grant notification permissions in device settings
2. Check wake/sleep times in settings (must be valid times)
3. Verify notification service initialization in App.tsx
4. Check device battery settings (might be in power saving mode)
```

**Issue: App crashes on startup**
```bash
Solution:
1. Check console logs: npm start (look for error messages)
2. Verify all imports are correct
3. Check database initialization in src/db/db.ts
4. Run: npx tsc --noEmit (to find TS errors)
```

---

## 📈 Performance Optimizations

### Current Optimizations
- ✅ useCallback hooks for memoized functions
- ✅ Efficient database queries with proper WHERE clauses
- ✅ Interval-based refresh (1 minute for data updates)
- ✅ Proper cleanup in useEffect (return functions)
- ✅ No unnecessary re-renders
- ✅ Lazy loading for long lists
- ✅ Optimized images and assets

### Future Optimizations
- [ ] Implement React.memo for expensive components
- [ ] Add virtualized lists for long water logs
- [ ] Implement service workers for offline support
- [ ] Add data compression for backup
- [ ] Implement progressive image loading
- [ ] Add request debouncing/throttling

---

## 🔒 Security Considerations

### Current Security Measures
- ✅ All data stored locally (SQLite) - no cloud transmission required
- ✅ Input validation for all user inputs
- ✅ SQL injection prevention (parameterized queries)
- ✅ No sensitive data in logs
- ✅ Proper error handling (no stack traces exposed to users)
- ✅ TypeScript type safety throughout

### Recommended for Production
- [ ] Add user authentication (Firebase Auth)
- [ ] Implement encrypted local storage
- [ ] Add API request signing/validation
- [ ] Implement data backup encryption
- [ ] Add rate limiting for API calls
- [ ] Regular security audits
- [ ] GDPR compliance features

---

## 📱 Device Compatibility

### Tested Devices
- ✅ iOS 14+
- ✅ Android 10+
- ✅ iPad (tablet support)
- ✅ Web browsers (Chrome, Safari, Firefox)

### Screen Sizes Supported
- ✅ Phone (5.5" - 6.9")
- ✅ Tablet (7" - 12")
- ✅ Responsive layouts for all sizes
- ✅ Safe area handling

---

## 📦 Build & Deployment

### Production Build Process

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo account
eas login

# 3. Build for iOS
eas build --platform ios

# 4. Build for Android
eas build --platform android

# 5. Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Build Artifacts
- iOS: `.ipa` file
- Android: `.aab` file (AAB format)
- Web: Static files (if using web platform)

### Release Checklist
- [ ] Update version number in app.json
- [ ] Update CHANGELOG.md with new features
- [ ] Test on real devices
- [ ] Create release notes for app stores
- [ ] Screenshot capture for app stores
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Build signed APK/IPA
- [ ] Submit to App Store
- [ ] Submit to Google Play

---

## 📚 API Reference

### Core Exports (from src/index.ts)

```typescript
// Database Initialization
export { initializeDatabase } from './db/db';

// User Management
export { getUserProfile, updateUserProfile } from './db/userRepo';

// Water Tracking
export { 
  addWaterEntry, 
  getTodayWaterTotal, 
  getTotalWaterForDate,
  getWaterLogs,
  deleteWaterEntry
} from './db/waterRepo';

// Water Preferences
export {
  getOrCreateWaterPreferences,
  updateWaterPreferences,
  getDailyWaterGoal,
  toggleReminders
} from './db/waterPreferencesRepo';

// Meals & Nutrition
export {
  addMeal,
  getMealsForDate,
  getNutritionSummary,
  deleteMeal
} from './db/mealRepo';

// Nutrition Summary
export {
  getTodaySummary,
  calculateDailyNutrition
} from './db/summaryRepo';

// Notifications
export {
  configureNotificationHandler,
  scheduleWaterReminders,
  sendImmediateWaterReminder,
  rescheduleReminders
} from './utils/notificationService';

// Utilities
export {
  todayDate,
  formatDate,
  parseDate,
  calculateWaterGoal
} from './utils/helpers';

// Food Search
export { searchFood, getFoodDatabase } from './utils/foodSearch';

// Nutrition Calculations
export {
  calculateMacros,
  calculateCalories,
  calculateWaterIntake
} from './utils/nutritionEngine';
```

---

## 🎓 Code Examples

### Adding Water Entry

```typescript
import { addWaterEntry, getTodayWaterTotal } from '../db/waterRepo';

async function handleAddWater(amount: number) {
  try {
    await addWaterEntry(amount);
    const total = await getTodayWaterTotal();
    console.log(`Added ${amount}ml. Total: ${total}ml`);
  } catch (error) {
    console.error('Failed to add water:', error);
  }
}
```

### Scheduling Reminders

```typescript
import { scheduleWaterReminders } from '../utils/notificationService';

async function setupReminders() {
  try {
    await scheduleWaterReminders();
    console.log('✅ Reminders scheduled');
  } catch (error) {
    console.error('Failed to schedule reminders:', error);
  }
}
```

### Using Theme

```typescript
import { COLORS } from '../context/ThemeContext';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  text: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
```

---

## 📝 Contributing Guidelines

### Code Style
- Use TypeScript for all new files
- Follow existing naming conventions
- Add proper type annotations
- Include error handling
- Add comments for complex logic
- Keep functions focused and small (< 30 lines)

### Git Workflow
1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit: `git commit -m "Brief description"`
3. Push to branch: `git push origin feature/feature-name`
4. Create pull request on GitHub
5. Request code review
6. Merge after approval

### Testing
- Test on both iOS and Android
- Test with real data (not just mock data)
- Verify database operations
- Check notification scheduling
- Test edge cases (empty lists, network errors, etc.)

---

## 📄 License

This project is licensed under the 0BSD License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- React Native and Expo communities
- TypeScript for type safety
- Expo notifications for smart reminders
- SQLite for reliable local storage
- React Navigation for smooth navigation

---

## 📞 Support

For issues, feature requests, or questions:

1. Check DEPLOYMENT_CHECKLIST.md for production checklist
2. Review troubleshooting section above
3. Check console logs for error messages
4. Verify all dependencies are installed
5. Try clearing cache and reinstalling

---

## 🚀 What's Next?

### Planned Features
- [ ] Social sharing (share water intake achievements)
- [ ] Advanced analytics and reports
- [ ] Multiple user profiles support
- [ ] Cloud backup and sync
- [ ] Wearable integration (Apple Watch, Wear OS)
- [ ] Voice commands for logging
- [ ] Custom goal templates
- [ ] Achievement badges and gamification

### Tech Debt
- [ ] Add comprehensive unit tests
- [ ] Add integration tests
- [ ] Improve error messages
- [ ] Add analytics tracking
- [ ] Optimize database queries
- [ ] Add caching layer

---

**Last Updated:** 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

For the latest updates and documentation, check the project repository.

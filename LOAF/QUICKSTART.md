# LOAF Quick Start Guide 🚀

## 30-Second Setup

```bash
# 1. Navigate to project
cd /home/franz/Documents/LOAF/LOAF

# 2. Install dependencies (if not already done)
npm install

# 3. Start the dev server
npm start

# 4. Choose platform:
# iOS: Press 'i' in terminal
# Android: Press 'a' in terminal
# Web: Press 'w' in terminal
```

**That's it!** The app will launch on your device/emulator.

---

## First-Time User Flow

1. **App Launches** → OnboardingGate component
2. **Onboarding Screen** → Setup user profile (name, age, gender, height, weight)
3. **Home Dashboard** → See daily overview
4. **Water Tab** → Set daily goal & add water
5. **Insights Tab** → View 7-day trends
6. **Settings Tab** → Customize preferences

---

## Testing Each Feature

### 💧 Water Tracking (Most Important)
```
1. Navigate to "Water" tab (💧)
2. See progress circle (0-100%)
3. Tap "250ml" button → Progress should increase
4. Tap "Custom" → Enter amount → Tap "Add"
5. Check "Home" tab → Water intake should update
6. Check "Insights" tab → Today's water should show
```

### 🏠 Home Dashboard
```
1. Navigate to "Home" tab (🏠)
2. See "Welcome, [User]" message
3. See today's water intake card
4. See nutrition summary
5. See quick action buttons
6. Data should refresh every 60 seconds
```

### 📊 Insights & Analytics
```
1. Navigate to "Insights" tab (📊)
2. See 7-day water chart
3. See daily breakdown with bars
4. See summary statistics
5. Scroll to see all data
```

### 🍽️ Food Logging
```
1. Navigate to "Log Food" tab (🍽️)
2. Search for food by name
3. Add meal with quantity
4. Verify calorie count
5. Meal should appear in history
```

### ⚙️ Settings
```
1. Navigate to "Settings" tab (⚙️)
2. Tap "Edit" button on Profile
3. Change age/height/weight
4. Tap "Save Profile"
5. Tap "Edit" button on Water Settings
6. Change daily goal (2500ml is default)
7. Change wake-up time (06:00 is default)
8. Change sleep time (22:00 is default)
9. Toggle reminders on/off
10. Tap "Save Settings"
```

### 🔔 Notifications
```
1. Go to Settings tab
2. Enable "Reminders" toggle
3. Wait for scheduled notification time
4. Or tap any water button to test immediate notification
5. Should see notification popup
6. Tap notification to open app
```

---

## File Structure Guide

### Essential Files for Understanding
- **App.tsx** - Main entry point (130 lines)
- **src/context/ThemeContext.tsx** - Theme & colors (41 lines)
- **src/screens/HomeScreen.tsx** - Dashboard (265 lines)
- **src/screens/WaterTrackingScreen.tsx** - Water tracking (703 lines)
- **src/db/db.ts** - Database setup
- **src/utils/notificationService.ts** - Reminders (274 lines)

### For Modifications
- **Edit Colors**: `src/context/ThemeContext.tsx` (line ~13)
- **Edit Home Page**: `src/screens/HomeScreen.tsx`
- **Edit Water Goals**: `src/db/waterPreferencesRepo.ts`
- **Edit Notification Text**: `src/utils/notificationService.ts` (line ~80)

---

## Common Customizations

### Change Daily Water Goal
```typescript
// File: src/db/waterPreferencesRepo.ts
// Line ~40: Change default value
const DEFAULT_DAILY_GOAL = 2500; // Change to desired ml
```

### Change Default Wake-up Time
```typescript
// File: src/db/waterPreferencesRepo.ts
// Line ~45: Change default value
const DEFAULT_WAKE_UP_TIME = '06:00'; // Change to desired time
```

### Change App Colors
```typescript
// File: src/context/ThemeContext.tsx
// Line ~13: Edit COLORS object
export const COLORS = {
  background: '#000000',      // Change black to other color
  primary: '#143109',         // Change green to other color
  accent: '#3B7EBB',          // Change blue to other color
  // ... etc
};
```

### Change Navigation Icons
```typescript
// File: App.tsx
// Line ~20: Edit EMOJI_ICONS object
const EMOJI_ICONS: Record<keyof RootTabParamList, string> = {
  Home: '🏠',      // Change emoji
  LogFood: '🍽️',  // Change emoji
  Water: '💧',    // Change emoji
  Insights: '📊', // Change emoji
  Settings: '⚙️', // Change emoji
};
```

---

## Debugging Tips

### View Console Logs
```bash
# While app is running:
# iOS: Xcode Console (Cmd+Shift+C)
# Android: Android Studio Logcat
# Web: Browser Dev Tools (F12)
```

### Check Database
```typescript
// Add this to any component to see database contents
import { db } from './src/db/db';
db.getAllAsync('SELECT * FROM water_tracking')
  .then(rows => console.log('Water logs:', rows))
  .catch(error => console.error('DB Error:', error));
```

### Test Notifications Manually
```typescript
// Add to any component to send test notification
import { sendImmediateWaterReminder } from './src/utils/notificationService';
sendImmediateWaterReminder();
```

### View App Logs
```bash
# Terminal where "npm start" is running
# Shows console.log() outputs
# Look for ✅ and ❌ messages
```

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| App won't start | Run `npm install && npm start` |
| Blank screen | Check console for errors (F12) |
| Water not updating | Refresh tab or restart app |
| Notifications not showing | Check Settings > enable Reminders |
| Can't add food | Tap search field and type food name |
| Settings not saving | Check browser console for database errors |
| App crashes on startup | Run `npm install` then restart |

---

## Production Checklist

Before deploying:

- [ ] Test all 5 tabs work
- [ ] Add water and see progress update
- [ ] Check water analytics show data
- [ ] Change settings and verify they save
- [ ] Add food and see in logs
- [ ] Enable notifications (if applicable)
- [ ] Run: `npx tsc --noEmit` (should show 0 errors)
- [ ] Clear app data and test fresh install
- [ ] Test on real device (not just emulator)
- [ ] Update version in app.json
- [ ] Build final release: `eas build --platform ios/android`

---

## Key Keyboard Shortcuts

### Development
- `i` - Launch iOS simulator
- `a` - Launch Android emulator
- `w` - Launch web version
- `r` - Reload app
- `m` - Toggle menu
- `q` - Quit dev server

### App Navigation
- Swipe left/right - Switch tabs
- Tap tab icons - Jump to tab
- Pull down - Refresh data

---

## Important Links

- **Expo Docs**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **TypeScript**: https://www.typescriptlang.org
- **React Navigation**: https://reactnavigation.org
- **SQLite**: https://www.sqlite.org

---

## Performance Tips

### For Developers
- Use Chrome DevTools for web debugging
- Use Redux DevTools for state debugging
- Use React DevTools for component debugging
- Monitor performance with Expo's built-in tools

### For Users
- Restart app weekly for optimal performance
- Clear app cache monthly
- Update app regularly for improvements
- Close other apps if device has low memory

---

## API Response Examples

### Get Water Total
```typescript
const total = await getTodayWaterTotal(); // Returns: 1250 (ml)
```

### Get Water Logs
```typescript
const logs = await getWaterLogs('2024-01-15');
// Returns:
// [
//   { id: 1, date: '2024-01-15', amount_ml: 250, time: '08:00:00' },
//   { id: 2, date: '2024-01-15', amount_ml: 500, time: '12:00:00' }
// ]
```

### Get User Profile
```typescript
const profile = await getUserProfile();
// Returns:
// {
//   id: 1,
//   age: 30,
//   gender: 'Male',
//   height_cm: 180,
//   weight_kg: 75,
//   created_at: '2024-01-01T10:00:00Z'
// }
```

---

## Common Questions

**Q: Can I use this app offline?**  
A: Yes! All data is stored locally. Notifications work offline too.

**Q: How do I reset my data?**  
A: Uninstall app → Reinstall = fresh start. Or delete app data from settings.

**Q: Can I export my data?**  
A: Currently no, but this can be added. Check database directly: src/db/db.ts

**Q: How do I change the default water goal?**  
A: Settings tab → Edit Water Settings → Change "Daily Goal" → Save

**Q: Why aren't notifications appearing?**  
A: 1) Check enabled in Settings 2) Grant permissions 3) Check device time is correct

**Q: Can I use this on web?**  
A: Yes! Run `npm start` then press `w` for web version.

**Q: How do I add my own food items?**  
A: Log Food tab → Search → Add → Customize calories/macros

**Q: Can multiple people use one device?**  
A: Currently no, but Settings tab can be modified to support multiple profiles.

---

## Next Steps After Setup

1. ✅ Run the app and verify it works
2. ✅ Go through onboarding (fill in profile)
3. ✅ Test water tracking feature
4. ✅ Add water 3-4 times to see analytics
5. ✅ Check Settings tab to customize
6. ✅ Enable notifications for reminders
7. ✅ Read DEPLOYMENT_CHECKLIST.md before release
8. ✅ Read ARCHITECTURE.md for deep dive

---

## Support & Help

- **Bug Reports**: Check console (F12) for error messages
- **Feature Requests**: Edit code or create GitHub issue
- **Documentation**: See ARCHITECTURE.md for full details
- **Code Examples**: See README.md for API reference

---

**Status**: ✅ Ready to Use  
**Version**: 1.0.0  
**Last Updated**: 2024

For detailed information, see:
- **DEPLOYMENT_CHECKLIST.md** - Production readiness
- **ARCHITECTURE.md** - System design & API reference
- **README.md** - Feature overview

Enjoy using LOAF! 🚀

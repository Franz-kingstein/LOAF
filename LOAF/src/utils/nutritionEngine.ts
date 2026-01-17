/**
 * Nutrition Engine
 *
 * Pure logic module for nutritional analysis.
 * Aggregates food logs, compares against RDA values, identifies gaps.
 *
 * No UI coupling. No recommendations. Pure calculation.
 */

import { getMealsForDate } from '../db/mealRepo';
import { getUserProfile } from '../db/userRepo';

/**
 * RDA (Recommended Dietary Allowance) values for different demographic groups.
 * Source: NIH/CDC dietary guidelines
 * Values are daily minimums unless otherwise noted.
 */
export const RDA_VALUES = {
  // Adult Female (19-50 years)
  adulFemale: {
    calories: 2000,
    protein: 46, // grams
    carbs: 225, // grams (55% of 2000 cal)
    fat: 65, // grams (30% of 2000 cal)
    fiber: 25, // grams
    iron: 18, // mg (pre-menopausal)
    calcium: 1000, // mg
    vitaminD: 15, // µg (600 IU)
  },

  // Adult Male (19-50 years)
  adultMale: {
    calories: 2500,
    protein: 56, // grams
    carbs: 275, // grams (55% of 2500 cal)
    fat: 83, // grams (30% of 2500 cal)
    fiber: 38, // grams
    iron: 8, // mg
    calcium: 1000, // mg
    vitaminD: 15, // µg (600 IU)
  },

  // Adult 51+ Female
  adulFemaleOlder: {
    calories: 1800,
    protein: 46, // grams
    carbs: 225, // grams
    fat: 60, // grams
    fiber: 21, // grams
    iron: 8, // mg (post-menopausal)
    calcium: 1200, // mg
    vitaminD: 15, // µg (600 IU)
  },

  // Adult 51+ Male
  adultMaleOlder: {
    calories: 2200,
    protein: 56, // grams
    carbs: 275, // grams
    fat: 73, // grams
    fiber: 30, // grams
    iron: 8, // mg
    calcium: 1000, // mg
    vitaminD: 15, // µg (600 IU)
  },

  // Teenage Female (14-18)
  teenFemale: {
    calories: 2000,
    protein: 46, // grams
    carbs: 275, // grams
    fat: 65, // grams
    fiber: 26, // grams
    iron: 15, // mg
    calcium: 1300, // mg
    vitaminD: 15, // µg (600 IU)
  },

  // Teenage Male (14-18)
  teenMale: {
    calories: 2800,
    protein: 59, // grams
    carbs: 385, // grams
    fat: 93, // grams
    fiber: 38, // grams
    iron: 11, // mg
    calcium: 1300, // mg
    vitaminD: 15, // µg (600 IU)
  },
};

/**
 * Select RDA values based on user profile demographics.
 */
function selectRdaValues(
  age: number,
  gender: string
): typeof RDA_VALUES.adultMale {
  const isAge51Plus = age >= 51;
  const isMale = gender.toLowerCase().includes('male');

  if (isAge51Plus && isMale) return RDA_VALUES.adultMaleOlder;
  if (isAge51Plus && !isMale) return RDA_VALUES.adulFemaleOlder;
  if (age >= 14 && age < 19) {
    return isMale ? RDA_VALUES.teenMale : RDA_VALUES.teenFemale;
  }
  // Default adult (19-50)
  return isMale ? RDA_VALUES.adultMale : RDA_VALUES.adulFemale;
}

/**
 * Daily nutritional values aggregated from food logs.
 */
export interface DailyIntake {
  date: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  fiber: number; // grams
  iron: number; // mg
  calcium: number; // mg
  vitaminD: number; // µg
  mealCount: number;
}

/**
 * RDA comparison for a single nutrient.
 */
export interface NutrientStatus {
  name: string;
  unit: string;
  intake: number;
  rda: number;
  percentage: number; // intake as % of RDA (0-100+)
  gap: number; // negative = deficiency, positive = surplus
  gapPercentage: number; // gap as % of RDA
  status: 'adequate' | 'shortage' | 'surplus'; // adequate >= 90% RDA
}

/**
 * Complete nutritional analysis for a date.
 */
export interface NutrientGaps {
  date: string;
  demographics: {
    age: number;
    gender: string;
  };
  intake: DailyIntake;
  analysis: {
    calories: NutrientStatus;
    protein: NutrientStatus;
    carbs: NutrientStatus;
    fat: NutrientStatus;
    fiber: NutrientStatus;
    iron: NutrientStatus;
    calcium: NutrientStatus;
    vitaminD: NutrientStatus;
  };
  summary: {
    adequateNutrients: string[]; // >= 90% RDA
    shortageNutrients: string[]; // < 90% RDA
    surplusNutrients: string[]; // > 100% RDA
    overallAdequacy: number; // % of nutrients meeting RDA
  };
}

/**
 * Get daily nutritional intake for a specific date.
 *
 * Aggregates all meals logged on the given date.
 * Returns summed nutritional values.
 *
 * @param date - ISO format date string (YYYY-MM-DD)
 * @returns Aggregated daily intake, or null if no meals logged
 */
export async function getDailyIntake(date: string): Promise<DailyIntake | null> {
  const meals = await getMealsForDate(date);

  if (meals.length === 0) {
    return null;
  }

  const intake: DailyIntake = {
    date,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    iron: 0,
    calcium: 0,
    vitaminD: 0,
    mealCount: meals.length,
  };

  // Sum all meal nutrients
  for (const meal of meals) {
    intake.calories += meal.calories;
    intake.protein += meal.protein;
    intake.carbs += meal.carbs;
    intake.fat += meal.fat;
    intake.fiber += meal.fiber;
    intake.iron += meal.iron;
    intake.calcium += meal.calcium;
    intake.vitaminD += meal.vitamin_d_ug;
  }

  // Round to reasonable precision
  intake.calories = Math.round(intake.calories);
  intake.protein = Math.round(intake.protein * 10) / 10;
  intake.carbs = Math.round(intake.carbs * 10) / 10;
  intake.fat = Math.round(intake.fat * 10) / 10;
  intake.fiber = Math.round(intake.fiber * 10) / 10;
  intake.iron = Math.round(intake.iron * 10) / 10;
  intake.calcium = Math.round(intake.calcium);
  intake.vitaminD = Math.round(intake.vitaminD * 10) / 10;

  return intake;
}

/**
 * Calculate nutrient status against RDA.
 * Private helper function.
 */
function calculateNutrientStatus(
  name: string,
  unit: string,
  intake: number,
  rda: number
): NutrientStatus {
  const percentage = Math.round((intake / rda) * 100);
  const gap = intake - rda;
  const gapPercentage = Math.round((gap / rda) * 100);

  let status: 'adequate' | 'shortage' | 'surplus';
  if (percentage >= 90) {
    status = 'adequate';
  } else {
    status = 'shortage';
  }
  if (percentage > 100) {
    status = 'surplus';
  }

  return {
    name,
    unit,
    intake: Math.round(intake * 10) / 10,
    rda,
    percentage,
    gap: Math.round(gap * 10) / 10,
    gapPercentage,
    status,
  };
}

/**
 * Get nutrient gaps for a specific date.
 *
 * Compares daily intake against RDA values based on user demographics.
 * Identifies shortages, adequate nutrients, and surpluses.
 *
 * Requires:
 * 1. User profile exists (for age/gender)
 * 2. Meals logged for the date
 *
 * @param date - ISO format date string (YYYY-MM-DD)
 * @returns Complete nutrient analysis, or null if no user profile or meals
 */
export async function getNutrientGaps(date: string): Promise<NutrientGaps | null> {
  // Get user profile for demographics
  const userProfile = await getUserProfile();
  if (!userProfile) {
    return null; // User profile required for RDA selection
  }

  // Get daily intake
  const dailyIntake = await getDailyIntake(date);
  if (!dailyIntake) {
    return null; // No meals logged
  }

  // Select appropriate RDA values
  const rda = selectRdaValues(userProfile.age, userProfile.gender);

  // Calculate status for each nutrient
  const analysis = {
    calories: calculateNutrientStatus('Calories', 'kcal', dailyIntake.calories, rda.calories),
    protein: calculateNutrientStatus('Protein', 'g', dailyIntake.protein, rda.protein),
    carbs: calculateNutrientStatus('Carbohydrates', 'g', dailyIntake.carbs, rda.carbs),
    fat: calculateNutrientStatus('Fat', 'g', dailyIntake.fat, rda.fat),
    fiber: calculateNutrientStatus('Fiber', 'g', dailyIntake.fiber, rda.fiber),
    iron: calculateNutrientStatus('Iron', 'mg', dailyIntake.iron, rda.iron),
    calcium: calculateNutrientStatus('Calcium', 'mg', dailyIntake.calcium, rda.calcium),
    vitaminD: calculateNutrientStatus('Vitamin D', 'µg', dailyIntake.vitaminD, rda.vitaminD),
  };

  // Categorize nutrients
  const adequateNutrients: string[] = [];
  const shortageNutrients: string[] = [];
  const surplusNutrients: string[] = [];

  const nutrients = Object.values(analysis);
  for (const nutrient of nutrients) {
    if (nutrient.status === 'adequate') {
      adequateNutrients.push(nutrient.name);
    } else if (nutrient.status === 'shortage') {
      shortageNutrients.push(nutrient.name);
    } else if (nutrient.status === 'surplus') {
      surplusNutrients.push(nutrient.name);
    }
  }

  // Calculate overall adequacy
  const totalNutrients = nutrients.length;
  const adequateCount = adequateNutrients.length + surplusNutrients.length;
  const overallAdequacy = Math.round((adequateCount / totalNutrients) * 100);

  return {
    date,
    demographics: {
      age: userProfile.age,
      gender: userProfile.gender,
    },
    intake: dailyIntake,
    analysis,
    summary: {
      adequateNutrients,
      shortageNutrients,
      surplusNutrients,
      overallAdequacy,
    },
  };
}

/**
 * Get weekly average intake (last 7 days).
 *
 * Useful for smoothing out daily variations.
 * Returns average daily intake across all logged days in the week.
 *
 * @returns Weekly average intake structure, or null if no data
 */
export async function getWeeklyAverageIntake(): Promise<DailyIntake | null> {
  const today = new Date();
  const intakes: DailyIntake[] = [];

  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const intake = await getDailyIntake(dateStr);
    if (intake) {
      intakes.push(intake);
    }
  }

  if (intakes.length === 0) {
    return null;
  }

  // Calculate averages
  const avgIntake: DailyIntake = {
    date: `${intakes[0].date} to ${intakes[intakes.length - 1].date}`,
    calories: Math.round(intakes.reduce((sum, i) => sum + i.calories, 0) / intakes.length),
    protein: Math.round((intakes.reduce((sum, i) => sum + i.protein, 0) / intakes.length) * 10) / 10,
    carbs: Math.round((intakes.reduce((sum, i) => sum + i.carbs, 0) / intakes.length) * 10) / 10,
    fat: Math.round((intakes.reduce((sum, i) => sum + i.fat, 0) / intakes.length) * 10) / 10,
    fiber: Math.round((intakes.reduce((sum, i) => sum + i.fiber, 0) / intakes.length) * 10) / 10,
    iron: Math.round((intakes.reduce((sum, i) => sum + i.iron, 0) / intakes.length) * 10) / 10,
    calcium: Math.round((intakes.reduce((sum, i) => sum + i.calcium, 0) / intakes.length)),
    vitaminD: Math.round((intakes.reduce((sum, i) => sum + i.vitaminD, 0) / intakes.length) * 10) / 10,
    mealCount: intakes.reduce((sum, i) => sum + i.mealCount, 0),
  };

  return avgIntake;
}

/**
 * Format nutrient status for display/logging.
 *
 * Provides human-readable explanation of nutrient status.
 * Useful for debugging and understanding the engine's calculations.
 *
 * @param status - NutrientStatus object
 * @returns Formatted explanation string
 */
export function formatNutrientStatus(status: NutrientStatus): string {
  const intake = status.intake.toFixed(1);
  const rda = status.rda.toFixed(1);
  const percentage = status.percentage.toFixed(0);

  if (status.status === 'adequate') {
    return `${status.name}: ${intake}${status.unit} (${percentage}% of ${rda}${status.unit} RDA) ✓`;
  } else if (status.status === 'shortage') {
    const shortageAmount = Math.abs(status.gap).toFixed(1);
    return `${status.name}: ${intake}${status.unit} (${percentage}% of RDA) - SHORT ${shortageAmount}${status.unit}`;
  } else {
    const surplusAmount = status.gap.toFixed(1);
    return `${status.name}: ${intake}${status.unit} (${percentage}% of RDA) - OVER +${surplusAmount}${status.unit}`;
  }
}

/**
 * Explain RDA selection logic.
 *
 * Shows which RDA category was selected based on user demographics.
 * Useful for debugging and understanding the engine's decisions.
 *
 * @param age - User age
 * @param gender - User gender
 * @returns Explanation string
 */
export function explainRdaSelection(age: number, gender: string): string {
  const isMale = gender.toLowerCase().includes('male');
  const genderLabel = isMale ? 'Male' : 'Female';

  if (age < 14) {
    return `Child (<14): Standard child RDA not defined in this engine`;
  } else if (age >= 14 && age < 19) {
    return `Teenager (${age}y, ${genderLabel}): Teen RDA values`;
  } else if (age >= 19 && age < 51) {
    return `Adult (${age}y, ${genderLabel}): Adult (19-50) RDA values`;
  } else if (age >= 51) {
    return `Senior (${age}y, ${genderLabel}): Adult (51+) RDA values`;
  }

  return `Unknown age group: ${age}`;
}

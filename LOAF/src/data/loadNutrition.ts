import nutritionAnalyticsRaw from '../../data/nutritionAnalytics.json';

export interface NutrientInfo {
  name: string;
  unit: string;
  description: string;
  importance: string;
  topSources: string[];
}

let nutritionData: Record<string, NutrientInfo> | null = null;

export function loadNutritionAnalytics(): Record<string, NutrientInfo> {
  if (nutritionData) return nutritionData;

  nutritionData = (nutritionAnalyticsRaw as any).nutrients || {};
  return nutritionData;
}

export function getNutrientInfo(nutrient: string): NutrientInfo | undefined {
  const data = loadNutritionAnalytics();
  return data[nutrient];
}

export function getAllNutrients(): NutrientInfo[] {
  const data = loadNutritionAnalytics();
  return Object.values(data);
}

export function getNutrientDescription(nutrient: string): string {
  const info = getNutrientInfo(nutrient);
  return info?.description || `No information available for ${nutrient}`;
}

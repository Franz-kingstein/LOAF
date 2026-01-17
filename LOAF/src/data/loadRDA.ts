import rdaRaw from '../../data/rdaRecommendations.json';

export interface RDARecommendation {
  ageGroup: string;
  gender: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
  vitaminD_ug: number;
  water_ml: number;
}

let rdaData: RDARecommendation[] | null = null;

export function loadRDA(): RDARecommendation[] {
  if (rdaData) return rdaData;

  rdaData = (rdaRaw as any).recommendations || [];
  return rdaData;
}

export function getRDAByAgeAndGender(
  ageGroup: string,
  gender: string
): RDARecommendation | undefined {
  const rda = loadRDA();
  return rda.find(
    r => r.ageGroup === ageGroup && r.gender.toLowerCase() === gender.toLowerCase()
  );
}

export function getDefaultDailyTargets(): Record<string, number> {
  const rda = loadRDA()[0];
  if (!rda) return {};

  return {
    calories: rda.calories,
    protein: rda.protein,
    carbs: rda.carbs,
    fat: rda.fat,
    fiber: rda.fiber,
    iron: rda.iron,
    calcium: rda.calcium,
    vitaminD_ug: rda.vitaminD_ug,
    water_ml: rda.water_ml,
  };
}

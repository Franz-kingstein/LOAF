import { getGoalById, getTopFoodsForGoal, type Goal } from '../data/loadGoals';
import { suggestSmallAdditions, explainNutrientGaps } from './ai';

export type GoalSuggestion = {
  goalId: string;
  goalName: string;
  nutrients: string[];
  foods: Array<{ name: string; portion: string; note?: string }>;
  explanation?: string | null; // optional AI text
};

// Cultural context defaults to Indian food
const DEFAULT_DIET_CONTEXT = 'regular Indian food';

/**
 * Build suggestions for a specific goal without changing regular meals.
 * - Uses goal → nutrient mapping
 * - Returns small add-ons (spoonful, one item) with portions
 * - Optionally includes an AI explanation
 */
export async function buildGoalSuggestions(goalId: string, options?: {
  includeAI?: boolean;
  dietContext?: string;
}): Promise<GoalSuggestion | null> {
  const goal = await getGoalById(goalId);
  if (!goal) return null;

  // Map goal → nutrients
  const nutrients = Array.isArray((goal as Goal).keyNutrients)
    ? (goal as Goal).keyNutrients
    : [];

  // Fetch culturally relevant foods for these nutrients
  const foods = await getTopFoodsForGoal(goalId);
  const normalizedFoods = (foods || []).map((f: any) => ({
    name: f.name,
    portion: f.defaultPortion || 'small portion',
    note: f.note,
  }));

  let explanation: string | null = null;
  if (options?.includeAI) {
    // Summarized gaps: represent the goal’s key nutrients as low/moderate gaps for explanation
    const gaps = nutrients.map((n) => ({ nutrient: n, severity: 'low' as const }));
    const dietContext = options?.dietContext || DEFAULT_DIET_CONTEXT;
    explanation = await explainNutrientGaps({ gaps, dietContext });
    // If no explanation, try suggestions phrasing
    if (!explanation) {
      explanation = await suggestSmallAdditions({ gaps, dietContext });
    }
  }

  return {
    goalId,
    goalName: (goal as any).title || (goal as any).name || goalId,
    nutrients,
    foods: normalizedFoods,
    explanation,
  };
}

/**
 * Convenience: build suggestions for common goals.
 */
export async function buildCommonGoalSuggestions(goalNames: string[], includeAI = true) {
  const out: GoalSuggestion[] = [];
  for (const name of goalNames) {
    const g = await buildGoalSuggestions(name, { includeAI });
    if (g) out.push(g);
  }
  return out;
}

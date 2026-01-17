import goalsRaw from '../../data/goalMappings.json';

export interface Goal {
  goalId: string;
  goalName: string;
  keyNutrients: string[];
  topFoods: string[];
  targetMacros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

let goals: Goal[] | null = null;

export function loadGoals(): Goal[] {
  if (goals) return goals;

  goals = (goalsRaw as any).mappings || [];
  return goals;
}

export function getGoalById(goalId: string): Goal | undefined {
  return loadGoals().find(g => g.goalId === goalId);
}

export function getGoalsByName(name: string): Goal | undefined {
  return loadGoals().find(g => g.goalName.toLowerCase() === name.toLowerCase());
}

export function getAllGoals(): Goal[] {
  return loadGoals();
}

export function getKeyNutrients(goalId: string): string[] {
  const goal = getGoalById(goalId);
  return goal?.keyNutrients || [];
}

export function getTopFoodsForGoal(goalId: string): string[] {
  const goal = getGoalById(goalId);
  return goal?.topFoods || [];
}

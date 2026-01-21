
import { loadFoodData, Food } from '../data/loadFoodData';

/**
 * Searches for food items in the database.
 * Matches against name and all aliases (case-insensitive).
 */
export function searchFoodDictionary(query: string): Food[] {
  if (!query.trim()) return [];
  
  const foods = loadFoodData();
  const normalizedQuery = query.toLowerCase().trim();

  return foods
    .filter(food => {
      const nameMatch = food.name.toLowerCase().includes(normalizedQuery);
      const aliasMatch = food.aliases.some(alias => 
        alias.toLowerCase().includes(normalizedQuery)
      );
      return nameMatch || aliasMatch;
    })
    .sort((a, b) => {
      // Prioritize exact name matches
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      if (aName === normalizedQuery && bName !== normalizedQuery) return -1;
      if (bName === normalizedQuery && aName !== normalizedQuery) return 1;
      
      // Then prioritize items that start with the query
      const aStarts = aName.startsWith(normalizedQuery);
      const bStarts = bName.startsWith(normalizedQuery);
      if (aStarts && !bStarts) return -1;
      if (bStarts && !aStarts) return 1;

      return 0;
    });
}

/**
 * Parses fuzzy input for potential food matches.
 * Used by voice and image fallback.
 */
export function findBestMatch(input: string): Food | null {
  const results = searchFoodDictionary(input);
  return results.length > 0 ? results[0] : null;
}

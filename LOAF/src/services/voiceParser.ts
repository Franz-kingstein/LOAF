import { findBestMatch } from './foodMatcher';

/**
 * Very basic voice parser to extract food name from transcript.
 * For now, it just cleans the text and tries to find a match.
 * Later this can be expanded with NLP/Regex for portions like "Two idlis".
 */
export function parseVoiceTranscript(transcript: string) {
  const cleaned = transcript.toLowerCase().trim();
  
  // Basic removal of common filler words
  const fillers = ["i had", "i ate", "a", "an", "and", "one", "two", "three"];
  
  // Advanced number detection for "double", "two", etc.
  const quantityMap: Record<string, number> = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "double": 2, "triple": 3, "half": 0.5, "quarter": 0.25,
    "1": 1, "2": 2, "3": 3, "4": 4, "5": 5
  };

  let detectedQuantity = 1;

  // Check for quantities at the beginning
  const words = cleaned.split(' ');
  if (words.length > 0 && quantityMap[words[0]]) {
    detectedQuantity = quantityMap[words[0]];
  }

  // Try to find if any part of the transcript matches a food
  for (let i = 0; i < words.length; i++) {
    // If we detected a quantity at index 0, start searching for food from index 1
    const startIndex = (i === 0 && detectedQuantity !== 1) ? 1 : i;
    const potentialFood = words.slice(startIndex).join(' ');
    
    // Clean fillers from the start of the food query
    let fixedQuery = potentialFood;
    fillers.forEach(f => {
        if (fixedQuery.startsWith(f + ' ')) {
            fixedQuery = fixedQuery.replace(f + ' ', '').trim();
        }
    });

    const match = findBestMatch(fixedQuery);
    if (match) {
      return {
        food: match,
        detectedQuantity
      };
    }
  }

  return null;
}

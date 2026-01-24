interface AISuggestion {
  food: string;
  reason: string;
}

interface AIResponse {
  suggestions: AISuggestion[];
  hydrationTip: string;
}

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
const MODEL = 'anthropic/claude-3-haiku:beta';

export async function getFoodSuggestions(context: {
  goals: string[];
  todayMeals: string[];
  nutrientGaps: string[];
  allowedFoods: string[];
}): Promise<AIResponse | null> {
  if (!OPENROUTER_API_KEY) {
    console.error('OpenRouter API key not found');
    return null;
  }

  try {
    const systemPrompt = `You are a nutrition assistant for a food tracking app.
Only recommend foods provided in the allowed list.
Do not give medical advice.
Keep suggestions short and practical.`;

    const userPrompt = `User goals: ${context.goals.join(', ')}
Today's meals: ${context.todayMeals.join(', ')}
Nutrient gaps: ${context.nutrientGaps.join(', ')}
Allowed foods: ${context.allowedFoods.join(', ')}

Provide 2-3 food suggestions with reasons, and one hydration tip. Respond in JSON format:
{
  "suggestions": [
    {
      "food": "food name",
      "reason": "brief reason"
    }
  ],
  "hydrationTip": "hydration advice"
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return null;
    }

    // Parse JSON response
    try {
      const parsed = JSON.parse(content);
      return parsed as AIResponse;
    } catch {
      return null;
    }
  } catch (error) {
    console.error('AI suggestion error:', error);
    return null;
  }
}

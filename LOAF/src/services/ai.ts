import Constants from 'expo-constants';

type NutrientSummary = {
  gaps: Array<{ nutrient: string; severity: 'low' | 'moderate' | 'high' }>; // summarized only
  dietContext?: string; // short descriptor, e.g., "regular Indian food"
};

const GEMINI_API_KEY: string | undefined =
  process.env.GEMINI_API_KEY || Constants?.expoConfig?.extra?.geminiApiKey;

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

function buildSystemRules() {
  return (
    'You are a friendly nutrition assistant.\n' +
    '- Use a supportive, non-judgmental tone.\n' +
    '- Suggest small additions, not removals.\n' +
    '- Do not calculate nutrition; rely only on summarized gaps provided.\n' +
    '- Consider typical Indian food context when mentioned.\n'
  );
}

async function callGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null; // Optional layer

  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${buildSystemRules()}\n\n${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    return text;
  } catch (e) {
    return null;
  }
}

export async function explainNutrientGaps(summary: NutrientSummary): Promise<string | null> {
  const context = summary.dietContext ? `Diet context: ${summary.dietContext}.` : '';
  const gapsList = summary.gaps.map(g => `${g.nutrient} (${g.severity})`).join(', ');
  const prompt = `Explain the following nutrient gaps briefly and kindly. ${context}\nGaps: ${gapsList}.`;
  return await callGemini(prompt);
}

export async function suggestSmallAdditions(summary: NutrientSummary): Promise<string | null> {
  const context = summary.dietContext ? `Diet context: ${summary.dietContext}.` : '';
  const gapsList = summary.gaps.map(g => `${g.nutrient} (${g.severity})`).join(', ');
  const prompt = `User has ${gapsList}. ${context}\nSuggest small Indian-friendly additions (e.g., a spoonful, one item) without removing foods.`;
  return await callGemini(prompt);
}

export async function answerUserQuestion(summary: NutrientSummary, question: string): Promise<string | null> {
  const context = summary.dietContext ? `Diet context: ${summary.dietContext}.` : '';
  const gapsList = summary.gaps.map(g => `${g.nutrient} (${g.severity})`).join(', ');
  const prompt = `Based on summarized gaps: ${gapsList}. ${context}\nAnswer the user question: "${question}". Be concise, friendly, and avoid precise calculations.`;
  return await callGemini(prompt);
}

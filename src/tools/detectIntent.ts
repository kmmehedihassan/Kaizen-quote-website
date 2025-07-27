// src/tools/detectIntent.ts

export interface IntentResult {
  mood: "motivational" | "romantic" | "funny";
}

const KEYWORDS: Record<IntentResult["mood"], RegExp[]> = {
  motivational: [
    /\b(inspire|motivat|achieve|goal|success|dream|encourage)\b/i,
  ],
  romantic: [
    /\bromantic\b/i,                     // explicitly match “romantic”
    /\b(love|kiss|heart|darling|date)\b/i,
  ],
  funny: [
    /\b(joke|funny|lol|haha|laugh|silly|comic)\b/i,
  ],
};

export function detectIntent(message: string): IntentResult {
  for (const mood of Object.keys(KEYWORDS) as IntentResult["mood"][]) {
    for (const re of KEYWORDS[mood]) {
      if (re.test(message)) {
        return { mood };
      }
    }
  }
  // No match → default to motivational
  return { mood: "motivational" };
}

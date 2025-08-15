// src/tools/hfMood.ts
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_KEY!);

export async function detectMoodWithHF(
  message: string
): Promise<"motivational" | "romantic" | "funny"> {
  // We’ll use a small instruction-tuned T5 to classify into exactly one word
  const prompt = `
Classify the user’s mood.  
Reply with exactly one word: motivational, romantic, or funny.
User: "${message}"
Answer:
`.trim();

  const res = await hf.textGeneration({
    model: "google/flan-t5-small",
    inputs: prompt,
    parameters: {
      max_new_tokens: 4,
      temperature: 0.0,
    },
  });

  // The HF JS client returns an array of generations; grab the first
  const raw = res.generated_text.trim().toLowerCase().split(/\s+/)[0];
  return raw === "romantic" || raw === "funny" ? raw : "motivational";
}

// src/tools/ollamaMood.ts
export async function detectMoodWithOllama(message: string): Promise<"motivational" | "romantic" | "funny"> {
  const HOST = process.env.OLLAMA_HOST!
  const res = await fetch(`${HOST}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama2:latest",
      messages: [
        {
          role: "system",
          content: `
You are a mood detector.  
EXAMPLES:
- "That joke cracked me up" → funny  
- "I’m feeling so inspired today" → motivational  
- "You have a lovely smile" → romantic  

Now: given a single user message, reply with EXACTLY one word: motivational, romantic, or funny.
          `.trim(),
        },
        { role: "user", content: message },
      ],
      max_tokens: 4,
      temperature: 0.0,
    }),
  })
  const j = await res.json()
  const raw = (j.choices?.[0]?.message?.content ?? "").trim().toLowerCase()
  const token = raw.split(/\s+/)[0]
  return token === "romantic" || token === "funny" ? token : "motivational"
}

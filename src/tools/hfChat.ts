// src/tools/hfChat.ts
export async function chatWithHF(prompt: string): Promise<string> {
  const model = process.env.HF_MODEL || "deepseek-ai/DeepSeek-R1:together";
  const token = process.env.HF_API_KEY;
  if (!token) throw new Error("HF_API_KEY missing");

  const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 256,
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HF router ${res.status} ${res.statusText} — ${text.slice(0,200)}`);
  }
  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  // DeepSeek R1 sometimes emits <think>…</think>; hide it for users:
  return content.replace(/<think>[\s\S]*?<\/think>\s*/g, "").trim();
}

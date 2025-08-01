// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { exec as navExec } from "@/tools/navigate";

const GREET_RE = /\b(hi|hello|hey|good (morning|afternoon|evening))\b/i;

// a simple inline “strict” intent detector just for routing:
function detectExplicitMood(text: string): "motivational" | "romantic" | "funny" | null {
  const t = text.toLowerCase();
  if (/\b(romantic|love|kiss|heart|darling|date)\b/.test(t)) return "romantic";
  if (/\b(funny|joke|lol|haha|laugh|silly|comic)\b/.test(t)) return "funny";
  if (/\b(motivat(e|ional)?|inspire|achieve|goal|success|dream|encourage)\b/.test(t))
    return "motivational";
  return null;
}

export async function POST(request: NextRequest) {
  const { sessionId, message } = (await request.json()) as {
    sessionId: string;
    message: string;
  };

  // 1) Upsert session and save the incoming user message
  await db.session.upsert({
    where: { id: sessionId },
    update: {},
    create: { id: sessionId },
  });
  await db.message.create({
    data: { sessionId, role: "user", content: message },
  });

  // 2) How many messages do we have now?
  const historyCount = await db.message.count({ where: { sessionId } });

  // 3) Very first greeting → friendly opener, NO routing
  if (historyCount === 1 && GREET_RE.test(message)) {
    const assistantMsg =
      "👋 Hi there! I’m KaizenAI—your personal quote companion. Ask me anything, or say “motivate me”, “I want a funny quote”, or “I need love” to jump to the right page.";
    await db.message.create({
      data: { sessionId, role: "assistant", content: assistantMsg },
    });
    return NextResponse.json({ assistantMsg, route: null });
  }

  // 4) If the user explicitly mentions a mood keyword, route immediately
  const explicitMood = detectExplicitMood(message);
  if (explicitMood) {
    const assistantMsg = `Redirecting you to the ${explicitMood} quotes page…`;
    const route = navExec({ mood: explicitMood }).route;
    await db.message.create({
      data: { sessionId, role: "assistant", content: assistantMsg },
    });
    return NextResponse.json({ assistantMsg, route });
  }

  // 5) Otherwise, do a “normal” chat with Ollama
  const history = await db.message.findMany({
    where: { sessionId },
    orderBy: { timestamp: "asc" },
  });
  const llmMessages = [
    {
      role: "system",
      content:
        "You are KaizenAI, a friendly quote-bot. Chat naturally, but do not ever invent page URLs yourself.",
    },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  let assistantMsg = "Sorry, something went wrong.";
  try {
    const res = await fetch(`${process.env.OLLAMA_HOST}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama2:latest",
        messages: llmMessages,
        temperature: 0.7,
        max_tokens: 128,
      }),
    });
    const j = await res.json();
    assistantMsg = j.choices?.[0]?.message?.content.trim() ?? assistantMsg;
  } catch (e) {
    console.error("Ollama error:", e);
  }

  // 6) Persist & return—no routing on pure chat turns
  await db.message.create({
    data: { sessionId, role: "assistant", content: assistantMsg },
  });
  return NextResponse.json({ assistantMsg, route: null });
}

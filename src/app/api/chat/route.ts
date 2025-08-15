// src/app/api/chat/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { Message } from "@prisma/client";
import { db } from "@/lib/prisma";
import { exec as navExec } from "@/tools/navigate";
import { chatWithHF } from "@/tools/hfChat";

type Mood = "motivational" | "romantic" | "funny";
const GREET_RE = /\b(hi|hello|hey|good (morning|afternoon|evening))\b/i;
const YES_RE = /\b(yes|yep|sure|okay|ok|go ahead|do it|open|take me)\b/i;
const NO_RE  = /\b(no|nope|not now|later|stop|cancel)\b/i;  

function detectExplicitMood(text: string): Mood | null {
  const t = text.toLowerCase();
  if (/\b(romantic|love|kiss|heart|darling|date)\b/.test(t)) return "romantic";
  if (/\b(funny|joke|lol|haha|laugh|silly|comic)\b/.test(t)) return "funny";
  if (/\b(motivat(e|ional)?|inspire|achieve|goal|success|dream|encourage)\b/.test(t)) return "motivational";
  return null;
}

export async function POST(request: Request) {
  type Body = { sessionId: string; message: string };
  const { sessionId, message }: Body = await request.json();

  // Optional visibility on first run
  console.log("HF env:", {
    HF_API_KEY: process.env.HF_API_KEY ? "set" : "missing",
    HF_MODEL: process.env.HF_MODEL ?? "(default in code)",
  });

  // Ensure session + store user message (don’t crash if DB not ready)
  try {
    await db.session.upsert({ where: { id: sessionId }, update: {}, create: { id: sessionId } });
    await db.message.create({ data: { sessionId, role: "user", content: message } });
  } catch (e) { console.error("DB write (user) error:", e); }

  // First-greeting branch
  try {
    const count: number = await db.message.count({ where: { sessionId } });
    if (count === 1 && GREET_RE.test(message)) {
      const assistantMsg =
        "👋 Hi there! I’m KaizenAI—your personal quote companion. Ask me anything, or say “motivate me”, “I want a funny quote”, or “I need love” to jump to the right page.";
      try { await db.message.create({ data: { sessionId, role: "assistant", content: assistantMsg } }); } catch {}
      return NextResponse.json({ assistantMsg, route: null });
    }
  } catch {}

  // Keyword routing
  const explicitMood = detectExplicitMood(message);
  if (explicitMood) {
    const assistantMsg = `Redirecting you to the ${explicitMood} quotes page…`;
    const route = navExec({ mood: explicitMood }).route;
    try { await db.message.create({ data: { sessionId, role: "assistant", content: assistantMsg } }); } catch {}
    return NextResponse.json({ assistantMsg, route });
  }

  // Chat via Hugging Face
  let history: Message[] = [];
  try {
    history = await db.message.findMany({ where: { sessionId }, orderBy: { timestamp: "asc" } });
  } catch {}

  const transcript: string = history
    .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
    .concat([`User: ${message}`, "Assistant:"])
    .join("\n");

  let assistantMsg = "Sorry, something went wrong.";
  try {
    assistantMsg = await chatWithHF(transcript); // returns string
  } catch (e: any) {
    console.error("HF error:", e?.message ?? e);
  }

  try { await db.message.create({ data: { sessionId, role: "assistant", content: assistantMsg } }); } catch {}
  return NextResponse.json({ assistantMsg, route: null });
}

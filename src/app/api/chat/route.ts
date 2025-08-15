export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { exec as navExec } from "@/tools/navigate";
import { chatWithHF } from "@/tools/hfChat";

type Mood = "motivational" | "romantic" | "funny";
const GREET_RE = /\b(hi|hello|hey|good (morning|afternoon|evening))\b/i;

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

  try {
    await db.session.upsert({ where: { id: sessionId }, update: {}, create: { id: sessionId } });
    await db.message.create({ data: { sessionId, role: "user", content: message } });
  } catch (e) { console.error("DB write (user) error:", e); }

  try {
    const count = await db.message.count({ where: { sessionId } });
    if (count === 1 && GREET_RE.test(message)) {
      const assistantMsg =
        "👋 Hi there! I’m KaizenAI—your personal quote companion. Ask me anything, or say “motivate me”, “I want a funny quote”, or “I need love” to jump to the right page.";
      try { await db.message.create({ data: { sessionId, role: "assistant", content: assistantMsg } }); } catch {}
      return NextResponse.json({ assistantMsg, route: null });
    }
  } catch {}

  const explicitMood = detectExplicitMood(message);
  if (explicitMood) {
    const assistantMsg = `Redirecting you to the ${explicitMood} quotes page…`;
    const route = navExec({ mood: explicitMood }).route;
    try { await db.message.create({ data: { sessionId, role: "assistant", content: assistantMsg } }); } catch {}
    return NextResponse.json({ assistantMsg, route });
  }

  // ⬇️ Derive the element type from findMany (no import from @prisma/client needed)
  const history = await db.message.findMany({
    where: { sessionId },
    orderBy: { timestamp: "asc" },
  });
  type DbMessage = typeof history[number];

  const transcript = history
    .map((m: DbMessage) => `${m.role === "assistant" ? "Assistant" : "User"}: ${m.content}`)
    .concat([`User: ${message}`, "Assistant:"])
    .join("\n");

  let assistantMsg = "Sorry, something went wrong.";
  try { assistantMsg = await chatWithHF(transcript); } catch (e: any) { console.error("HF error:", e?.message ?? e); }

  try { await db.message.create({ data: { sessionId, role: "assistant", content: assistantMsg } }); } catch {}
  return NextResponse.json({ assistantMsg, route: null });
}

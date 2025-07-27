import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { exec as navExec } from "@/tools/navigate";
import { detectIntent } from "@/tools/detectIntent";

const GREET_RE = /\b(hi|hello|hey|good (morning|afternoon|evening))\b/i;

export async function POST(request: NextRequest) {
  const { sessionId, message } = (await request.json()) as {
    sessionId: string;
    message: string;
  };

  // 1) Persist user & ensure session exists
  await db.session.upsert({
    where: { id: sessionId },
    create: { id: sessionId },
    update: {},
  });
  await db.message.create({
    data: { sessionId, role: "user", content: message },
  });

  // 2) Debug log
  const historyCount = await db.message.count({ where: { sessionId } });
  console.log("🕵️ greeting debug:", { sessionId, historyCount, message });

  // 3) If very first message is a greeting, send back only a greeting
  if (historyCount === 1 && GREET_RE.test(message)) {
    const assistantMsg = "👋 Hi there! I’m KaizenAI. How are you feeling today?";
    await db.message.create({
      data: { sessionId, role: "assistant", content: assistantMsg },
    });
    return NextResponse.json({ assistantMsg, route: null });
  }

  // 4) Otherwise detect mood and redirect
  const { mood } = detectIntent(message);
  const assistantMsg = `Here are some ${mood} quotes.`;
  const route = navExec({ mood }).route;

  await db.message.create({
    data: { sessionId, role: "assistant", content: assistantMsg },
  });
  return NextResponse.json({ assistantMsg, route });
}

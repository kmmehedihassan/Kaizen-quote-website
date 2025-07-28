// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/prisma";
import { exec as navExec } from "@/tools/navigate";
import { detectIntent } from "@/tools/detectIntent";

// only match if the entire message is exactly one of these greetings:
const PURE_GREET_RE =
  /^\s*(?:hi|hello|hey|good (?:morning|afternoon|evening))\s*$/i;

export async function POST(request: NextRequest) {
  const { sessionId, message } = (await request.json()) as {
    sessionId: string;
    message: string;
  };

  // 1) Upsert session & save user message
  await db.session.upsert({
    where: { id: sessionId },
    create: { id: sessionId },
    update: {},
  });
  await db.message.create({
    data: { sessionId, role: "user", content: message },
  });

  // 2) If the user just greeted us, reply and do NOT navigate
  if (PURE_GREET_RE.test(message)) {
    const assistantMsg =
      "👋 Hi there! I’m KaizenAI. How are you feeling today? Reply ONE word: motivational, romantic, or funny.";
    await db.message.create({
      data: { sessionId, role: "assistant", content: assistantMsg },
    });
    return NextResponse.json({ assistantMsg, route: null });
  }

  // 3) Otherwise, detect mood and route as before
  const { mood } = detectIntent(message);
  const assistantMsg = `Here are some ${mood} quotes.`;
  const route = navExec({ mood }).route;

  await db.message.create({
    data: { sessionId, role: "assistant", content: assistantMsg },
  });
  return NextResponse.json({ assistantMsg, route });
}

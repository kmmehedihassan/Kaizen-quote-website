// src/app/api/chat/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { detectIntent } from "@/tools/detectIntent";
import { exec as navExec } from "@/tools/navigate";
import { db } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { sessionId, message } = (await request.json()) as {
    sessionId: string;
    message: string;
  };

  // 1) Ensure session & persist user message
  await db.session.upsert({
    where: { id: sessionId },
    update: {},
    create: { id: sessionId },
  });
  await db.message.create({
    data: { sessionId, role: "user", content: message },
  });

  // 2) Detect mood locally
  const { mood } = detectIntent(message);

  // 3) Build reply & compute route
  const assistantMsg = `Got it—here are some ${mood} quotes.`;
  const route = navExec({ mood }).route;

  // 4) Persist assistant message
  await db.message.create({
    data: { sessionId, role: "assistant", content: assistantMsg },
  });

  // 5) Return JSON
  return NextResponse.json({ assistantMsg, route });
}

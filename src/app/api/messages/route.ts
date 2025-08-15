import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/prisma";

type ChatItem = { role: string; content: string }; // minimal shape you return

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId") || "";

  const records = await db.message.findMany({
    where: { sessionId },
    orderBy: { timestamp: "asc" },
  });
  type DbMessage = typeof records[number];

  // type the parameter so noImplicitAny is happy
  const history: ChatItem[] = records.map(
    ({ role, content }: DbMessage) => ({ role, content })
  );

  return NextResponse.json(history);
}

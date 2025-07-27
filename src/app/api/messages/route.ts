// src/app/api/messages/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId") || "";
  const records = await db.message.findMany({
    where: { sessionId },
    orderBy: { timestamp: "asc" },
  });

  // Only send back the fields the client needs:
  const history = records.map(({ role, content }) => ({ role, content }));
  return NextResponse.json(history);
}

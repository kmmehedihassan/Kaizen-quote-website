// src/app/api/messages/route.ts
//Load all past chat messages for a given session
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // 1. Read sessionId from the query string
  const sessionId = request.nextUrl.searchParams.get("sessionId") || "";
  // 2. Fetch all Message records from Prisma, in timestamp order
  const records = await db.message.findMany({
    where: { sessionId },
    orderBy: { timestamp: "asc" },
  });

 // 3. Strip out only the fields the client needs (role + content)
  const history = records.map(({ role, content }) => ({ role, content }));
  return NextResponse.json(history); // 4. Return JSON array of { role, content }
}

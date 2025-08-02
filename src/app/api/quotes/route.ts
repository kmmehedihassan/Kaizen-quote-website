// src/app/api/quotes/route.ts
// API route to fetch quotes by category
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") ?? "";
  const quotes = await db.quote.findMany({
    where: { category },
  });
  return NextResponse.json(quotes);
}

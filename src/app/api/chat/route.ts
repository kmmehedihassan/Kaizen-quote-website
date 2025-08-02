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

export async function POST(request: NextRequest) { // Handle incoming chat messages
  // 0) Validate request body
  const { sessionId, message } = (await request.json()) as {
    sessionId: string;
    message: string;
  };

  // 1) Upsert session and save the incoming user message
  // Ensure session exists in the database
  await db.session.upsert({
    where: { id: sessionId },
    update: {},
    create: { id: sessionId },
  });
  // Save the user’s message in the Message table
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
  // Load all past chat messages for this session
  // and send them to the LLM along with the new user message
  const history = await db.message.findMany({
    where: { sessionId },
    orderBy: { timestamp: "asc" },
  });
  // If we have no history, just use the user message
  // Gives the model its “persona” and hard rules.// If we have history, include it
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
    // Call the Ollama API to get a response
    //“chat completion” API, which expects a conversation payload and returns a generated reply.
    const res = await fetch(`${process.env.OLLAMA_HOST}/v1/chat/completions`, { //Comes from your .env.local http://127.0.0.1:11434.
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama2:latest",
        messages: llmMessages,
        temperature: 0.7, // Allow some creativity(randomness)
        max_tokens: 128, // Limit response length
      }),
    });
    const j = await res.json(); // Parse the response from Ollama
    assistantMsg = j.choices?.[0]?.message?.content.trim() ?? assistantMsg;
  } catch (e) {
    console.error("Ollama error:", e);
  }

  // 6) Persist & return—no routing on pure chat turns
  await db.message.create({
    data: { sessionId, role: "assistant", content: assistantMsg },// Save the assistant's response
  });
  return NextResponse.json({ assistantMsg, route: null });// Return the response to the client
}

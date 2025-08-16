# KaizenAI Quotes

AI-powered quotes + a smart chatbot that routes you to **motivational**, **romantic**, or **funny** quotes based on your input or mood.

**Live:** [https://kaizen-quote-website.vercel.app](https://kaizen-quote-website.vercel.app)

---

## Features

* **Natural chat**

  * Greets on first “hi/hello/hey”
  * Answers small talk & trivia 
  * Saves conversation history per session
* **Mood-based routing**

  * Detects keywords (e.g., *motivational*, *love*, *joke*) and navigates to the right page
* **Agentic flow**

  * Lightweight “tools”: intent detection (regex/HF) + navigator
* **Typed API routes**

  * Next.js App Router **Route Handlers** in `app/api/**`
* **Persistent storage**

  * Prisma models: `Session`, `Message`, `Quote` (PostgreSQL)

---

## Tech Stack

* **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
* **Backend:** Next.js Route Handlers (`app/api/**/route.ts`)
* **DB/ORM:** Prisma + PostgreSQL (Accelerate in prod)
* **LLM:** Hugging Face Inference Providers (OpenAI-compatible Chat Completions)
* **Hosting:** Vercel

---

## Getting Started (Local)

### 1) Prerequisites

* Node.js ≥ 18
* npm or Yarn
* A PostgreSQL database (e.g., Prisma Postgres / Supabase / Neon)
* A Hugging Face token (`HF_API_KEY`)

### 2) Clone & Install

```bash
git clone <your-fork-or-repo>
cd kaizen-quote-website
npm install
```

### 3) Environment Variables (create `.env` at project root)

> For **local dev**, use a *plain* Postgres URL (must include a DB name after `:5432/`).

```env
# --- Database (local dev) ---
DATABASE_URL="postgresql://USER:PASS@HOST:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://USER:PASS@HOST:5432/postgres?sslmode=require"

# --- Hugging Face ---
HF_API_KEY=your_hf_token
HF_MODEL="together/deepseek-ai/DeepSeek-V3-0324"  # example; swap to any supported model

# --- App ---
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 4) Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
# (optional) npx prisma studio
```

### 5) Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy (Vercel)

1. **Environment Variables (Project → Settings → Environment Variables)**

   * `DATABASE_URL` → **Accelerate** (pooled) URL (e.g., `prisma+postgres://accelerate.prisma-data.net/?api_key=...`)
   * `DIRECT_URL`   → **plain** Postgres URL (e.g., `postgresql://USER:PASS@HOST:5432/postgres?sslmode=require`)
   * `HF_API_KEY`   → your HF token
   * `HF_MODEL`     → model, e.g. `together/deepseek-ai/DeepSeek-V3-0324`
   * `NEXT_PUBLIC_API_URL` → your site URL

2. **Prisma schema** (already configured)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")  // pooled in prod
  directUrl = env("DIRECT_URL")    // direct for migrations
}

generator client { provider = "prisma-client-js" }
```

3. **Build Command**

```bash
npx prisma generate && npx prisma migrate deploy && npx next build
```

4. **Deploy**

* Push to the connected Git repo (Vercel auto-builds), or
* `vercel --prod`

---

## API Endpoints

* **POST** `/api/chat`
  Body: `{ "sessionId": string, "message": string }`
  Behavior:

  * If greeting → friendly opener (no routing)
  * If mood keyword → returns `{ assistantMsg, route }` (client navigates)
  * Else → chats via Hugging Face; returns `{ assistantMsg }`

* **GET** `/api/messages?sessionId=...`
  Returns ordered `{ role, content }[]` for that session.

* **GET** `/api/quotes?category=motivational|romantic|funny`
  Returns quotes by category.

---

## Project Structure (high level)

```
src/
  app/
    api/
      chat/route.ts        # chat + routing
      messages/route.ts    # session history
      quotes/route.ts      # quotes by category
    (pages...)             # /, /motivational, /romantic, /funny
  components/              # ChatDrawer, NavBar, etc.
lib/
  prisma.ts                # Prisma client singleton
prisma/
  schema.prisma
  seed.ts
```

---

## Troubleshooting

* **“URL must start with `postgresql://`” (local)**
  Your local `DATABASE_URL` is using an Accelerate scheme. Use **plain** Postgres locally and keep Accelerate for production.

* **Missing DB name**
  Ensure your URL **includes** a DB name after the port: `...:5432/<DBNAME>?...` (e.g., `/postgres`).

* **500 + “Unexpected end of JSON” in pages**
  Usually the API route threw due to DB/LLM env issues. Check server logs, fix envs, and retry.

* **Type errors after schema changes**
  Run `npx prisma generate` and restart the dev server (and sometimes your editor’s TS server).

---

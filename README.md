# KaizenAI Quotes

An AI-powered quote website with an intelligent chatbot that guides users to motivational, romantic, or funny quotes based on their input or mood.

## 🚀 Features

- **Natural chat interface**  
  - Greets you on first “hi/hello/hey”  
  - Chats naturally on arbitrary questions  
  - Persists conversation history across reloads  
- **Mood-based navigation**  
  - Detects explicit mood keywords (`motivational`, `romantic`, `funny`, or synonyms like “love”, “kiss”, “joke”, “motivate”)  
  - Redirects to the appropriate quotes page when a mood is mentioned  
- **Agentic workflow**  
  - Two “tools”:  
    1. **Intent detector** (`detectIntent` + regex fallback)  
    2. **Navigator** (`navExec`)  
- **Local LLM integration**  
  - Uses [Ollama](https://ollama.com/) + `llama2:latest` for free‐form chat when no mood keyword is detected  
- **Prisma + SQLite** for session & message persistence  

## 📦 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS  
- **Backend**: Next.js API Routes (server-components), Ollama HTTP API  
- **Database**: Prisma ORM with SQLite (`dev.db`)  
- **LLM**: Ollama (`llama2:latest`) running locally  

## 🔧 Prerequisites

- Node.js ≥ 18  
- Yarn or npm  
- [Ollama CLI & runtime](https://ollama.com/) installed and running  
- A local Ollama model—e.g.:  
  ```bash
  ollama pull llama2
  ollama serve
  # by default listens on http://127.0.0.1:11434

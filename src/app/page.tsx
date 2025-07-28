// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-4xl font-bold">Hello,I am a great at detecting Mood!</h1>
      <nav className="flex gap-4">
        <Link
          href="/motivational"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          🧠 Motivational
        </Link>
        <Link
          href="/romantic"
          className="px-4 py-2 bg-pink-500 text-white rounded"
        >
          💖 Romantic
        </Link>
        <Link
          href="/funny"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          😂 Funny
        </Link>
      </nav>
    </main>
  );
}

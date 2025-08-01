// src/components/Navbar.tsx
"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex space-x-6">
        <Link href="/" className="font-semibold hover:text-blue-600">
          Home
        </Link>
        <Link href="/motivational" className="hover:text-yellow-600">
          🧠 Motivational
        </Link>
        <Link href="/romantic" className="hover:text-pink-600">
          💖 Romantic
        </Link>
        <Link href="/funny" className="hover:text-green-600">
          😂 Funny
        </Link>
      </div>
    </nav>
  );
}

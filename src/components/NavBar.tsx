"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="bg-white shadow p-4">
      <div className="container mx-auto flex space-x-6">
        <Link href="/" className="font-bold text-lg">
          Kaizen Quotes
        </Link>
        <Link href="/motivational">Motivational</Link>
        <Link href="/romantic">Romantic</Link>
        <Link href="/funny">Funny</Link>
      </div>
    </nav>
  );
}

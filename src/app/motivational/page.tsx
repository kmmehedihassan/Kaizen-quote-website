// src/app/motivational/page.tsx
export const revalidate = 60; // rebuild this page at most once every 60 seconds

import { QuoteCard } from "@/components/QuoteCard";

async function getQuotes() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/quotes?category=motivational`,
    { cache: "no-store" }
  );
  return res.json();
}

export default async function MotivationalPage() {
  const quotes: {
    id: number;
    category: string;
    text: string;
    author: string;
  }[] = await getQuotes();

  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold mb-4">Motivational Quotes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quotes.map((q) => (
          <QuoteCard key={q.id} {...q} />
        ))}
      </div>
    </section>
  );
}

// src/app/funny/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds
import { QuoteCard } from "@/components/QuoteCard";

type Quote = {
  id: number;
  text: string;
  author: string;
  category: string;
};

export default async function FunnyPage() {
  // Force fresh fetch each request
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/quotes?category=funny`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Failed to load funny quotes");
  }
  const quotes: Quote[] = await res.json();

  return (
    <section className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <h1 className="text-3xl font-bold mb-4">😂 Funny Quotes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quotes.map((q) => (
          <QuoteCard key={q.id} {...q} />
        ))}
      </div>
    </section>
  );
}

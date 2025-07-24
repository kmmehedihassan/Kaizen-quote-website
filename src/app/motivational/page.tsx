// src/app/motivational/page.tsx
import { QuoteCard } from "../../components/QuoteCard";

type Quote = {
  id: number;
  text: string;
  author: string;
  category: string;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default async function MotivationalPage() {
  const res = await fetch(
    `${BASE_URL}/api/quotes?category=motivational`,
    { cache: "no-store" }
  );
  const quotes: Quote[] = await res.json();

  return (
    <section className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <h1 className="text-3xl font-bold mb-4">Motivational Quotes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quotes.map((q) => (
          <QuoteCard key={q.id} {...q} />
        ))}
      </div>
    </section>
  );
}

// src/app/romantic/page.tsx
import { QuoteCard } from "@/components/QuoteCard";

async function getQuotes() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/quotes?category=romantic`,
    { cache: "no-store" }
  );
  return res.json();
}

export default async function RomanticPage() {
  const quotes: {
    id: number;
    category: string;
    text: string;
    author: string;
  }[] = await getQuotes();

  return (
    <section className="p-8">
      <h1 className="text-3xl font-bold mb-4">Romantic Quotes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quotes.map((q) => (
          <QuoteCard key={q.id} {...q} />
        ))}
      </div>
    </section>
  );
}

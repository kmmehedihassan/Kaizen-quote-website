// src/components/QuoteCard.tsx
import React from "react";

export interface QuoteCardProps {
  id: number;
  text: string;
  author: string;
  category: string;
}

export function QuoteCard({ text, author, category }: QuoteCardProps) {
  // pick a light background per category
  const bgClass = {
    motivational: "bg-yellow-50",
    romantic:     "bg-pink-50",
    funny:        "bg-green-50",
  }[category] ?? "bg-white";

  return (
    <div className={`p-6 shadow-lg rounded-2xl ${bgClass}`}>
      <p className="italic text-lg">“{text}”</p>
      <p className="mt-4 text-right font-semibold">— {author}</p>
    </div>
  );
}

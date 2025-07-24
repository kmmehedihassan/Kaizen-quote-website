// prisma/seed.ts
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

const quotes = [
  { category: 'motivational', text: 'Believe you can and you’re halfway there.', author: 'Theodore Roosevelt' },
  { category: 'motivational', text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { category: 'romantic',     text: 'Love all, trust a few, do wrong to none.',           author: 'William Shakespeare' },
  { category: 'funny',        text: 'I am so clever that sometimes I don’t understand a single word of what I am saying.', author: 'Oscar Wilde' },
  // …add more quotes as needed
];

async function main() {
  // wipe out old quotes
  await db.quote.deleteMany();

  // insert one by one
  for (const q of quotes) {
    await db.quote.create({ data: q });
  }

  console.log(`🌱 Seeded ${quotes.length} quotes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });

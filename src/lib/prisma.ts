// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // ensures we reuse the client in development
  // eslint-disable-next-line no-var
  // This is a global variable to hold the Prisma client instance
  var prisma: PrismaClient | undefined;
}

export const db: PrismaClient =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // optional: shows SQL in terminal
  });

// In development, attach to the global object so we don't create
// a new client on every HMR reload:
if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
}

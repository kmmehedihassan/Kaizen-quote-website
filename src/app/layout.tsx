// src/app/layout.tsx
import "./globals.css";
import { Navbar } from "@/components/NavBar";
import { ChatDrawer } from "@/components/ChatDrawer";

export const metadata = {
  title: "Kaizen Quotes",
  description: "An AI-powered quote site",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        <ChatDrawer />
      </body>
    </html>
  );
}

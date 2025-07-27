// src/app/layout.tsx
import "./globals.css";
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
        {children}
        <ChatDrawer />
      </body>
    </html>
  );
}

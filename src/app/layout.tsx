// src/app/layout.tsx

import { ChatDrawer } from "@/components/ChatDrawer";
import "./globals.css";

export const metadata = {
  title: "Kaizen Quotes",
  description: "AI-powered quote site",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}
        {/* Chat widget available on all pages */}
       <div id="chat-drawer">
         {/* @ts-ignore */}
         <ChatDrawer />
       </div>
      </body>
    </html>
  );
}

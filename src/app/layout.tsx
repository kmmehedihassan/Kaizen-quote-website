import "./globals.css";
import NavBar from "@/components/NavBar";
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
        <NavBar />
        {children}
        <ChatDrawer />
      </body>
    </html>
 );
}
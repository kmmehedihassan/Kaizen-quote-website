// src/app/layout.tsx

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
        
      </body>
    </html>
  );
}

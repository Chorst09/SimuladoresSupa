import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'Precificacao de TI',
  description: 'Precificacao de TI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen min-w-screen w-full h-full bg-gradient-to-br from-primary/10 via-secondary/30 to-accent/10">
        <main className="w-full h-full min-h-screen min-w-screen p-0 m-0 bg-transparent">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}

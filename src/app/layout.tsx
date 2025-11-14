// src/app/layout.tsx
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from "@/components/ui/toaster";
import { ChunkLoadErrorHandler } from '@/components/ChunkLoadErrorHandler';
import PasswordChangeGuard from '@/components/auth/PasswordChangeGuard';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body>
        <ChunkLoadErrorHandler />
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <PasswordChangeGuard>
              {children}
            </PasswordChangeGuard>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


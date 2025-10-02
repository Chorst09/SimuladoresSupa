'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface AuthRedirectProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function AuthRedirect({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthRedirectProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Evitar redirecionamentos múltiplos
    if (loading || hasRedirected) return;

    const isAuthPage = pathname === '/login' || pathname === '/signup';
    
    if (requireAuth && !user && !isAuthPage) {
      console.log('🔄 Redirecionando para login...');
      setHasRedirected(true);
      router.replace(redirectTo);
    } else if (!requireAuth && user && isAuthPage) {
      console.log('🔄 Usuário logado, redirecionando para dashboard...');
      setHasRedirected(true);
      router.replace('/');
    }
  }, [user, loading, requireAuth, redirectTo, router, pathname, hasRedirected]);

  // Mostrar loading enquanto verifica auth ou durante redirecionamento
  if (loading || hasRedirected) {
    return <LoadingSpinner message="Verificando autenticação..." />;
  }

  // Se requer auth mas não tem usuário, não renderizar (vai redirecionar)
  if (requireAuth && !user) {
    return <LoadingSpinner message="Redirecionando..." />;
  }

  // Se não requer auth mas tem usuário em página de auth, não renderizar
  if (!requireAuth && user && (pathname === '/login' || pathname === '/signup')) {
    return <LoadingSpinner message="Redirecionando..." />;
  }

  return <>{children}</>;
}
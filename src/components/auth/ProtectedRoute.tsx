'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Aguardar o loading inicial terminar
    if (loading) return;

    // Aguardar um pouco mais para garantir que o estado está estável
    const checkTimeout = setTimeout(() => {
      if (requireAuth && !user) {
        console.log('🔄 ProtectedRoute: Redirecionando para login...');
        router.replace(redirectTo);
      } else {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(checkTimeout);
  }, [user, loading, requireAuth, redirectTo, router]);

  // Mostrar loading enquanto verifica auth
  if (loading || isChecking) {
    return <LoadingSpinner message="Verificando autenticação..." />;
  }

  // Se requer auth mas não tem usuário, não renderizar (vai redirecionar)
  if (requireAuth && !user) {
    return <LoadingSpinner message="Redirecionando..." />;
  }

  return <>{children}</>;
}
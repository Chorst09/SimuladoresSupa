'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, LogOut } from 'lucide-react';
import FirstLoginWrapper from '@/components/auth/FirstLoginWrapper';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setIsRedirecting(true);
      window.location.href = '/login';
    }
  }, [user, loading]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  if (loading || isRedirecting) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4">Redirecionando...</p>
      </div>
    );
  }

  return (
    <FirstLoginWrapper>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Bem-vindo!</h2>
            <p className="text-muted-foreground mb-4">
              Usuário: {user.email} ({user.role})
            </p>
            
            {user.passwordChanged === false && (
              <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
                <h3 className="font-semibold text-yellow-800">⚠️ Primeiro Acesso</h3>
                <p className="text-yellow-700 text-sm">
                  Por segurança, você deve alterar sua senha no primeiro acesso.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-primary text-primary-foreground px-4 py-3 rounded hover:bg-primary/90 text-center"
              >
                Aplicação Principal
              </button>
              
              <button 
                onClick={() => window.location.href = '/debug-auth'}
                className="bg-secondary text-secondary-foreground px-4 py-3 rounded hover:bg-secondary/90 text-center"
              >
                Debug de Autenticação
              </button>

              <button 
                onClick={() => window.location.href = '/gestao-oportunidades'}
                className="bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 text-center"
              >
                Gestão de Oportunidades
              </button>
            </div>

            <div className="mt-6 p-4 bg-green-100 rounded-lg">
              <h3 className="font-semibold text-green-800">✅ Login realizado com sucesso!</h3>
              <p className="text-green-700 text-sm">
                Você está autenticado e pode navegar pela aplicação.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FirstLoginWrapper>
  );
}
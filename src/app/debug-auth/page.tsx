'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugAuthPage() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Debug de Autenticação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Estado de Loading:</h3>
            <p>{loading ? 'Carregando...' : 'Carregado'}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Usuário:</h3>
            {user ? (
              <div className="bg-green-100 p-4 rounded">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Nome:</strong> {user.name || 'N/A'}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>
            ) : (
              <div className="bg-red-100 p-4 rounded">
                <p>Nenhum usuário logado</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold">Ações:</h3>
            <div className="space-x-2">
              <Button onClick={() => window.location.href = '/login'}>
                Ir para Login
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Ir para Dashboard
              </Button>
              {user && (
                <Button onClick={logout} variant="destructive">
                  Logout
                </Button>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Informações do Browser:</h3>
            <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
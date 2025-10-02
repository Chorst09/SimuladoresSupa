'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Shield, AlertCircle } from 'lucide-react';

export default function UserRoleDebug() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Debug do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando informações do usuário...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Debug do Usuário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user ? (
          <>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email:</label>
              <p className="text-sm">{user.email || 'Não informado'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role:</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.role === 'admin' || user.role === 'director' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
                {(user.role === 'admin' || user.role === 'director') && (
                  <Shield className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">ID:</label>
              <p className="text-xs font-mono bg-muted p-2 rounded">{user.id}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Acesso à Gestão de Oportunidades:</label>
              <div className="flex items-center gap-2 mt-1">
                {user.role === 'admin' || user.role === 'director' ? (
                  <Badge variant="default" className="bg-green-500">
                    ✅ Permitido
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    ❌ Negado
                  </Badge>
                )}
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Para ter acesso à Gestão de Oportunidades, o usuário deve ter role 'admin' ou 'director'.
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">Usuário não está logado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
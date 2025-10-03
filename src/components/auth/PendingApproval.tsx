'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function PendingApproval() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full w-fit">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-xl">Aguardando Aprovação</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Olá, <strong>{user?.full_name || user?.email}</strong>!
            </p>
            <p className="text-muted-foreground">
              Sua conta foi criada com sucesso, mas ainda está aguardando aprovação do administrador.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Mail className="h-4 w-4" />
              <span>Email: {user?.email}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Status: Pendente de aprovação
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              O administrador foi notificado sobre sua solicitação e definirá seu nível de acesso em breve.
            </p>
            <p>
              Você receberá um email quando sua conta for aprovada.
            </p>
          </div>

          <div className="pt-4">
            <Button 
              onClick={logout} 
              variant="outline" 
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              Precisa de ajuda? Entre em contato com o administrador do sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function PasswordChangeGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  // Se ainda está carregando, não mostrar nada
  if (loading) {
    return <>{children}</>;
  }

  // Se não há usuário ou já trocou a senha, mostrar conteúdo normal
  if (!user || user.passwordChanged !== false) {
    return <>{children}</>;
  }

  // Usuário precisa trocar a senha
  const handleChangePassword = async () => {
    setError('');

    // Validações
    if (!newPassword || !confirmPassword) {
      setError('Preencha todos os campos');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      setIsChanging(true);

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword,
          isFirstLogin: true
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao trocar senha');
      }

      // Recarregar a página para atualizar o estado do usuário
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Erro ao trocar senha');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Troca de Senha Obrigatória</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Por segurança, você deve criar uma nova senha antes de continuar.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                disabled={isChanging}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              disabled={isChanging}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleChangePassword();
                }
              }}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button
            onClick={handleChangePassword}
            disabled={isChanging}
            className="w-full"
          >
            {isChanging ? 'Alterando...' : 'Alterar Senha'}
          </Button>

          <div className="text-xs text-center text-muted-foreground">
            <p>💡 Dica: Use uma senha forte com letras, números e símbolos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

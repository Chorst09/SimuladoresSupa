// src/app/login/page.tsx
'use client';

import { useState } from 'react';
// import { useRouter } from 'next/navigation'; // Unused
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
// Migrado para usar APIs do Prisma
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import LoadingSpinner from '@/components/ui/loading-spinner';
// import AuthRedirect from '@/components/auth/AuthRedirect'; // Unused import

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const router = useRouter(); // Unused variable
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro no login');
      }

      toast({ title: 'Login bem-sucedido!', description: 'Redirecionando...' });

      // Fazer redirecionamento direto após login bem-sucedido
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);

      // Provide more user-friendly error messages
      let userFriendlyMessage = 'Verifique suas credenciais.';
      if (errorMessage.includes('Usuário não encontrado')) {
        userFriendlyMessage = 'Email não cadastrado.';
      } else if (errorMessage.includes('Senha incorreta')) {
        userFriendlyMessage = 'Senha incorreta.';
      } else if (errorMessage.includes('Too many requests')) {
        userFriendlyMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
      }

      toast({
        title: 'Erro no login',
        description: userFriendlyMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };



  // Se já está logado, redirecionar
  if (user && !authLoading) {
    window.location.href = '/dashboard';
    return <LoadingSpinner message="Redirecionando..." />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Acessar sua Conta</CardTitle>
          <CardDescription className="text-center">
            Insira seu e-mail e senha para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
              {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{' '}
            <Link href="/signup" className="underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
// src/app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Add user to profiles table with 'pending' status
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            role: 'pending', // Status pendente até aprovação
            full_name: fullName || email.split('@')[0], // Nome fornecido ou baseado no email
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting user profile:', insertError);
          // Tentar inserir sem campos opcionais
          const { error: simpleInsertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              role: 'pending'
            });
          
          if (simpleInsertError) {
            console.error('Error inserting simple profile:', simpleInsertError);
          }
        }

        // Enviar notificações para administradores (múltiplos métodos)
        try {
          console.log('📧 Enviando notificações de aprovação...');
          
          // Método 1: Email via Resend
          const emailResponse = await fetch('/api/send-approval-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userEmail: email,
              userName: fullName || email.split('@')[0]
            }),
          });

          const emailResult = await emailResponse.json();
          console.log('📧 Resultado do email:', emailResult);

          // Método 2: Webhook/Discord (backup)
          try {
            const webhookResponse = await fetch('/api/webhook-notification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userEmail: email,
                userName: fullName || email.split('@')[0]
              }),
            });

            const webhookResult = await webhookResponse.json();
            console.log('🔔 Resultado da notificação:', webhookResult);
          } catch (webhookError) {
            console.error('⚠️ Erro na notificação webhook:', webhookError);
          }

          if (!emailResponse.ok && !emailResult.emailSent) {
            console.error('❌ Erro ao enviar email de aprovação:', emailResult);
          } else {
            console.log('✅ Notificações enviadas com sucesso!');
          }
        } catch (notificationError) {
          console.error('❌ Erro ao enviar notificações:', notificationError);
        }

        toast({ 
          title: 'Cadastro realizado com sucesso!', 
          description: 'Sua conta foi criada e está aguardando aprovação do administrador. Você receberá um email quando for aprovada.' 
        });
        router.push('/login');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message);
      
      // Provide more user-friendly error messages
      let errorMessage = err.message;
      if (err.message.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado.';
      } else if (err.message.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (err.message.includes('Invalid email')) {
        errorMessage = 'Email inválido.';
      }
      
      toast({ 
        title: 'Erro no cadastro', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Digite seu nome completo"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              Já tem uma conta? Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;

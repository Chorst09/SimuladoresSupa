// src/components/debug/AuthTestHelper.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AuthTestHelper() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const createTestUser = async (email: string, password: string, role: 'admin' | 'diretor' | 'user' = 'user') => {
    setLoading(true);
    try {
      console.log(`🧪 Tentando criar usuário de teste: ${email}`);
      
      // Create user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation for test users
        }
      });

      console.log('📋 Resultado signUp:', { data, error });

      if (error) {
        if (error.message.includes('User already registered') || 
            error.message.includes('already been registered')) {
          toast({
            title: 'Usuário já existe',
            description: `${email} já está cadastrado. Você pode fazer login diretamente.`,
            variant: 'default'
          });
          return;
        }
        
        if (error.message.includes('Auth session missing')) {
          // Try alternative approach - just show credentials
          toast({
            title: 'Use credenciais de teste',
            description: `Tente fazer login com: ${email} / ${password}`,
            variant: 'default'
          });
          return;
        }
        
        throw error;
      }

      if (data.user) {
        console.log('👤 Usuário criado:', data.user.id);
        
        // Add user to users table with specified role
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            role: role
          });

        if (insertError) {
          console.error('❌ Erro ao inserir na tabela users:', insertError);
          // Don't fail completely, user was created in auth
        }

        toast({
          title: 'Usuário de teste criado!',
          description: `${email} (${role}) - Senha: ${password}`,
        });
      }
    } catch (err: any) {
      console.error('❌ Erro ao criar usuário de teste:', err);
      toast({
        title: 'Erro ao criar usuário',
        description: `${err.message}. Tente usar: ${email} / ${password}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const testUsers = [
    { email: 'admin@exemplo.com.br', password: 'admin123456', role: 'admin' as const },
    { email: 'diretor@exemplo.com.br', password: 'diretor123456', role: 'diretor' as const },
    { email: 'usuario@exemplo.com.br', password: 'user123456', role: 'user' as const },
  ];

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-yellow-50 border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-yellow-800">🧪 Auth Test Helper</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-yellow-700 mb-3">
          Crie usuários de teste rapidamente para desenvolvimento:
        </p>
        
        {testUsers.map((user) => (
          <Button
            key={user.email}
            variant="outline"
            size="sm"
            className="w-full text-xs"
            disabled={loading}
            onClick={() => createTestUser(user.email, user.password, user.role)}
          >
            Criar {user.role}: {user.email}
          </Button>
        ))}
        
        <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
          <strong>Credenciais de teste:</strong>
          <br />• admin@exemplo.com.br / admin123456
          <br />• diretor@exemplo.com.br / diretor123456  
          <br />• usuario@exemplo.com.br / user123456
        </div>
        
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
          <strong>Alternativa:</strong> Use a página de{' '}
          <a href="/signup" className="underline font-semibold">
            cadastro
          </a>{' '}
          para criar uma conta manualmente.
        </div>
        
        <p className="text-xs text-yellow-600 mt-2">
          ⚠️ Apenas visível em desenvolvimento
        </p>
      </CardContent>
    </Card>
  );
}

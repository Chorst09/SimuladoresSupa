'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserPlus, Loader2 } from 'lucide-react';
import ConnectionDiagnostic from './ConnectionDiagnostic';

export default function AdminSetup() {
  const [loading, setLoading] = useState(true);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    checkForAdmin();
  }, []);

  const checkForAdmin = async () => {
    try {
      console.log('🔍 Verificando administradores existentes...');
      
      // Tentar conectar com timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const queryPromise = supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);
      
      const { data: adminUsers, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('Erro ao verificar administradores:', error);
        // Se houver erro, assumir que não há admin para permitir criação
        setHasAdmin(false);
      } else {
        const hasAdminUsers = adminUsers && adminUsers.length > 0;
        console.log(`📊 Administradores encontrados: ${hasAdminUsers ? adminUsers.length : 0}`);
        setHasAdmin(hasAdminUsers);
      }
    } catch (error: any) {
      console.error('❌ Erro ao verificar administradores:', error);
      
      if (error.message === 'Timeout') {
        console.log('⏰ Timeout na conexão - assumindo que não há admin');
      } else if (error.message?.includes('Failed to fetch')) {
        console.log('🌐 Erro de conectividade - assumindo que não há admin');
      }
      
      // Em caso de erro, assumir que não há admin para permitir setup
      setHasAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const createFirstAdmin = async () => {
    if (!email || !password) {
      alert('Erro: Email e senha são obrigatórios.');
      return;
    }

    if (password.length < 6) {
      alert('Erro: A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setCreating(true);

    try {
      console.log('🔄 Iniciando criação do primeiro administrador...');
      
      // Verificar conectividade primeiro
      console.log('🌐 Testando conectividade com Supabase...');
      
      let existingUsers = null;
      let checkError = null;
      
      try {
        // Tentar verificar usuário existente com timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na verificação')), 15000)
        );
        
        const checkPromise = supabase
          .from('profiles')
          .select('id, email, role')
          .eq('email', email)
          .limit(1);
        
        const result = await Promise.race([checkPromise, timeoutPromise]) as any;
        existingUsers = result.data;
        checkError = result.error;
        
      } catch (connectError: any) {
        console.warn('⚠️ Erro de conectividade na verificação:', connectError.message);
        
        if (connectError.message?.includes('Failed to fetch') || connectError.message?.includes('Timeout')) {
          console.log('🔄 Tentando criar usuário diretamente devido a problemas de conectividade...');
          // Pular verificação e tentar criar diretamente
          existingUsers = null;
          checkError = null;
        } else {
          throw connectError;
        }
      }
      
      if (checkError) {
        console.error('Erro ao verificar usuário existente:', checkError);
        throw new Error(`Erro ao verificar usuário: ${checkError.message}`);
      }
      
      if (existingUsers && existingUsers.length > 0) {
        console.log('👤 Usuário já existe, promovendo para admin...');
        // User exists in profiles table, just update to admin
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: 'admin',
            full_name: name || existingUsers[0].full_name || email
          })
          .eq('email', email);
        
        if (updateError) {
          console.error('Erro ao atualizar usuário:', updateError);
          throw new Error(`Erro ao promover usuário: ${updateError.message}`);
        }
        
        alert('Sucesso: Usuário promovido a administrador!');
        setHasAdmin(true);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        return;
      }
      
      console.log('🆕 Tentando criar admin diretamente na tabela...');
      
      // Tentar inserir diretamente na tabela profiles primeiro
      try {
        const { data: directInsert, error: directError } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            email: email,
            role: 'admin',
            full_name: name || email,
            created_at: new Date().toISOString()
          })
          .select();

        if (!directError && directInsert) {
          console.log('✅ Admin criado diretamente na tabela!');
          alert('Sucesso: Administrador criado com sucesso!');
          setHasAdmin(true);
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
          return;
        } else {
          console.log('⚠️ Inserção direta falhou, tentando via Auth...');
        }
      } catch (directInsertError) {
        console.log('⚠️ Inserção direta falhou, tentando via Auth...');
      }

      console.log('🆕 Criando novo usuário via Auth...');
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name || email,
            role: 'admin'
          }
        }
      });

      if (authError) {
        console.error('Erro na autenticação:', authError);
        throw authError;
      }

      if (authData.user) {
        console.log('✅ Usuário criado na autenticação, criando perfil...');
        
        // Create user document in profiles table
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: email,
            role: 'admin',
            full_name: name || email,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Erro ao inserir usuário na tabela profiles:', insertError);
          
          // Try to create a simpler profile
          const { error: simpleInsertError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: email,
              role: 'admin'
            });
          
          if (simpleInsertError) {
            console.error('Erro mesmo com perfil simples:', simpleInsertError);
            throw new Error(`Erro ao criar perfil: ${simpleInsertError.message}`);
          }
        }
        
        console.log('✅ Administrador criado com sucesso!');
        alert('Sucesso: Primeiro administrador criado com sucesso! Você pode fazer login agora.');

        setHasAdmin(true);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        throw new Error('Falha ao criar usuário - dados de autenticação não retornados');
      }
    } catch (error: any) {
      console.error('❌ Erro ao criar primeiro admin:', error);
      
      let errorMessage = 'Não foi possível criar o administrador.';
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Timeout')) {
        errorMessage = 'Erro de conectividade com o banco de dados. Verifique sua conexão com a internet e tente novamente.';
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está em uso. Tente fazer login ou use outro email.';
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Email inválido.';
      } else if (error.message?.includes('duplicate key value')) {
        errorMessage = 'Este usuário já existe no sistema.';
      } else if (error.message?.includes('JWT')) {
        errorMessage = 'Erro de autenticação. Verifique as configurações do Supabase.';
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      // Adicionar informações de debug para o usuário
      console.log('🔍 Informações de debug:', {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : 'Não configurada',
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'Não configurada',
        errorType: error.name,
        errorMessage: error.message
      });
      
      alert(`${errorMessage}\n\nSe o problema persistir, verifique:\n1. Conexão com a internet\n2. Configurações do Supabase\n3. Console do navegador para mais detalhes`);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Verificando sistema...</span>
      </div>
    );
  }

  if (hasAdmin) {
    // If admin was just created, show a message and redirect
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Administrador Criado!</h3>
            <p className="text-muted-foreground">
              Redirecionando para a página de login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card>
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
          <CardTitle>Configuração Inicial</CardTitle>
          <p className="text-muted-foreground">
            Nenhum administrador encontrado. Crie o primeiro administrador do sistema.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="admin-email">Email do Administrador</Label>
            <Input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@empresa.com"
            />
          </div>
          <div>
            <Label htmlFor="admin-password">Senha</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha segura (mínimo 6 caracteres)"
            />
          </div>
          <div>
            <Label htmlFor="admin-name">Nome (Opcional)</Label>
            <Input
              id="admin-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do administrador"
            />
          </div>
          <Button 
            onClick={createFirstAdmin} 
            disabled={creating}
            className="w-full"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Criar Primeiro Administrador
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <ConnectionDiagnostic />
    </div>
  );
}

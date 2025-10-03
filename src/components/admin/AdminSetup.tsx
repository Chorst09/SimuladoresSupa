'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, UserPlus, Loader2 } from 'lucide-react';

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
      const { data: adminUsers, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);
      
      if (error) {
        console.error('Erro ao verificar administradores:', error);
        setHasAdmin(false);
      } else {
        setHasAdmin(adminUsers && adminUsers.length > 0);
      }
    } catch (error) {
      console.error('Erro ao verificar administradores:', error);
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
      
      // Check if user already exists in Supabase profiles table
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', email)
        .limit(1);
      
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
      
      console.log('🆕 Criando novo usuário...');
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
      
      if (error.message.includes('User already registered')) {
        errorMessage = 'Este email já está em uso. Tente fazer login ou use outro email.';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Email inválido.';
      } else if (error.message.includes('duplicate key value')) {
        errorMessage = 'Este usuário já existe no sistema.';
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      alert(`Erro: ${errorMessage}`);
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
    <div className="max-w-md mx-auto mt-8">
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
              placeholder="Senha segura"
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
    </div>
  );
}

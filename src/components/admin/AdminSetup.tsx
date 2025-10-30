'use client';

import { useState, useEffect } from 'react';
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
      
      const response = await fetch('/api/profiles?role=admin&limit=1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const hasAdminUsers = result.data.length > 0;
          console.log(`📊 Administradores encontrados: ${hasAdminUsers ? result.data.length : 0}`);
          setHasAdmin(hasAdminUsers);
        } else {
          console.log('📊 Nenhum administrador encontrado');
          setHasAdmin(false);
        }
      } else {
        console.error('Erro ao verificar administradores:', response.status);
        setHasAdmin(false);
      }
    } catch (error: any) {
      console.error('❌ Erro ao verificar administradores:', error);
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
      
      // Criar o primeiro administrador via API local
      const response = await fetch('/api/admin/create-first-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          name: name.trim() || email.trim(),
          role: 'admin'
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Administrador criado com sucesso!');
        alert('Sucesso: Primeiro administrador criado com sucesso! Você pode fazer login agora.');
        
        setHasAdmin(true);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        throw new Error(result.error || 'Erro desconhecido ao criar administrador');
      }
    } catch (error: any) {
      console.error('❌ Erro ao criar primeiro admin:', error);
      
      let errorMessage = 'Não foi possível criar o administrador.';
      
      if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Erro de conectividade com o servidor. Verifique sua conexão e tente novamente.';
      } else if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
        errorMessage = 'Este email já está em uso. Tente fazer login ou use outro email.';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Email inválido.';
      } else if (error.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      alert(`${errorMessage}\n\nSe o problema persistir, verifique:\n1. Conexão com a internet\n2. Se o servidor está rodando\n3. Console do navegador para mais detalhes`);
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
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Sistema Configurado!</h3>
            <p className="text-muted-foreground">
              Administrador já existe no sistema. Faça login para continuar.
            </p>
            <Button 
              onClick={() => window.location.href = '/login'} 
              className="mt-4"
            >
              Ir para Login
            </Button>
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
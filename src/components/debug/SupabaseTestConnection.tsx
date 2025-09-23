// src/components/debug/SupabaseTestConnection.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SupabaseTestConnection() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('🔄 Testando conexão com Supabase...');
      
      // Test 1: Basic connection
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        addResult(`❌ Erro na sessão: ${sessionError.message}`);
      } else {
        addResult(`✅ Conexão OK. Sessão: ${session.session ? 'Ativa' : 'Inativa'}`);
      }
      
      // Test 2: Check users table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
        
      if (usersError) {
        addResult(`❌ Erro na tabela users: ${usersError.message}`);
      } else {
        addResult(`✅ Tabela users OK. Registros: ${usersData?.length || 0}`);
      }
      
      // Test 3: Test signup capability
      const testEmail = `test-${Date.now()}@example.com`;
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'test123456',
      });
      
      if (signupError) {
        addResult(`❌ Erro no signup: ${signupError.message}`);
      } else {
        addResult(`✅ Signup OK. User ID: ${signupData.user?.id}`);
        
        // Clean up test user
        if (signupData.user) {
          await supabase.auth.admin.deleteUser(signupData.user.id);
          addResult(`🗑️ Usuário de teste removido`);
        }
      }
      
    } catch (error: any) {
      addResult(`❌ Erro geral: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="fixed top-4 left-4 w-96 z-50 bg-blue-50 border-blue-200 max-h-96 overflow-y-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-blue-800">🔧 Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          disabled={loading}
          onClick={testConnection}
        >
          {loading ? 'Testando...' : 'Testar Conexão'}
        </Button>
        
        {results.length > 0 && (
          <div className="mt-3 p-2 bg-white rounded text-xs max-h-48 overflow-y-auto">
            {results.map((result, index) => (
              <div key={index} className="mb-1 font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={() => setResults([])}
        >
          Limpar Resultados
        </Button>
      </CardContent>
    </Card>
  );
}

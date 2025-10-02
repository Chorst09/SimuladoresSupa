'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/use-auth';

export default function TestLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, loading: authLoading } = useAuth();

  const handleTestLogin = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`Erro: ${error.message}`);
      } else if (data.user) {
        setMessage('Login bem-sucedido! Redirecionando em 3 segundos...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 3000);
      }
    } catch (err: any) {
      setMessage(`Erro inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Teste de Login</h1>
        
        {user ? (
          <div className="bg-green-100 p-4 rounded-lg mb-4">
            <h2 className="font-semibold text-green-800">Usuário Logado:</h2>
            <p className="text-green-700">Email: {user.email}</p>
            <p className="text-green-700">Role: {user.role}</p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
            >
              Ir para Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Senha:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="sua senha"
              />
            </div>
            
            <button
              onClick={handleTestLogin}
              disabled={loading || !email || !password}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Fazendo Login...' : 'Fazer Login'}
            </button>
          </div>
        )}
        
        {message && (
          <div className="mt-4 p-4 bg-blue-100 rounded-lg">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p>Estado de autenticação: {authLoading ? 'Carregando...' : (user ? 'Logado' : 'Não logado')}</p>
        </div>

        <div className="mt-4 space-y-2">
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gray-600 text-white p-2 rounded"
          >
            Ir para Login Normal
          </button>
          
          <button 
            onClick={() => window.location.href = '/debug-auth'}
            className="w-full bg-gray-600 text-white p-2 rounded"
          >
            Debug de Autenticação
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Wifi } from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'testing';
  message: string;
}

export default function ConnectionDiagnostic() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const fixRLSEmergency = async () => {
    setTesting(true);
    
    try {
      const response = await fetch('/api/fix-rls-emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ RLS corrigido com sucesso!\n\n' + result.message);
        // Executar diagnóstico novamente
        await runDiagnostics();
      } else {
        alert('❌ Erro na correção RLS:\n\n' + result.error + '\n\nInstruções:\n' + (result.instructions?.join('\n') || ''));
      }
    } catch (error: any) {
      alert('❌ Erro ao executar correção RLS:\n\n' + error.message);
    }
    
    setTesting(false);
  };

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnostics: DiagnosticResult[] = [];

    // Test 1: Environment Variables
    diagnostics.push({
      test: 'Variáveis de Ambiente',
      status: 'testing',
      message: 'Verificando configuração...'
    });
    setResults([...diagnostics]);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      diagnostics[0] = {
        test: 'Variáveis de Ambiente',
        status: 'error',
        message: 'Variáveis NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas'
      };
    } else {
      diagnostics[0] = {
        test: 'Variáveis de Ambiente',
        status: 'success',
        message: `URL: ${supabaseUrl.substring(0, 30)}...`
      };
    }
    setResults([...diagnostics]);

    // Test 2: Network Connectivity
    diagnostics.push({
      test: 'Conectividade de Rede',
      status: 'testing',
      message: 'Testando conexão...'
    });
    setResults([...diagnostics]);

    try {
      const response = await fetch(supabaseUrl + '/rest/v1/', {
        method: 'HEAD',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (response.ok || response.status === 404) {
        diagnostics[1] = {
          test: 'Conectividade de Rede',
          status: 'success',
          message: 'Conexão com Supabase estabelecida'
        };
      } else {
        diagnostics[1] = {
          test: 'Conectividade de Rede',
          status: 'error',
          message: `Erro HTTP: ${response.status} ${response.statusText}`
        };
      }
    } catch (error: any) {
      diagnostics[1] = {
        test: 'Conectividade de Rede',
        status: 'error',
        message: `Erro de rede: ${error.message}`
      };
    }
    setResults([...diagnostics]);

    // Test 3: Supabase Client
    diagnostics.push({
      test: 'Cliente Supabase',
      status: 'testing',
      message: 'Testando cliente...'
    });
    setResults([...diagnostics]);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        diagnostics[2] = {
          test: 'Cliente Supabase',
          status: 'error',
          message: `Erro do Supabase: ${error.message}`
        };
      } else {
        diagnostics[2] = {
          test: 'Cliente Supabase',
          status: 'success',
          message: 'Cliente Supabase funcionando'
        };
      }
    } catch (error: any) {
      diagnostics[2] = {
        test: 'Cliente Supabase',
        status: 'error',
        message: `Erro do cliente: ${error.message}`
      };
    }
    setResults([...diagnostics]);

    // Test 4: Table Access
    diagnostics.push({
      test: 'Acesso à Tabela Profiles',
      status: 'testing',
      message: 'Verificando tabela...'
    });
    setResults([...diagnostics]);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes('relation "profiles" does not exist')) {
          diagnostics[3] = {
            test: 'Acesso à Tabela Profiles',
            status: 'error',
            message: 'Tabela "profiles" não existe. Execute o script SQL de correção.'
          };
        } else {
          diagnostics[3] = {
            test: 'Acesso à Tabela Profiles',
            status: 'error',
            message: `Erro de acesso: ${error.message}`
          };
        }
      } else {
        diagnostics[3] = {
          test: 'Acesso à Tabela Profiles',
          status: 'success',
          message: 'Tabela profiles acessível'
        };
      }
    } catch (error: any) {
      diagnostics[3] = {
        test: 'Acesso à Tabela Profiles',
        status: 'error',
        message: `Erro: ${error.message}`
      };
    }
    setResults([...diagnostics]);

    setTesting(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'testing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Diagnóstico de Conectividade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={testing}
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              'Executar Diagnóstico'
            )}
          </Button>
          
          <Button 
            onClick={fixRLSEmergency} 
            disabled={testing}
            variant="destructive"
          >
            🚨 Corrigir RLS
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="font-medium">{result.test}</div>
                  <div className="text-sm text-muted-foreground">{result.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && !testing && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Próximos Passos:</h4>
            <ul className="text-sm space-y-1">
              {results.some(r => r.status === 'error') ? (
                <>
                  <li>• Se há erros de variáveis de ambiente, configure-as no Vercel</li>
                  <li>• Se há erros de tabela, execute o script fix-admin-creation.sql no Supabase</li>
                  <li>• Se há erros de rede, verifique sua conexão com a internet</li>
                </>
              ) : (
                <li>• ✅ Todos os testes passaram! Você pode tentar criar o administrador.</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
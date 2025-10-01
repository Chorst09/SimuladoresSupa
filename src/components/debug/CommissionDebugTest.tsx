import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabaseClient';
import { AlertCircle, CheckCircle, XCircle, Database } from 'lucide-react';

interface TestResult {
  test: string;
  success: boolean;
  data?: any;
  error?: string;
}

export default function CommissionDebugTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    const testResults: TestResult[] = [];

    // Test 1: Check if tables exist and have data
    try {
      const { data, error } = await supabase
        .from('commission_channel_seller')
        .select('*', { count: 'exact' });
      
      testResults.push({
        test: 'Tabela commission_channel_seller existe e tem dados',
        success: !error && (data?.length || 0) > 0,
        data: { count: data?.length || 0, sample: data?.[0] },
        error: error?.message
      });
    } catch (err) {
      testResults.push({
        test: 'Tabela commission_channel_seller existe e tem dados',
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }

    // Test 2: Check session
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      testResults.push({
        test: 'Sessão do usuário',
        success: !!session && !error,
        data: { 
          hasSession: !!session, 
          userId: session?.user?.id,
          email: session?.user?.email 
        },
        error: error?.message
      });
    } catch (err) {
      testResults.push({
        test: 'Sessão do usuário',
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }

    // Test 3: Check user_profiles table
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*');
      
      testResults.push({
        test: 'Tabela user_profiles',
        success: !error,
        data: { count: data?.length || 0, profiles: data },
        error: error?.message
      });
    } catch (err) {
      testResults.push({
        test: 'Tabela user_profiles',
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }

    // Test 4: Test all commission tables
    const tables = [
      'commission_channel_seller',
      'commission_channel_director', 
      'commission_seller',
      'commission_channel_influencer',
      'commission_channel_indicator'
    ];

    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' });
        
        testResults.push({
          test: `Tabela ${table}`,
          success: !error && (count || 0) > 0,
          data: { count, sample: data?.[0] },
          error: error?.message
        });
      } catch (err) {
        testResults.push({
          test: `Tabela ${table}`,
          success: false,
          error: err instanceof Error ? err.message : 'Erro desconhecido'
        });
      }
    }

    // Test 5: Test RPC function
    try {
      const { data, error } = await supabase.rpc('get_user_role');
      testResults.push({
        test: 'Função get_user_role()',
        success: !error,
        data: { role: data },
        error: error?.message
      });
    } catch (err) {
      testResults.push({
        test: 'Função get_user_role()',
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }

    // Test 6: Direct SQL query (bypass RLS)
    try {
      const { data, error } = await supabase
        .from('commission_channel_seller')
        .select('*')
        .limit(1);
      
      testResults.push({
        test: 'Query direta (com RLS)',
        success: !error && (data?.length || 0) > 0,
        data: data?.[0],
        error: error?.message
      });
    } catch (err) {
      testResults.push({
        test: 'Query direta (com RLS)',
        success: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido'
      });
    }

    setResults(testResults);
    setIsRunning(false);
  };

  const getIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <Card className="bg-slate-900/80 border-slate-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Teste de Debug das Tabelas de Comissão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Executando Testes...' : 'Executar Testes de Debug'}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Resultados dos Testes:</h4>
            {results.map((result, index) => (
              <div key={index} className="p-3 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2 mb-2">
                  {getIcon(result.success)}
                  <span className="font-medium">{result.test}</span>
                </div>
                
                {result.error && (
                  <Alert className="mb-2 border-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-400">
                      Erro: {result.error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {result.data && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-slate-400">
                      Ver dados
                    </summary>
                    <pre className="mt-2 p-2 bg-slate-900/50 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-slate-800/30 rounded text-sm">
          <h5 className="font-semibold mb-2">🔍 Instruções de Debug:</h5>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>Execute este teste para identificar problemas</li>
            <li>Execute o script debug_commission_tables.sql no Supabase</li>
            <li>Verifique se você tem um perfil de usuário criado</li>
            <li>Se necessário, configure seu usuário como admin</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

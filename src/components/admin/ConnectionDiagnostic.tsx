'use client';

import { useState } from 'react';
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

  const runDiagnostics = async () => {
    setTesting(true);
    setResults([]);

    const diagnostics: DiagnosticResult[] = [
      { test: 'Configuração do Banco', status: 'testing', message: 'Verificando...' },
      { test: 'Conectividade API', status: 'testing', message: 'Testando...' },
      { test: 'Banco de Dados', status: 'testing', message: 'Verificando...' },
      { test: 'Tabela Profiles', status: 'testing', message: 'Testando...' }
    ];

    setResults([...diagnostics]);

    // Test 1: Database Configuration
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      diagnostics[0] = {
        test: 'Configuração do Banco',
        status: 'error',
        message: 'Variável DATABASE_URL não configurada'
      };
    } else {
      diagnostics[0] = {
        test: 'Configuração do Banco',
        status: 'success',
        message: 'DATABASE_URL configurada'
      };
    }

    setResults([...diagnostics]);

    // Test 2: API Connectivity
    diagnostics[1] = {
      test: 'Conectividade API',
      status: 'testing',
      message: 'Testando conexão com API...'
    };

    setResults([...diagnostics]);

    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        diagnostics[1] = {
          test: 'Conectividade API',
          status: 'success',
          message: 'API respondendo corretamente'
        };
      } else {
        diagnostics[1] = {
          test: 'Conectividade API',
          status: 'error',
          message: `API retornou status ${response.status}`
        };
      }
    } catch (error: any) {
      diagnostics[1] = {
        test: 'Conectividade API',
        status: 'error',
        message: `Erro de rede: ${error.message}`
      };
    }

    setResults([...diagnostics]);

    // Test 3: Database Connection
    diagnostics[2] = {
      test: 'Banco de Dados',
      status: 'testing',
      message: 'Testando conexão com PostgreSQL...'
    };

    setResults([...diagnostics]);

    try {
      const response = await fetch('/api/database/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        diagnostics[2] = {
          test: 'Banco de Dados',
          status: 'success',
          message: 'PostgreSQL conectado via Prisma'
        };
      } else {
        diagnostics[2] = {
          test: 'Banco de Dados',
          status: 'error',
          message: `Erro no banco: ${result.error || 'Erro desconhecido'}`
        };
      }
    } catch (error: any) {
      diagnostics[2] = {
        test: 'Banco de Dados',
        status: 'error',
        message: `Erro de conexão: ${error.message}`
      };
    }

    setResults([...diagnostics]);

    // Test 4: Profiles Table
    diagnostics[3] = {
      test: 'Tabela Profiles',
      status: 'testing',
      message: 'Verificando tabela profiles...'
    };

    setResults([...diagnostics]);

    try {
      const response = await fetch('/api/profiles?limit=1', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        diagnostics[3] = {
          test: 'Tabela Profiles',
          status: 'success',
          message: 'Tabela profiles acessível'
        };
      } else {
        diagnostics[3] = {
          test: 'Tabela Profiles',
          status: 'error',
          message: `Erro na tabela: ${result.error || 'Erro desconhecido'}`
        };
      }
    } catch (error: any) {
      diagnostics[3] = {
        test: 'Tabela Profiles',
        status: 'error',
        message: `Erro de acesso: ${error.message}`
      };
    }

    setResults([...diagnostics]);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return null;
    }
  };

  const hasErrors = results.some(r => r.status === 'error');

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Diagnóstico de Conexão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={runDiagnostics} 
          disabled={testing}
          className="mb-4"
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

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
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
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Soluções para Problemas Comuns:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              {hasErrors ? (
                <>
                  <li>• Se há erros de configuração, verifique a variável DATABASE_URL</li>
                  <li>• Se há erros de API, verifique se o servidor está rodando</li>
                  <li>• Se há erros de banco, execute: npx prisma migrate dev</li>
                  <li>• Se há erros de tabela, execute: npx prisma db seed</li>
                </>
              ) : (
                <li>• ✅ Todos os testes passaram! O sistema está funcionando corretamente.</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
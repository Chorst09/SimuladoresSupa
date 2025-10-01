import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { useCommissions } from '@/hooks/use-commissions';

export default function CommissionTablesDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    channelSeller, 
    channelDirector, 
    seller, 
    channelInfluencer, 
    channelIndicator, 
    isLoading: hookLoading, 
    error: hookError,
    retryCount,
    maxRetries,
    refreshData
  } = useCommissions();

  const runDiagnostic = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const info: any = {
        timestamp: new Date().toISOString(),
        supabaseConnection: null,
        session: null,
        tables: {},
        hookData: {
          channelSeller,
          channelDirector,
          seller,
          channelInfluencer,
          channelIndicator,
          isLoading: hookLoading,
          error: hookError,
          retryCount,
          maxRetries
        }
      };

      // Test Supabase connection
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        info.session = {
          exists: !!session,
          user: session?.user?.email || null,
          error: sessionError?.message || null
        };
      } catch (err) {
        info.session = { error: err instanceof Error ? err.message : 'Unknown error' };
      }

      // Test each table
      const tables = [
        'commission_channel_seller',
        'commission_channel_director', 
        'commission_seller',
        'commission_channel_influencer',
        'commission_channel_indicator'
      ];

      for (const tableName of tables) {
        try {
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact' });
          
          info.tables[tableName] = {
            exists: !error,
            count: count || 0,
            data: data?.slice(0, 2) || [], // First 2 records
            error: error?.message || null
          };
        } catch (err) {
          info.tables[tableName] = {
            exists: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          };
        }
      }

      setDebugInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <Card className="bg-slate-900/80 border-slate-800 text-white">
      <CardHeader>
        <CardTitle>Diagnóstico das Tabelas de Comissão</CardTitle>
        <div className="flex gap-2">
          <Button onClick={runDiagnostic} disabled={isLoading}>
            {isLoading ? 'Executando...' : 'Executar Diagnóstico'}
          </Button>
          <Button onClick={refreshData} variant="outline">
            Recarregar Hook
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-900/50 border border-red-700 p-4 rounded mb-4">
            <strong>Erro:</strong> {error}
          </div>
        )}
        
        {debugInfo && (
          <div className="space-y-4">
            {/* Session Info */}
            <div className="bg-slate-800/50 p-4 rounded">
              <h3 className="font-semibold mb-2">Sessão Supabase</h3>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(debugInfo.session, null, 2)}
              </pre>
            </div>

            {/* Hook Data */}
            <div className="bg-slate-800/50 p-4 rounded">
              <h3 className="font-semibold mb-2">Dados do Hook useCommissions</h3>
              <div className="text-sm space-y-2">
                <div>Loading: {debugInfo.hookData.isLoading ? 'true' : 'false'}</div>
                <div>Error: {debugInfo.hookData.error || 'null'}</div>
                <div>Retry Count: {debugInfo.hookData.retryCount}/{debugInfo.hookData.maxRetries}</div>
                <div>Channel Seller: {debugInfo.hookData.channelSeller ? 'loaded' : 'null'}</div>
                <div>Channel Director: {debugInfo.hookData.channelDirector ? 'loaded' : 'null'}</div>
                <div>Seller: {debugInfo.hookData.seller ? 'loaded' : 'null'}</div>
                <div>Channel Influencer: {debugInfo.hookData.channelInfluencer ? `${debugInfo.hookData.channelInfluencer.length} records` : 'null'}</div>
                <div>Channel Indicator: {debugInfo.hookData.channelIndicator ? `${debugInfo.hookData.channelIndicator.length} records` : 'null'}</div>
              </div>
            </div>

            {/* Tables Info */}
            <div className="bg-slate-800/50 p-4 rounded">
              <h3 className="font-semibold mb-2">Status das Tabelas</h3>
              {Object.entries(debugInfo.tables).map(([tableName, tableInfo]: [string, any]) => (
                <div key={tableName} className="mb-4 p-3 bg-slate-700/50 rounded">
                  <h4 className="font-medium">{tableName}</h4>
                  <div className="text-sm mt-2">
                    <div>Existe: {tableInfo.exists ? '✅' : '❌'}</div>
                    <div>Registros: {tableInfo.count || 0}</div>
                    {tableInfo.error && <div className="text-red-400">Erro: {tableInfo.error}</div>}
                    {tableInfo.data && tableInfo.data.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer">Ver dados</summary>
                        <pre className="text-xs mt-2 overflow-x-auto">
                          {JSON.stringify(tableInfo.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SupabaseDirectTest() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testSupabaseConnection = async () => {
    setIsLoading(true);
    const results: any = {};

    try {
      // Test connection
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      results.session = {
        exists: !!session,
        error: sessionError?.message || null
      };

      // Test each table directly
      const tables = [
        'commission_channel_seller',
        'commission_seller',
        'commission_channel_influencer',
        'commission_channel_indicator'
      ];

      for (const tableName of tables) {
        try {
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact' })
            .limit(1);
          
          results[tableName] = {
            success: !error,
            count: count || 0,
            data: data || [],
            error: error?.message || null
          };
        } catch (err) {
          results[tableName] = {
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          };
        }
      }

      setTestResults(results);
    } catch (err) {
      setTestResults({
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  return (
    <div className="bg-slate-800 p-4 rounded text-white">
      <h3 className="font-bold mb-2">Teste Direto Supabase</h3>
      
      <button 
        onClick={testSupabaseConnection}
        disabled={isLoading}
        className="bg-blue-600 px-4 py-2 rounded mb-4 disabled:opacity-50"
      >
        {isLoading ? 'Testando...' : 'Testar Conexão'}
      </button>

      {testResults && (
        <div className="space-y-2">
          <div>
            <strong>Sessão:</strong> {testResults.session?.exists ? 'Ativa' : 'Inativa'}
            {testResults.session?.error && (
              <span className="text-red-400"> - Erro: {testResults.session.error}</span>
            )}
          </div>

          {Object.entries(testResults).map(([key, value]: [string, any]) => {
            if (key === 'session' || key === 'error') return null;
            
            return (
              <div key={key} className="border-l-2 border-blue-500 pl-2">
                <div className="font-medium">{key}</div>
                <div className="text-sm">
                  Status: {value.success ? '✅ OK' : '❌ Erro'}
                </div>
                <div className="text-sm">
                  Registros: {value.count || 0}
                </div>
                {value.error && (
                  <div className="text-sm text-red-400">
                    Erro: {value.error}
                  </div>
                )}
                {value.data && value.data.length > 0 && (
                  <div className="text-xs">
                    Dados: {JSON.stringify(value.data[0], null, 2)}
                  </div>
                )}
              </div>
            );
          })}

          {testResults.error && (
            <div className="text-red-400">
              <strong>Erro Geral:</strong> {testResults.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabaseClient';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface InitializationResult {
  success: boolean;
  message: string;
  details: any;
}

export default function CommissionTablesInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [result, setResult] = useState<InitializationResult | null>(null);

  const initializeTables = async () => {
    setIsInitializing(true);
    setResult(null);

    try {
      console.log('🚀 Iniciando inicialização das tabelas de comissão...');

      // Dados iniciais para as tabelas
      const initialData = {
        channelSeller: {
          id: 'cs_default_001',
          months_12: 0.60,
          months_24: 1.20,
          months_36: 2.00,
          months_48: 2.00,
          months_60: 2.00
        },
        channelDirector: {
          id: 'cd_default_001',
          months_12: 0,
          months_24: 0,
          months_36: 0,
          months_48: 0,
          months_60: 0
        },
        seller: {
          id: 's_default_001',
          months_12: 1.2,
          months_24: 2.4,
          months_36: 3.6,
          months_48: 3.6,
          months_60: 3.6
        },
        channelInfluencer: [
          { id: 'ci_range_001', revenue_range: "Até 500,00", revenue_min: 0, revenue_max: 500, months_12: 1.50, months_24: 2.00, months_36: 2.50, months_48: 2.50, months_60: 2.50 },
          { id: 'ci_range_002', revenue_range: "500,01 a 1.000,00", revenue_min: 500.01, revenue_max: 1000, months_12: 2.51, months_24: 3.25, months_36: 4.00, months_48: 4.00, months_60: 4.00 },
          { id: 'ci_range_003', revenue_range: "1.000,01 a 1.500,00", revenue_min: 1000.01, revenue_max: 1500, months_12: 4.01, months_24: 4.50, months_36: 5.00, months_48: 5.00, months_60: 5.00 },
          { id: 'ci_range_004', revenue_range: "1.500,01 a 3.000,00", revenue_min: 1500.01, revenue_max: 3000, months_12: 5.01, months_24: 5.50, months_36: 6.00, months_48: 6.00, months_60: 6.00 },
          { id: 'ci_range_005', revenue_range: "3.000,01 a 5.000,00", revenue_min: 3000.01, revenue_max: 5000, months_12: 6.01, months_24: 6.50, months_36: 7.00, months_48: 7.00, months_60: 7.00 },
          { id: 'ci_range_006', revenue_range: "Acima de 5.000,01", revenue_min: 5000.01, revenue_max: 99999999, months_12: 7.01, months_24: 7.50, months_36: 8.00, months_48: 8.00, months_60: 8.00 }
        ],
        channelIndicator: [
          { id: 'cind_range_001', revenue_range: "Até 500,00", revenue_min: 0, revenue_max: 500, months_12: 0.50, months_24: 0.67, months_36: 0.83, months_48: 0.83, months_60: 0.83 },
          { id: 'cind_range_002', revenue_range: "500,01 a 1.000,00", revenue_min: 500.01, revenue_max: 1000, months_12: 0.84, months_24: 1.08, months_36: 1.33, months_48: 1.33, months_60: 1.33 },
          { id: 'cind_range_003', revenue_range: "1.000,01 a 1.500,00", revenue_min: 1000.01, revenue_max: 1500, months_12: 1.34, months_24: 1.50, months_36: 1.67, months_48: 1.67, months_60: 1.67 },
          { id: 'cind_range_004', revenue_range: "1.500,01 a 3.000,00", revenue_min: 1500.01, revenue_max: 3000, months_12: 1.67, months_24: 1.83, months_36: 2.00, months_48: 2.00, months_60: 2.00 },
          { id: 'cind_range_005', revenue_range: "3.000,01 a 5.000,00", revenue_min: 3000.01, revenue_max: 5000, months_12: 2.00, months_24: 2.17, months_36: 2.50, months_48: 2.50, months_60: 2.50 },
          { id: 'cind_range_006', revenue_range: "Acima de 5.000,01", revenue_min: 5000.01, revenue_max: 99999999, months_12: 2.34, months_24: 2.50, months_36: 3.00, months_48: 3.00, months_60: 3.00 }
        ]
      };

      const results: any = {};

      // 1. Inicializar commission_channel_seller
      try {
        const { data: existing } = await supabase
          .from('commission_channel_seller')
          .select('*')
          .single();

        if (!existing) {
          const { data, error } = await supabase
            .from('commission_channel_seller')
            .upsert([initialData.channelSeller], { onConflict: 'id' })
            .select()
            .single();
          
          if (error) throw error;
          results.channelSeller = { action: 'created', data };
        } else {
          results.channelSeller = { action: 'exists', data: existing };
        }
      } catch (error: any) {
        results.channelSeller = { action: 'error', error: error.message };
      }

      // 2. Inicializar commission_channel_director
      try {
        const { data: existing } = await supabase
          .from('commission_channel_director')
          .select('*')
          .single();

        if (!existing) {
          const { data, error } = await supabase
            .from('commission_channel_director')
            .upsert([initialData.channelDirector], { onConflict: 'id' })
            .select()
            .single();
          
          if (error) throw error;
          results.channelDirector = { action: 'created', data };
        } else {
          results.channelDirector = { action: 'exists', data: existing };
        }
      } catch (error: any) {
        results.channelDirector = { action: 'error', error: error.message };
      }

      // 3. Inicializar commission_seller
      try {
        const { data: existing } = await supabase
          .from('commission_seller')
          .select('*')
          .single();

        if (!existing) {
          const { data, error } = await supabase
            .from('commission_seller')
            .upsert([initialData.seller], { onConflict: 'id' })
            .select()
            .single();
          
          if (error) throw error;
          results.seller = { action: 'created', data };
        } else {
          results.seller = { action: 'exists', data: existing };
        }
      } catch (error: any) {
        results.seller = { action: 'error', error: error.message };
      }

      // 4. Inicializar commission_channel_influencer
      try {
        const { data: existing } = await supabase
          .from('commission_channel_influencer')
          .select('*');

        if (!existing || existing.length === 0) {
          const { data, error } = await supabase
            .from('commission_channel_influencer')
            .upsert(initialData.channelInfluencer, { onConflict: 'id' })
            .select();
          
          if (error) throw error;
          results.channelInfluencer = { action: 'created', data, count: data?.length || 0 };
        } else {
          results.channelInfluencer = { action: 'exists', data: existing, count: existing.length };
        }
      } catch (error: any) {
        results.channelInfluencer = { action: 'error', error: error.message };
      }

      // 5. Inicializar commission_channel_indicator
      try {
        const { data: existing } = await supabase
          .from('commission_channel_indicator')
          .select('*');

        if (!existing || existing.length === 0) {
          const { data, error } = await supabase
            .from('commission_channel_indicator')
            .upsert(initialData.channelIndicator, { onConflict: 'id' })
            .select();
          
          if (error) throw error;
          results.channelIndicator = { action: 'created', data, count: data?.length || 0 };
        } else {
          results.channelIndicator = { action: 'exists', data: existing, count: existing.length };
        }
      } catch (error: any) {
        results.channelIndicator = { action: 'error', error: error.message };
      }

      const successCount = Object.values(results).filter((r: any) => r.action !== 'error').length;
      const totalCount = Object.keys(results).length;

      setResult({
        success: successCount === totalCount,
        message: successCount === totalCount 
          ? '✅ Todas as tabelas foram inicializadas com sucesso!'
          : `⚠️ ${successCount}/${totalCount} tabelas inicializadas com sucesso`,
        details: results
      });

    } catch (error: any) {
      console.error('❌ Erro ao inicializar tabelas:', error);
      setResult({
        success: false,
        message: `❌ Erro ao inicializar tabelas: ${error.message}`,
        details: { error: error.message }
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const getStatusIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'exists':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card className="bg-slate-900/80 border-slate-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Inicializador de Tabelas de Comissão
        </CardTitle>
        <p className="text-sm text-slate-400">
          Este componente verifica e inicializa as tabelas de comissão no Supabase com dados padrão.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={initializeTables} 
          disabled={isInitializing}
          className="w-full"
        >
          {isInitializing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Inicializando...
            </>
          ) : (
            'Inicializar Tabelas de Comissão'
          )}
        </Button>

        {result && (
          <Alert className={`${result.success ? 'border-green-500' : 'border-red-500'}`}>
            <AlertDescription>
              {result.message}
            </AlertDescription>
          </Alert>
        )}

        {result?.details && (
          <div className="space-y-3">
            <h4 className="font-semibold">Detalhes da Inicialização:</h4>
            {Object.entries(result.details).map(([tableName, info]: [string, any]) => (
              <div key={tableName} className="flex items-center justify-between p-3 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  {getStatusIcon(info.action)}
                  <span className="font-medium">{tableName}</span>
                </div>
                <div className="text-sm text-slate-400">
                  {info.action === 'created' && 'Criado'}
                  {info.action === 'exists' && 'Já existe'}
                  {info.action === 'error' && `Erro: ${info.error}`}
                  {info.count && ` (${info.count} registros)`}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-slate-800/30 rounded text-sm">
          <h5 className="font-semibold mb-2">📋 Instruções:</h5>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>Execute o script SQL fornecido no Supabase SQL Editor primeiro</li>
            <li>Clique no botão "Inicializar Tabelas" acima</li>
            <li>Verifique se todas as tabelas foram criadas com sucesso</li>
            <li>Teste o hook useCommissions nos calculadores</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

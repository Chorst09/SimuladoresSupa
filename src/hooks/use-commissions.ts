import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/use-auth';

interface CommissionChannelSeller {
  id: string;
  months_12: number;
  months_24: number;
  months_36: number;
  months_48: number;
  months_60: number;
}

interface CommissionChannelDirector {
  id: string;
  months_12: number;
  months_24: number;
  months_36: number;
  months_48: number;
  months_60: number;
}

interface CommissionSeller {
  id: string;
  months_12: number;
  months_24: number;
  months_36: number;
  months_48: number;
  months_60: number;
}

interface CommissionChannelInfluencer {
  id: string;
  revenue_range: string;
  revenue_min: number;
  revenue_max: number;
  months_12: number;
  months_24: number;
  months_36: number;
  months_48: number;
  months_60: number;
}

interface CommissionChannelIndicator {
  id: string;
  revenue_range: string;
  revenue_min: number;
  revenue_max: number;
  months_12: number;
  months_24: number;
  months_36: number;
  months_48: number;
  months_60: number;
}

interface UseCommissionsResult {
  channelSeller: CommissionChannelSeller | null;
  channelDirector: CommissionChannelDirector | null;
  seller: CommissionSeller | null;
  channelInfluencer: CommissionChannelInfluencer[] | null;
  channelIndicator: CommissionChannelIndicator[] | null;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  maxRetries: number;
  refreshData: () => Promise<void>;
}

// Fallback data based on design document
const FALLBACK_CHANNEL_SELLER: CommissionChannelSeller = {
  id: 'cs_default_001',
  months_12: 0.60,
  months_24: 1.20,
  months_36: 2.00,
  months_48: 2.00,
  months_60: 2.00
};

const FALLBACK_CHANNEL_DIRECTOR: CommissionChannelDirector = {
  id: 'cd_default_001',
  months_12: 0,
  months_24: 0,
  months_36: 0,
  months_48: 0,
  months_60: 0
};

const FALLBACK_SELLER: CommissionSeller = {
  id: 's_default_001',
  months_12: 1.2,
  months_24: 2.4,
  months_36: 3.6,
  months_48: 3.6,
  months_60: 3.6
};

const FALLBACK_CHANNEL_INFLUENCER: CommissionChannelInfluencer[] = [
  { id: 'ci_range_001', revenue_range: "Até 500,00", revenue_min: 0, revenue_max: 500, months_12: 1.50, months_24: 2.00, months_36: 2.50, months_48: 2.50, months_60: 2.50 },
  { id: 'ci_range_002', revenue_range: "500,01 a 1.000,00", revenue_min: 500.01, revenue_max: 1000, months_12: 2.51, months_24: 3.25, months_36: 4.00, months_48: 4.00, months_60: 4.00 },
  { id: 'ci_range_003', revenue_range: "1.000,01 a 1.500,00", revenue_min: 1000.01, revenue_max: 1500, months_12: 4.01, months_24: 4.50, months_36: 5.00, months_48: 5.00, months_60: 5.00 },
  { id: 'ci_range_004', revenue_range: "1.500,01 a 3.000,00", revenue_min: 1500.01, revenue_max: 3000, months_12: 5.01, months_24: 5.50, months_36: 6.00, months_48: 6.00, months_60: 6.00 },
  { id: 'ci_range_005', revenue_range: "3.000,01 a 5.000,00", revenue_min: 3000.01, revenue_max: 5000, months_12: 6.01, months_24: 6.50, months_36: 7.00, months_48: 7.00, months_60: 7.00 },
  { id: 'ci_range_006', revenue_range: "Acima de 5.000,01", revenue_min: 5000.01, revenue_max: 99999999, months_12: 7.01, months_24: 7.50, months_36: 8.00, months_48: 8.00, months_60: 8.00 }
];

const FALLBACK_CHANNEL_INDICATOR: CommissionChannelIndicator[] = [
  { id: 'cind_range_001', revenue_range: "Até 500,00", revenue_min: 0, revenue_max: 500, months_12: 0.50, months_24: 0.67, months_36: 0.83, months_48: 0.83, months_60: 0.83 },
  { id: 'cind_range_002', revenue_range: "500,01 a 1.000,00", revenue_min: 500.01, revenue_max: 1000, months_12: 0.84, months_24: 1.08, months_36: 1.33, months_48: 1.33, months_60: 1.33 },
  { id: 'cind_range_003', revenue_range: "1.000,01 a 1.500,00", revenue_min: 1000.01, revenue_max: 1500, months_12: 1.34, months_24: 1.50, months_36: 1.67, months_48: 1.67, months_60: 1.67 },
  { id: 'cind_range_004', revenue_range: "1.500,01 a 3.000,00", revenue_min: 1500.01, revenue_max: 3000, months_12: 1.67, months_24: 1.83, months_36: 2.00, months_48: 2.00, months_60: 2.00 },
  { id: 'cind_range_005', revenue_range: "3.000,01 a 5.000,00", revenue_min: 3000.01, revenue_max: 5000, months_12: 2.00, months_24: 2.17, months_36: 2.50, months_48: 2.50, months_60: 2.50 },
  { id: 'cind_range_006', revenue_range: "Acima de 5.000,01", revenue_min: 5000.01, revenue_max: 99999999, months_12: 2.34, months_24: 2.50, months_36: 3.00, months_48: 3.00, months_60: 3.00 }
];

export function useCommissions(): UseCommissionsResult {
  const { user, loading: authLoading } = useAuth();
  const [channelSeller, setChannelSeller] = useState<CommissionChannelSeller | null>(FALLBACK_CHANNEL_SELLER);
  const [channelDirector, setChannelDirector] = useState<CommissionChannelDirector | null>(FALLBACK_CHANNEL_DIRECTOR);
  const [seller, setSeller] = useState<CommissionSeller | null>(FALLBACK_SELLER);
  const [channelInfluencer, setChannelInfluencer] = useState<CommissionChannelInfluencer[] | null>(FALLBACK_CHANNEL_INFLUENCER);
  const [channelIndicator, setChannelIndicator] = useState<CommissionChannelIndicator[] | null>(FALLBACK_CHANNEL_INDICATOR);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  const validateCommissionData = (data: any, type: string): boolean => {
    if (!data) return false;

    if (type === 'array') {
      return Array.isArray(data) && data.length > 0 &&
        data.every(item =>
          typeof item.months_12 === 'number' &&
          typeof item.months_24 === 'number' &&
          typeof item.months_36 === 'number' &&
          typeof item.months_48 === 'number' &&
          typeof item.months_60 === 'number'
        );
    } else {
      return typeof data.months_12 === 'number' &&
        typeof data.months_24 === 'number' &&
        typeof data.months_36 === 'number' &&
        typeof data.months_48 === 'number' &&
        typeof data.months_60 === 'number';
    }
  };

  const fetchData = async (attempt = 0): Promise<void> => {
    try {
      // Como já temos dados de fallback, não precisamos mostrar loading
      // Apenas limpar erro se houver
      setError(null);

      console.log(`🔄 useCommissions: Tentativa ${attempt + 1}/${maxRetries + 1} de carregamento das comissões`);

      // Se não há usuário, manter dados de fallback
      if (!user) {
        console.log('👤 useCommissions: Sem usuário autenticado, mantendo dados de fallback');
        setIsLoading(false);
        return;
      }

      // Verificar conectividade do Supabase com timeout reduzido
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout na verificação de sessão')), 3000)
        );

        const { data: { session: sessionData }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;

        if (sessionError) {
          console.warn('⚠️ useCommissions: Erro na sessão:', sessionError.message);
          if (attempt < maxRetries) {
            console.log(`🔄 useCommissions: Tentando novamente em 1 segundo...`);
            setTimeout(() => fetchData(attempt + 1), 1000);
            return;
          }
          // Se falhou todas as tentativas, manter fallback
          setIsLoading(false);
          return;
        }
      } catch (sessionErr) {
        console.warn('❌ useCommissions: Erro ao verificar sessão:', sessionErr);
        if (attempt < maxRetries) {
          console.log(`🔄 useCommissions: Tentando novamente em 1 segundo...`);
          setTimeout(() => fetchData(attempt + 1), 1000);
          return;
        }
        // Se falhou todas as tentativas, manter fallback
        setIsLoading(false);
        return;
      }

      // Tentar buscar dados do Supabase com timeout reduzido
      const fetchWithRetry = async (tableName: string, query: any) => {
        try {
          const promise = query;
          const timeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout ao buscar ${tableName}`)), 4000)
          );

          return await Promise.race([promise, timeout]);
        } catch (error) {
          console.warn(`⚠️ useCommissions: Erro ao buscar ${tableName}:`, error);
          throw error;
        }
      };

      const results = await Promise.allSettled([
        // Canal/Vendedor
        fetchWithRetry('commission_channel_seller',
          supabase.from('commission_channel_seller').select('*').single()
        ),
        // Canal/Diretor
        fetchWithRetry('commission_channel_director',
          supabase.from('commission_channel_director').select('*').single()
        ),
        // Vendedor
        fetchWithRetry('commission_seller',
          supabase.from('commission_seller').select('*').single()
        ),
        // Canal Influenciador
        fetchWithRetry('commission_channel_influencer',
          supabase.from('commission_channel_influencer').select('*').order('revenue_min', { ascending: true })
        ),
        // Canal Indicador
        fetchWithRetry('commission_channel_indicator',
          supabase.from('commission_channel_indicator').select('*').order('revenue_min', { ascending: true })
        )
      ]);

      // Processar resultados com fallback inteligente
      const [
        channelSellerResult,
        channelDirectorResult,
        sellerResult,
        channelInfluencerResult,
        channelIndicatorResult
      ] = results;

      // Só atualizar os dados se conseguiu carregar do Supabase
      // Caso contrário, manter os dados de fallback já inicializados

      // Canal/Vendedor
      if (channelSellerResult.status === 'fulfilled' &&
        channelSellerResult.value?.data &&
        validateCommissionData(channelSellerResult.value.data, 'single')) {
        setChannelSeller(channelSellerResult.value.data);
        console.log('✅ useCommissions: Canal/Vendedor carregado do Supabase');
      } else {
        console.log('📋 useCommissions: Canal/Vendedor mantendo fallback');
      }

      // Canal/Diretor
      if (channelDirectorResult.status === 'fulfilled' &&
        channelDirectorResult.value?.data &&
        validateCommissionData(channelDirectorResult.value.data, 'single')) {
        setChannelDirector(channelDirectorResult.value.data);
        console.log('✅ useCommissions: Canal/Diretor carregado do Supabase');
      } else {
        console.log('📋 useCommissions: Canal/Diretor mantendo fallback');
      }

      // Vendedor
      if (sellerResult.status === 'fulfilled' &&
        sellerResult.value?.data &&
        validateCommissionData(sellerResult.value.data, 'single')) {
        setSeller(sellerResult.value.data);
        console.log('✅ useCommissions: Vendedor carregado do Supabase');
      } else {
        console.log('📋 useCommissions: Vendedor mantendo fallback');
      }

      // Canal Influenciador
      if (channelInfluencerResult.status === 'fulfilled' &&
        channelInfluencerResult.value?.data &&
        validateCommissionData(channelInfluencerResult.value.data, 'array')) {
        setChannelInfluencer(channelInfluencerResult.value.data);
        console.log('✅ useCommissions: Canal Influenciador carregado do Supabase');
      } else {
        console.log('📋 useCommissions: Canal Influenciador mantendo fallback');
      }

      // Canal Indicador
      if (channelIndicatorResult.status === 'fulfilled' &&
        channelIndicatorResult.value?.data &&
        validateCommissionData(channelIndicatorResult.value.data, 'array')) {
        setChannelIndicator(channelIndicatorResult.value.data);
        console.log('✅ useCommissions: Canal Indicador carregado do Supabase');
      } else {
        console.log('📋 useCommissions: Canal Indicador mantendo fallback');
      }

      // Verificar se pelo menos uma tabela foi carregada com sucesso
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      console.log(`📊 useCommissions: ${successCount}/${results.length} tabelas carregadas com sucesso`);

      // Se nenhuma tabela foi carregada e ainda temos tentativas, retry
      if (successCount === 0 && attempt < maxRetries) {
        console.log(`🔄 useCommissions: Nenhuma tabela carregada, tentando novamente em 1 segundo...`);
        setRetryCount(attempt + 1);
        setTimeout(() => fetchData(attempt + 1), 1000);
        return;
      }

      // Reset retry count on success
      setRetryCount(0);
      console.log(`🎉 useCommissions: Carregamento concluído (${successCount}/${results.length} tabelas do Supabase)`);

    } catch (err) {
      console.error('❌ useCommissions: Erro crítico:', err);

      // Se ainda temos tentativas, retry
      if (attempt < maxRetries) {
        console.log(`🔄 useCommissions: Erro crítico, tentando novamente em 1 segundo...`);
        setRetryCount(attempt + 1);
        setTimeout(() => fetchData(attempt + 1), 1000);
        return;
      }

      // Última tentativa falhou, manter fallback e reportar erro
      console.log('📋 useCommissions: Todas as tentativas falharam, mantendo dados de fallback');
      setError(`Erro ao carregar comissões após ${maxRetries + 1} tentativas. Usando dados padrão.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Só tentar carregar dados do Supabase quando a autenticação terminar de carregar
    if (!authLoading) {
      console.log('🚀 useCommissions: Iniciando carregamento das tabelas de comissão');
      fetchData(0).catch((err) => {
        console.error('💥 useCommissions: Erro crítico no useEffect:', err);
        // Em caso de erro crítico, manter dados de fallback e parar loading
        setIsLoading(false);
        setError('Erro crítico ao inicializar comissões. Usando dados padrão.');
      });
    }
  }, [authLoading]);

  return {
    channelSeller,
    channelDirector,
    seller,
    channelInfluencer,
    channelIndicator,
    isLoading,
    error,
    retryCount,
    maxRetries,
    refreshData: () => fetchData(0)
  };
}

export function getCommissionRate(
  commissions: CommissionChannelIndicator[] | CommissionChannelInfluencer[] | null,
  monthlyRevenue: number,
  contractPeriod: number
): number {
  if (!commissions || commissions.length === 0) {
    return 0;
  }

  // Encontrar a faixa de comissão adequada
  const commission = commissions.find(
    c => monthlyRevenue >= c.revenue_min && monthlyRevenue <= c.revenue_max
  );

  if (!commission) return 0;

  // Retornar a taxa de comissão baseada no período do contrato
  if (contractPeriod <= 12) return commission.months_12;
  if (contractPeriod <= 24) return commission.months_24;
  if (contractPeriod <= 36) return commission.months_36;
  if (contractPeriod <= 48) return commission.months_48;
  return commission.months_60;
}

export function getDirectorCommissionRate(
  commission: CommissionChannelDirector | null,
  contractPeriod: number
): number {
  if (!commission) return 0;

  // Retornar a taxa de comissão baseada no período do contrato
  if (contractPeriod <= 12) return commission.months_12;
  if (contractPeriod <= 24) return commission.months_24;
  if (contractPeriod <= 36) return commission.months_36;
  if (contractPeriod <= 48) return commission.months_48;
  return commission.months_60;
}

export function getChannelSellerCommissionRate(
  commission: CommissionChannelSeller | null,
  contractPeriod: number
): number {
  if (!commission) return 0;

  // Retornar a taxa de comissão baseada no período do contrato
  if (contractPeriod <= 12) return commission.months_12;
  if (contractPeriod <= 24) return commission.months_24;
  if (contractPeriod <= 36) return commission.months_36;
  if (contractPeriod <= 48) return commission.months_48;
  return commission.months_60;
}

export function getSellerCommissionRate(
  commission: CommissionSeller | null,
  contractPeriod: number
): number {
  if (!commission) return 0;

  // Retornar a taxa de comissão baseada no período do contrato
  if (contractPeriod <= 12) return commission.months_12;
  if (contractPeriod <= 24) return commission.months_24;
  if (contractPeriod <= 36) return commission.months_36;
  if (contractPeriod <= 48) return commission.months_48;
  return commission.months_60;
}

export function getChannelInfluencerCommissionRate(
  commissions: CommissionChannelInfluencer[] | null,
  monthlyRevenue: number,
  contractPeriod: number
): number {
  if (!commissions || commissions.length === 0) return 0;

  // Encontrar a faixa de comissão adequada
  const commission = commissions.find(
    c => monthlyRevenue >= c.revenue_min && monthlyRevenue <= c.revenue_max
  );

  if (!commission) return 0;

  // Retornar a taxa de comissão baseada no período do contrato
  if (contractPeriod <= 12) return commission.months_12;
  if (contractPeriod <= 24) return commission.months_24;
  if (contractPeriod <= 36) return commission.months_36;
  if (contractPeriod <= 48) return commission.months_48;
  return commission.months_60;
}

export function getChannelIndicatorCommissionRate(
  commissions: CommissionChannelIndicator[] | null,
  monthlyRevenue: number,
  contractPeriod: number
): number {
  if (!commissions || commissions.length === 0) return 0;

  // Encontrar a faixa de comissão adequada
  const commission = commissions.find(
    c => monthlyRevenue >= c.revenue_min && monthlyRevenue <= c.revenue_max
  );

  if (!commission) return 0;

  // Retornar a taxa de comissão baseada no período do contrato
  if (contractPeriod <= 12) return commission.months_12;
  if (contractPeriod <= 24) return commission.months_24;
  if (contractPeriod <= 36) return commission.months_36;
  if (contractPeriod <= 48) return commission.months_48;
  return commission.months_60;
}

// Export all interfaces for use in other components
export type {
  CommissionChannelSeller,
  CommissionChannelDirector,
  CommissionSeller,
  CommissionChannelInfluencer,
  CommissionChannelIndicator,
  UseCommissionsResult
};
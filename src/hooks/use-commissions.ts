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
  refreshData: () => Promise<void>;
}

// Fallback data based on design document
const FALLBACK_CHANNEL_SELLER: CommissionChannelSeller = {
  id: 'fallback-1',
  months_12: 0.60,
  months_24: 1.20,
  months_36: 2.00,
  months_48: 2.00,
  months_60: 2.00
};

const FALLBACK_CHANNEL_DIRECTOR: CommissionChannelDirector = {
  id: 'fallback-1',
  months_12: 0,
  months_24: 0,
  months_36: 0,
  months_48: 0,
  months_60: 0
};

const FALLBACK_SELLER: CommissionSeller = {
  id: 'fallback-1',
  months_12: 1.2,
  months_24: 2.4,
  months_36: 3.6,
  months_48: 3.6,
  months_60: 3.6
};

const FALLBACK_CHANNEL_INFLUENCER: CommissionChannelInfluencer[] = [
  { id: 'fallback-1', revenue_range: "Até 500,00", revenue_min: 0, revenue_max: 500, months_12: 1.50, months_24: 2.00, months_36: 2.50, months_48: 2.50, months_60: 2.50 },
  { id: 'fallback-2', revenue_range: "500,01 a 1.000,00", revenue_min: 500.01, revenue_max: 1000, months_12: 2.51, months_24: 3.25, months_36: 4.00, months_48: 4.00, months_60: 4.00 },
  { id: 'fallback-3', revenue_range: "1.000,01 a 1.500,00", revenue_min: 1000.01, revenue_max: 1500, months_12: 4.01, months_24: 4.50, months_36: 5.00, months_48: 5.00, months_60: 5.00 },
  { id: 'fallback-4', revenue_range: "1.500,01 a 3.000,00", revenue_min: 1500.01, revenue_max: 3000, months_12: 5.01, months_24: 5.50, months_36: 6.00, months_48: 6.00, months_60: 6.00 },
  { id: 'fallback-5', revenue_range: "3.000,01 a 5.000,00", revenue_min: 3000.01, revenue_max: 5000, months_12: 6.01, months_24: 6.50, months_36: 7.00, months_48: 7.00, months_60: 7.00 },
  { id: 'fallback-6', revenue_range: "Acima de 5.000,01", revenue_min: 5000.01, revenue_max: 999999999, months_12: 7.01, months_24: 7.50, months_36: 8.00, months_48: 8.00, months_60: 8.00 }
];

const FALLBACK_CHANNEL_INDICATOR: CommissionChannelIndicator[] = [
  { id: 'fallback-1', revenue_range: "Até 500,00", revenue_min: 0, revenue_max: 500, months_12: 0.50, months_24: 0.67, months_36: 0.83, months_48: 0.83, months_60: 0.83 },
  { id: 'fallback-2', revenue_range: "500,01 a 1.000,00", revenue_min: 500.01, revenue_max: 1000, months_12: 0.84, months_24: 1.08, months_36: 1.33, months_48: 1.33, months_60: 1.33 },
  { id: 'fallback-3', revenue_range: "1.000,01 a 1.500,00", revenue_min: 1000.01, revenue_max: 1500, months_12: 1.34, months_24: 1.50, months_36: 1.67, months_48: 1.67, months_60: 1.67 },
  { id: 'fallback-4', revenue_range: "1.500,01 a 3.000,00", revenue_min: 1500.01, revenue_max: 3000, months_12: 1.67, months_24: 1.83, months_36: 2.00, months_48: 2.00, months_60: 2.00 },
  { id: 'fallback-5', revenue_range: "3.000,01 a 5.000,00", revenue_min: 3000.01, revenue_max: 5000, months_12: 2.00, months_24: 2.17, months_36: 2.50, months_48: 2.50, months_60: 2.50 },
  { id: 'fallback-6', revenue_range: "Acima de 5.000,01", revenue_min: 5000.01, revenue_max: 999999999, months_12: 2.34, months_24: 2.50, months_36: 3.00, months_48: 3.00, months_60: 3.00 }
];

export function useCommissions(): UseCommissionsResult {
  const { user, loading: authLoading } = useAuth();
  const [channelSeller, setChannelSeller] = useState<CommissionChannelSeller | null>(null);
  const [channelDirector, setChannelDirector] = useState<CommissionChannelDirector | null>(null);
  const [seller, setSeller] = useState<CommissionSeller | null>(null);
  const [channelInfluencer, setChannelInfluencer] = useState<CommissionChannelInfluencer[] | null>(null);
  const [channelIndicator, setChannelIndicator] = useState<CommissionChannelIndicator[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar se o usuário está autenticado
      if (!user) {
        setChannelSeller(FALLBACK_CHANNEL_SELLER);
        setChannelDirector(FALLBACK_CHANNEL_DIRECTOR);
        setSeller(FALLBACK_SELLER);
        setChannelInfluencer(FALLBACK_CHANNEL_INFLUENCER);
        setChannelIndicator(FALLBACK_CHANNEL_INDICATOR);
        return;
      }

      // Verificar sessão do Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao verificar sessão:', sessionError);
        throw new Error(`Erro ao verificar sessão: ${sessionError.message}`);
      }

      if (!session) {
        setChannelSeller(FALLBACK_CHANNEL_SELLER);
        setChannelDirector(FALLBACK_CHANNEL_DIRECTOR);
        setSeller(FALLBACK_SELLER);
        setChannelInfluencer(FALLBACK_CHANNEL_INFLUENCER);
        setChannelIndicator(FALLBACK_CHANNEL_INDICATOR);
        return;
      }

      // Buscar dados do Canal/Vendedor
      const { data: channelSellerData, error: channelSellerError } = await supabase
        .from('commission_channel_seller')
        .select('*')
        .single();

      // Buscar dados do Diretor
      const { data: channelDirectorData, error: channelDirectorError } = await supabase
        .from('commission_channel_director')
        .select('*')
        .single();

      // Buscar dados do Vendedor
      const { data: sellerData, error: sellerError } = await supabase
        .from('commission_seller')
        .select('*')
        .single();

      // Buscar dados do Canal Influenciador
      const { data: channelInfluencerData, error: channelInfluencerError } = await supabase
        .from('commission_channel_influencer')
        .select('*')
        .order('revenue_min', { ascending: true });

      // Buscar dados do Canal Indicador
      const { data: channelIndicatorData, error: channelIndicatorError } = await supabase
        .from('commission_channel_indicator')
        .select('*')
        .order('revenue_min', { ascending: true });

      // Validar e definir dados com fallback
      setChannelSeller(
        !channelSellerError && validateCommissionData(channelSellerData, 'single') 
          ? channelSellerData 
          : FALLBACK_CHANNEL_SELLER
      );

      setChannelDirector(
        !channelDirectorError && validateCommissionData(channelDirectorData, 'single') 
          ? channelDirectorData 
          : FALLBACK_CHANNEL_DIRECTOR
      );

      setSeller(
        !sellerError && validateCommissionData(sellerData, 'single') 
          ? sellerData 
          : FALLBACK_SELLER
      );

      setChannelInfluencer(
        !channelInfluencerError && validateCommissionData(channelInfluencerData, 'array') 
          ? channelInfluencerData 
          : FALLBACK_CHANNEL_INFLUENCER
      );

      setChannelIndicator(
        !channelIndicatorError && validateCommissionData(channelIndicatorData, 'array') 
          ? channelIndicatorData 
          : FALLBACK_CHANNEL_INDICATOR
      );

      // Log errors but don't throw - use fallback data instead
      if (channelSellerError) console.warn('Erro ao buscar Canal/Vendedor, usando fallback:', channelSellerError);
      if (channelDirectorError) console.warn('Erro ao buscar Diretor, usando fallback:', channelDirectorError);
      if (sellerError) console.warn('Erro ao buscar Vendedor, usando fallback:', sellerError);
      if (channelInfluencerError) console.warn('Erro ao buscar Canal Influenciador, usando fallback:', channelInfluencerError);
      if (channelIndicatorError) console.warn('Erro ao buscar Canal Indicador, usando fallback:', channelIndicatorError);

    } catch (err) {
      console.error('Erro geral ao carregar comissões:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados de comissões');
      
      // Use fallback data even on error
      setChannelSeller(FALLBACK_CHANNEL_SELLER);
      setChannelDirector(FALLBACK_CHANNEL_DIRECTOR);
      setSeller(FALLBACK_SELLER);
      setChannelInfluencer(FALLBACK_CHANNEL_INFLUENCER);
      setChannelIndicator(FALLBACK_CHANNEL_INDICATOR);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Always fetch data, even if user is not authenticated (will use fallback)
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, user]);

  return {
    channelSeller,
    channelDirector,
    seller,
    channelInfluencer,
    channelIndicator,
    isLoading,
    error,
    refreshData: fetchData
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
import { useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { getPermissionsForRole } from '@/lib/permissions';

export interface Proposal {
  id: string;
  baseId?: string;
  base_id?: string;
  title: string;
  status: string;
  type: string;
  value: number;
  created_at?: string;
  createdAt?: string;
  [key: string]: any;
}

export function useProposalsWithPermissions() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    if (!user || !user.role) {
      setProposals([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obter permissões do usuário
      const permissions = getPermissionsForRole(user.role as any);

      // Construir URL com parâmetros de permissão
      const params = new URLSearchParams({
        all: 'true',
        userRole: user.role,
        userId: user.id || ''
      });

      console.log('🔍 Buscando propostas com permissões:', {
        userRole: user.role,
        userId: user.id,
        canViewAllProposals: permissions.canViewAllProposals
      });

      const response = await fetch(`/api/proposals?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao carregar propostas');
      }

      const proposalsData = result.data?.proposals || [];
      
      console.log(`✅ ${proposalsData.length} propostas carregadas para ${user.role}:`, {
        total: proposalsData.length,
        canViewAll: permissions.canViewAllProposals
      });

      setProposals(proposalsData);
    } catch (error: any) {
      console.error('❌ Erro ao carregar propostas:', error);
      setError(error.message);
      setProposals([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    proposals,
    loading,
    error,
    fetchProposals,
    setProposals
  };
}

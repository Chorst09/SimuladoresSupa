import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/use-auth';

export type UserRole = 'admin' | 'director' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isDirector: boolean;
  isUser: boolean;
  canAccessCommissions: boolean;
  canAccessPricing: boolean;
  canAccessDRE: boolean;
  canViewAllProposals: boolean;
  refreshProfile: () => Promise<void>;
  updateRole: (userId: string, newRole: UserRole) => Promise<boolean>;
}

export function useUserProfile(): UseUserProfileResult {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // PRIMEIRO: Tentar buscar na tabela 'users' (que sabemos que funciona)
      let fallbackRole: UserRole = 'user';
      try {
        const { data: usersData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (usersData?.role) {
          fallbackRole = usersData.role as UserRole;
          console.log('Role encontrada na tabela users:', fallbackRole);
        }
      } catch (usersErr) {
        console.warn('Tabela users não encontrada ou erro:', usersErr);
      }

      // SEGUNDO: Tentar buscar na tabela user_profiles
      let data = null;
      let profileError = null;
      
      try {
        const result = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        data = result.data;
        profileError = result.error;
      } catch (err) {
        console.warn('Erro ao buscar user_profiles, usando fallback:', err);
        profileError = err as any;
      }

      if (profileError || !data) {
        console.log('Criando perfil com role do fallback:', fallbackRole);
        
        // Criar perfil usando o role da tabela users como fallback
        const profileData: UserProfile = {
          id: user.id,
          email: user.email || '',
          role: fallbackRole, // Usar role da tabela users
          full_name: user.user_metadata?.full_name || user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setProfile(profileData);
        
        // Tentar criar na tabela user_profiles (sem bloquear se falhar)
        try {
          await supabase
            .from('user_profiles')
            .upsert(profileData, { onConflict: 'id' });
        } catch (insertErr) {
          console.warn('Não foi possível inserir em user_profiles:', insertErr);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Erro ao buscar perfil do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
      
      // Fallback final: usar dados básicos
      if (user) {
        setProfile({
          id: user.id,
          email: user.email || '',
          role: 'user',
          full_name: user.user_metadata?.full_name || user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: UserRole): Promise<boolean> => {
    try {
      // Verificar se o usuário atual é admin
      if (profile?.role !== 'admin') {
        throw new Error('Apenas administradores podem alterar roles');
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      // Se está atualizando o próprio perfil, recarregar
      if (userId === user?.id) {
        await fetchProfile();
      }

      return true;
    } catch (err) {
      console.error('Erro ao atualizar role:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar role');
      return false;
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchProfile();
    }
  }, [authLoading, user]);

  // Computed properties baseadas no role
  const isAdmin = profile?.role === 'admin';
  const isDirector = profile?.role === 'director';
  const isUser = profile?.role === 'user';

  // Permissões baseadas no role
  const canAccessCommissions = isAdmin; // Apenas admin pode ver comissões
  const canAccessPricing = isAdmin; // Apenas admin pode ver tabelas de preços
  const canAccessDRE = isAdmin; // Apenas admin pode ver DRE
  const canViewAllProposals = isAdmin || isDirector; // Admin e Diretor podem ver todas as propostas

  return {
    profile,
    isLoading,
    error,
    isAdmin,
    isDirector,
    isUser,
    canAccessCommissions,
    canAccessPricing,
    canAccessDRE,
    canViewAllProposals,
    refreshProfile: fetchProfile,
    updateRole
  };
}

// Hook para verificar permissões específicas
export function usePermissions() {
  const { 
    canAccessCommissions, 
    canAccessPricing, 
    canAccessDRE, 
    canViewAllProposals,
    isAdmin,
    isDirector,
    isUser
  } = useUserProfile();

  const checkPermission = (permission: string): boolean => {
    switch (permission) {
      case 'commissions':
        return canAccessCommissions;
      case 'pricing':
        return canAccessPricing;
      case 'dre':
        return canAccessDRE;
      case 'all_proposals':
        return canViewAllProposals;
      case 'admin_only':
        return isAdmin;
      case 'director_or_admin':
        return isDirector || isAdmin;
      default:
        return false;
    }
  };

  return {
    checkPermission,
    canAccessCommissions,
    canAccessPricing,
    canAccessDRE,
    canViewAllProposals,
    isAdmin,
    isDirector,
    isUser
  };
}

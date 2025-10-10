import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabaseClient';

interface PasswordCheckResult {
  needsPasswordChange: boolean;
  loading: boolean;
  error: string | null;
  checkComplete: boolean;
}

export function usePasswordCheck(): PasswordCheckResult {
  const { user } = useAuth();
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    const checkPasswordStatus = async () => {
      if (!user?.id) {
        setLoading(false);
        setCheckComplete(true);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check if user needs to change password
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('password_changed, created_by_admin')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Erro ao verificar status da senha:', profileError?.message || profileError);
          setError('Erro ao verificar status da senha');
          setNeedsPasswordChange(false);
        } else {
          // User needs to change password if:
          // 1. password_changed is false OR null
          // 2. AND was created by admin
          const needsChange = (profile.password_changed === false || profile.password_changed === null) && 
                             profile.created_by_admin === true;
          
          console.log('Password check result:', {
            userId: user.id,
            passwordChanged: profile.password_changed,
            createdByAdmin: profile.created_by_admin,
            needsChange
          });
          
          setNeedsPasswordChange(needsChange);
        }
      } catch (err: any) {
        console.error('Erro na verificação de senha:', err);
        setError(err.message || 'Erro na verificação de senha');
        setNeedsPasswordChange(false);
      } finally {
        setLoading(false);
        setCheckComplete(true);
      }
    };

    checkPasswordStatus();
  }, [user?.id]);

  return {
    needsPasswordChange,
    loading,
    error,
    checkComplete
  };
}

// Hook para marcar que a senha foi alterada
export function useMarkPasswordChanged() {
  const { user } = useAuth();

  const markPasswordChanged = async (): Promise<boolean> => {
    if (!user?.id) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          password_changed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao marcar senha como alterada:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Erro ao marcar senha como alterada:', err);
      return false;
    }
  };

  return { markPasswordChanged };
}
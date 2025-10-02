import { supabase } from './supabaseClient';

/**
 * Limpa completamente a sessão de autenticação
 * Útil quando há problemas com refresh tokens
 */
export const clearAuthSession = async () => {
  try {
    // Tentar fazer logout normal primeiro
    await supabase.auth.signOut({ scope: 'local' });
  } catch (error) {
    console.warn('Erro ao fazer logout normal:', error);
  }

  // Limpar todos os dados de autenticação do storage
  if (typeof window !== 'undefined') {
    // Limpar localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Limpar sessionStorage
    sessionStorage.clear();
  }
};

/**
 * Verifica se o erro é relacionado a refresh token
 */
export const isRefreshTokenError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorName = error.name?.toLowerCase() || '';
  
  return (
    errorMessage.includes('refresh token') ||
    errorMessage.includes('invalid refresh') ||
    errorMessage.includes('token not found') ||
    errorName.includes('authapierror')
  );
};

/**
 * Tenta recuperar a sessão ou limpa se inválida
 */
export const recoverOrClearSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error && isRefreshTokenError(error)) {
      console.log('🔄 Sessão inválida detectada, limpando...');
      await clearAuthSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Erro ao recuperar sessão:', error);
    if (isRefreshTokenError(error)) {
      await clearAuthSession();
    }
    return null;
  }
};
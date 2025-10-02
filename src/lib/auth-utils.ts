import { supabase } from './supabaseClient';

/**
 * Limpa completamente a sessão de autenticação
 * Útil quando há problemas com refresh tokens
 */
export const clearAuthSession = async () => {
  try {
    // Tentar fazer logout com escopo global primeiro
    await supabase.auth.signOut({ scope: 'global' });
  } catch (error) {
    console.warn('Erro ao fazer logout global:', error);
    try {
      // Se falhar, tentar logout local
      await supabase.auth.signOut({ scope: 'local' });
    } catch (localError) {
      console.warn('Erro ao fazer logout local:', localError);
    }
  }

  // Limpar TODOS os dados de storage
  if (typeof window !== 'undefined') {
    // Limpar completamente localStorage
    localStorage.clear();
    
    // Limpar completamente sessionStorage
    sessionStorage.clear();
    
    // Limpar cookies relacionados ao Supabase (se houver)
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
  }
};

/**
 * Reset completo da autenticação - força um estado limpo
 */
export const forceAuthReset = async () => {
  console.log('🔄 Forçando reset completo da autenticação...');
  
  // Limpar sessão
  await clearAuthSession();
  
  // Recriar cliente Supabase com configuração limpa
  if (typeof window !== 'undefined') {
    // Aguardar um pouco para garantir que tudo foi limpo
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Recarregar a página para garantir estado limpo
    window.location.reload();
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
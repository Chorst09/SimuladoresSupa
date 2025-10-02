// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/types'; // Import UserProfile from central types
import { clearAuthSession, isRefreshTokenError, recoverOrClearSession } from '@/lib/auth-utils';

// Define o tipo para o contexto de autenticação
interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    setIsMounted(true);
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Inicializando autenticação...');
        
        // Get initial session with error handling
        const session = await recoverOrClearSession();
        
        if (!session) {
          console.log('📋 Nenhuma sessão válida encontrada');
          if (mountedRef.current) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        console.log('📋 Sessão inicial:', session ? 'Encontrada' : 'Não encontrada');

        if (session?.user && mountedRef.current) {
          await processUser(session.user);
        } else if (mountedRef.current) {
          setUser(null);
        }

        if (mountedRef.current) {
          setLoading(false);
        }

        // Setup auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔔 Auth state change:', event, session ? 'User present' : 'No user');
          
          if (!mountedRef.current) return;

          try {
            if (event === 'SIGNED_IN' && session?.user) {
              console.log('Checking user role in auth state change...');
              setLoading(true); // Manter loading durante processamento
              await processUser(session.user);
            } else if (event === 'SIGNED_OUT' || !session?.user) {
              console.log('User signed out or no user present');
              setUser(null);
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
              console.log('Token refreshed successfully');
              await processUser(session.user);
            }
          } catch (error) {
            console.error('❌ Erro no auth state change:', error);
            // Se houver erro de token, fazer logout local
            if (isRefreshTokenError(error)) {
              console.log('🔄 Token inválido, fazendo logout local...');
              setUser(null);
              if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
              }
            }
          }
          
          if (mountedRef.current) {
            // Aguardar um pouco antes de definir loading como false para dar tempo ao processamento
            setTimeout(() => {
              if (mountedRef.current) {
                setLoading(false);
              }
            }, 200);
          }
        });

        authSubscription = subscription;

      } catch (error) {
        console.error('❌ Erro na inicialização da auth:', error);
        if (mountedRef.current) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    const processUser = async (supabaseUser: SupabaseUser) => {
      try {
        console.log('👤 Processando usuário:', supabaseUser.email);
        
        // Check if user has role in Supabase profiles table
        let { data: userData, error } = await supabase
          .from('profiles')
          .select('role, full_name, password_changed') // Adicionar campo password_changed
          .eq('id', supabaseUser.id)
          .single();

        // Se der erro na coluna password_changed, tentar sem ela
        if (error && error.message?.includes('password_changed')) {
          console.log('Coluna password_changed não existe, carregando sem ela...');
          const { data: userDataFallback, error: errorFallback } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', supabaseUser.id)
            .single();
          
          userData = userDataFallback;
          error = errorFallback;
        }

        let role: UserProfile['role'] = 'user';
        let passwordChanged = true; // Default para usuários existentes

        if (!error && userData) {
          role = userData.role || 'user';
          passwordChanged = userData.password_changed !== false; // Se não existe o campo, assume true
          console.log('✅ Role encontrada:', role, 'Password changed:', passwordChanged);
        } else {
          console.log('⚠️ Usuário não encontrado na tabela profiles, verificando email...');
          
          // If no user document exists, check if user is admin by email
          if (supabaseUser.email === 'admin@example.com' || supabaseUser.email === 'carlos.horst@doubletelecom.com.br') {
            role = 'admin';
            passwordChanged = true; // Admin não precisa alterar senha
            console.log('🔑 Email de admin detectado, criando registro...');
            
            // Create user record with admin role
            const adminProfile = {
              id: supabaseUser.id,
              email: supabaseUser.email,
              role: 'admin',
              full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email
            };

            try {
              await supabase
                .from('profiles')
                .upsert({
                  ...adminProfile,
                  password_changed: true
                });
            } catch (upsertError: any) {
              if (upsertError.message?.includes('password_changed')) {
                // Se der erro na coluna, inserir sem ela
                await supabase
                  .from('profiles')
                  .upsert(adminProfile);
              } else {
                throw upsertError;
              }
            }
          }
        }

        if (mountedRef.current) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || userData?.full_name || undefined,
            role: role,
            passwordChanged: passwordChanged
          });
          console.log('✅ Usuário definido:', { email: supabaseUser.email, role, passwordChanged });
        }
      } catch (error) {
        console.error('❌ Erro ao processar usuário:', error);
        if (mountedRef.current) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            role: 'user',
            passwordChanged: true // Default para evitar problemas
          });
        }
      }
    };

    initializeAuth();

    return () => {
      mountedRef.current = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const logout = async () => {
    try {
      if (mountedRef.current) {
        setLoading(true);
      }
      
      // Force sign out even if refresh token is invalid
      await supabase.auth.signOut({ scope: 'local' });
      
      // Clear all auth-related data from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        // Clear Supabase session data
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      }
      
      if (mountedRef.current) {
        setUser(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      
      // Even if logout fails, clear local state
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      if (mountedRef.current) {
        setUser(null);
        setLoading(false);
      }
    }
  };

  if (!isMounted) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: 'white'
      }}>
        Carregando...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

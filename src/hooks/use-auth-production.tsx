// src/hooks/use-auth-production.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string | null;
  role: 'admin' | 'diretor' | 'user';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure we're on client side
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let mounted = true;
    let authSubscription: any = null;

    const initAuth = async () => {
      try {
        console.log('🔄 [PROD] Inicializando auth...');
        
        // Wait a bit to ensure client is fully hydrated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mounted) return;

        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('❌ [PROD] Erro ao obter usuário:', error);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        if (currentUser && mounted) {
          console.log('👤 [PROD] Usuário encontrado:', currentUser.email);
          await processUser(currentUser);
        } else if (mounted) {
          console.log('ℹ️ [PROD] Nenhum usuário logado');
          setUser(null);
          setLoading(false);
        }

        // Setup auth listener
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('🔔 [PROD] Auth change:', event);
          
          if (!mounted) return;

          if (event === 'SIGNED_OUT' || !session?.user) {
            setUser(null);
            setLoading(false);
          } else if (event === 'SIGNED_IN' && session?.user) {
            await processUser(session.user);
          }
        });

        authSubscription = data.subscription;

      } catch (error) {
        console.error('❌ [PROD] Erro na inicialização:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    const processUser = async (supabaseUser: SupabaseUser) => {
      if (!mounted) return;

      try {
        let role: 'admin' | 'diretor' | 'user' = 'user';

        // Try to get role from database
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', supabaseUser.id)
            .single();

          if (!error && userData?.role) {
            role = userData.role;
          } else if (supabaseUser.email === 'carlos.horst@doubletelecom.com.br') {
            role = 'admin';
          }
        } catch (roleError) {
          console.log('⚠️ [PROD] Erro ao buscar role:', roleError);
          // Use default role
        }

        if (mounted) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || null,
            role: role
          });
          setLoading(false);
          console.log('✅ [PROD] Usuário processado:', { email: supabaseUser.email, role });
        }
      } catch (error) {
        console.error('❌ [PROD] Erro ao processar usuário:', error);
        if (mounted) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || null,
            role: 'user'
          });
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [isClient]);

  const logout = async () => {
    try {
      console.log('🚪 [PROD] Fazendo logout...');
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('❌ [PROD] Erro no logout:', error);
    }
  };

  // Show loading until client is ready
  if (!isClient) {
    return (
      <AuthContext.Provider value={{ user: null, loading: true, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

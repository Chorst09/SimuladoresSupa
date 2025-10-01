// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/types'; // Import UserProfile from central types

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
        
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
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
          console.log('Session details:', session?.user);
          
          if (!mountedRef.current) return;

          if (event === 'SIGNED_IN' && session?.user) {
            console.log('Checking user role in auth state change...');
            await processUser(session.user);
          } else if (event === 'SIGNED_OUT' || !session?.user) {
            console.log('User signed out or no user present');
            setUser(null);
          }
          
          if (mountedRef.current) {
            setLoading(false);
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
        
        // Check if user has role in Supabase users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('role, token, distributorId') // Selecionar token e distributorId
          .eq('id', supabaseUser.id)
          .single();

        let role: UserProfile['role'] = 'user';
        let token: string | undefined = undefined;
        let distributorId: string | undefined = undefined;

        if (!error && userData) {
          role = userData.role || 'user';
          token = userData.token || undefined;
          distributorId = userData.distributorId || undefined;
          console.log('✅ Role encontrada:', role);
        } else {
          console.log('⚠️ Usuário não encontrado na tabela users, verificando email...');
          
          // If no user document exists, check if user is admin by email
          if (supabaseUser.email === 'admin@example.com' || supabaseUser.email === 'carlos.horst@doubletelecom.com.br') {
            role = 'admin';
            console.log('🔑 Email de admin detectado, criando registro...');
            
            // Create user record with admin role
            await supabase
              .from('users')
              .upsert({
                id: supabaseUser.id,
                email: supabaseUser.email,
                role: 'admin',
                token: 'admin-token', // Valor padrão ou gerado
                distributorId: 'admin-distributor' // Valor padrão ou gerado
              });
            token = 'admin-token';
            distributorId = 'admin-distributor';
          }
        }

        if (mountedRef.current) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || undefined,
            role: role,
            token: token,
            distributorId: distributorId
          });
          console.log('✅ Usuário definido:', { email: supabaseUser.email, role });
        }
      } catch (error) {
        console.error('❌ Erro ao processar usuário:', error);
        if (mountedRef.current) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            role: 'user'
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
      
      await supabase.auth.signOut();
      
      // Only manipulate localStorage if we're in the browser
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
      
      if (mountedRef.current) {
        setUser(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      if (mountedRef.current) {
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

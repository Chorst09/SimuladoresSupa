// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Define o tipo para o objeto de usuário, incluindo a role
interface User {
  id: string;
  email: string | null;
  role: 'admin' | 'diretor' | 'user';
}

// Define o tipo para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
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
          
          if (!mountedRef.current) return;

          if (event === 'SIGNED_IN' && session?.user) {
            await processUser(session.user);
          } else if (event === 'SIGNED_OUT' || !session?.user) {
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
          .select('role')
          .eq('id', supabaseUser.id)
          .single();

        let role: 'admin' | 'diretor' | 'user' = 'user';

        if (!error && userData) {
          role = userData.role || 'user';
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
                role: 'admin'
              });
          }
        }

        if (mountedRef.current) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || null,
            role: role
          });
          console.log('✅ Usuário definido:', { email: supabaseUser.email, role });
        }
      } catch (error) {
        console.error('❌ Erro ao processar usuário:', error);
        if (mountedRef.current) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || null,
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
  }, []);;

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

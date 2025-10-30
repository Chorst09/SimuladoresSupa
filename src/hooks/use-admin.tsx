'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAnyAdmin, setHasAnyAdmin] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      // Check if any admin exists in the system - usar tabela profiles
      const response = await fetch('/api/profiles?role=admin&limit=1', {
        credentials: 'include'
      });
      
      let adminUsers = null;
      let error = null;
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          adminUsers = result.data;
        } else {
          error = result.error;
        }
      } else {
        error = `HTTP ${response.status}`;
      }
      
      if (error) {
        console.error('Erro ao verificar admins:', error);
        // Se houver erro, assumir que não há admin para mostrar setup
        setHasAnyAdmin(false);
      } else {
        const hasAdmin = adminUsers && adminUsers.length > 0;
        setHasAnyAdmin(hasAdmin);
      }
      
      // Check if current user is admin
      setIsAdmin(user?.role === 'admin');
      
      console.log('Admin check result:', { 
        hasAdmin: adminUsers && adminUsers.length > 0, 
        userRole: user?.role,
        tableName: 'profiles'
      });
      
    } catch (error) {
      console.error('Erro ao verificar status de admin:', error);
      // If there's an error, assume no admin exists to show setup
      setHasAnyAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAdmin,
    hasAnyAdmin,
    loading,
    checkAdminStatus
  };
}

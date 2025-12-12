'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import ChangePasswordModal from './ChangePasswordModal';

interface FirstLoginWrapperProps {
  children: React.ReactNode;
}

export default function FirstLoginWrapper({ children }: FirstLoginWrapperProps) {
  const { user } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    // Verificar se o usuário precisa alterar a senha
    if (user && user.passwordChanged === false) {
      setShowChangePassword(true);
    }
  }, [user]);

  const handlePasswordChanged = () => {
    setShowChangePassword(false);
    // Recarregar a página para atualizar o estado do usuário
    window.location.reload();
  };

  return (
    <>
      {children}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={handlePasswordChanged}
        userId={user?.id || ''}
      />
    </>
  );
}
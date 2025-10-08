'use client';

import React, { useState } from 'react';
import { usePasswordCheck } from '@/hooks/use-password-check';
import ForcePasswordChange from './ForcePasswordChange';
import { Loader2 } from 'lucide-react';

interface PasswordChangeGuardProps {
  children: React.ReactNode;
}

export default function PasswordChangeGuard({ children }: PasswordChangeGuardProps) {
  const { needsPasswordChange, loading, checkComplete } = usePasswordCheck();
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Show loading while checking password status
  if (loading || !checkComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-slate-400">Verificando configurações de segurança...</p>
        </div>
      </div>
    );
  }

  // If user needs to change password and hasn't changed it yet, show force password change
  if (needsPasswordChange && !passwordChanged) {
    return (
      <ForcePasswordChange 
        onPasswordChanged={() => setPasswordChanged(true)}
      />
    );
  }

  // Otherwise, render the children (normal app)
  return <>{children}</>;
}
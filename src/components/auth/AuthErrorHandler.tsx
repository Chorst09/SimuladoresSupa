'use client';

import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { clearAuthSession } from '@/lib/auth-utils';

interface AuthErrorHandlerProps {
  error?: Error | null;
  onRetry?: () => void;
}

export default function AuthErrorHandler({ error, onRetry }: AuthErrorHandlerProps) {
  const [isClearing, setIsClearing] = useState(false);

  if (!error) return null;

  const isAuthError = error.message?.toLowerCase().includes('refresh token') ||
                     error.message?.toLowerCase().includes('invalid refresh') ||
                     error.message?.toLowerCase().includes('token not found');

  if (!isAuthError) return null;

  const handleClearSession = async () => {
    setIsClearing(true);
    try {
      await clearAuthSession();
      window.location.reload();
    } catch (err) {
      console.error('Erro ao limpar sessão:', err);
      setIsClearing(false);
    }
  };

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Erro de Autenticação</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          Sua sessão expirou ou é inválida. Isso pode acontecer quando você fica muito tempo 
          sem usar o sistema ou quando há problemas de conectividade.
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearSession}
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Limpando...
              </>
            ) : (
              'Limpar Sessão e Recarregar'
            )}
          </Button>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Tentar Novamente
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
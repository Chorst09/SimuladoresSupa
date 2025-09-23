// src/components/debug/RedirectDebug.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RedirectDebug() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [logs, setLogs] = useState<string[]>([]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 9)]);
  };

  useEffect(() => {
    addLog(`Auth state: loading=${loading}, user=${user ? user.email : 'null'}, path=${pathname}`);
  }, [user, loading, pathname]);

  const forceRedirect = () => {
    addLog('🔄 Forçando redirecionamento para /');
    router.push('/');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Card className="fixed top-4 right-4 w-80 z-50 bg-green-50 border-green-200 max-h-96 overflow-y-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-green-800">🔄 Redirect Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs space-y-1">
          <div><strong>Path:</strong> {pathname}</div>
          <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
          <div><strong>User:</strong> {user ? user.email : 'None'}</div>
          <div><strong>Role:</strong> {user?.role || 'N/A'}</div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={forceRedirect}
            disabled={loading}
          >
            Forçar Redirect
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={clearLogs}
          >
            Limpar
          </Button>
        </div>
        
        {logs.length > 0 && (
          <div className="mt-3 p-2 bg-white rounded text-xs max-h-32 overflow-y-auto">
            <strong>Logs:</strong>
            {logs.map((log, index) => (
              <div key={index} className="font-mono text-xs mb-1">
                {log}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

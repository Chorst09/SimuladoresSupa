
'use client';

import { useEffect } from 'react';

export function ChunkLoadErrorHandler() {
  useEffect(() => {
    const handleChunkLoadError = (event: PromiseRejectionEvent) => {
      if (event.reason && event.reason.message && event.reason.message.includes('Failed to load chunk')) {
        console.error('Caught chunk load error:', event.reason);
        window.location.reload();
      }
    };

    const handleWindowError = (event: ErrorEvent) => {
        if (event.message && event.message.includes('Failed to load chunk')) {
            console.error('Caught chunk load error:', event.message);
            window.location.reload();
        }
    }

    window.addEventListener('unhandledrejection', handleChunkLoadError);
    window.addEventListener('error', handleWindowError);

    return () => {
      window.removeEventListener('unhandledrejection', handleChunkLoadError);
      window.removeEventListener('error', handleWindowError);
    };
  }, []);

  return null;
}

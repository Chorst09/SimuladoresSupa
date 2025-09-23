// src/components/debug/ProductionDebug.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ProductionDebug() {
  const [envStatus, setEnvStatus] = useState<any>({});
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Testando...');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark component as mounted to avoid hydration mismatch
    setIsMounted(true);
    
    // Set current time only on client side
    setCurrentTime(new Date().toLocaleString());
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    setEnvStatus({
      url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ AUSENTE',
      key: supabaseKey ? `${supabaseKey.substring(0, 20)}...` : '❌ AUSENTE',
      urlFull: !!supabaseUrl,
      keyFull: !!supabaseKey,
      environment: process.env.NODE_ENV || 'unknown'
    });

    // Test Supabase connection
    const testSupabase = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          setSupabaseStatus(`❌ Erro: ${error.message}`);
        } else {
          setSupabaseStatus('✅ Conexão OK');
        }
      } catch (err) {
        setSupabaseStatus(`❌ Erro de rede: ${err}`);
      }
    };

    testSupabase();
  }, []);

  // Only show in development or if there are issues
  const shouldShow = process.env.NODE_ENV === 'development' || 
                     !envStatus.urlFull || 
                     !envStatus.keyFull || 
                     supabaseStatus.includes('❌');

  // Don't render anything until component is mounted to avoid hydration mismatch
  if (!isMounted || !shouldShow) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '350px',
      zIndex: 9999,
      border: '2px solid #ff6b6b'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#ff6b6b' }}>
        🚨 DEBUG PRODUÇÃO
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Ambiente:</strong> {envStatus.environment}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Supabase URL:</strong><br />
        <span style={{ color: envStatus.urlFull ? '#4ade80' : '#ff6b6b' }}>
          {envStatus.url}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Supabase Key:</strong><br />
        <span style={{ color: envStatus.keyFull ? '#4ade80' : '#ff6b6b' }}>
          {envStatus.key}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Conexão:</strong><br />
        <span style={{ color: supabaseStatus.includes('✅') ? '#4ade80' : '#ff6b6b' }}>
          {supabaseStatus}
        </span>
      </div>

      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '10px' }}>
        {currentTime}
      </div>
    </div>
  );
}

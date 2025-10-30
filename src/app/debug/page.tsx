// src/app/debug/page.tsx
'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [message, setMessage] = useState('Página de Debug Carregada!');

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#007bff' }}>🔧 Página de Debug</h1>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#d4edda', 
        border: '1px solid #c3e6cb', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>✅ Status: Funcionando!</h2>
        <p><strong>Mensagem:</strong> {message}</p>
        <p><strong>Hora:</strong> {new Date().toLocaleString()}</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🧪 Teste de Interação:</h3>
        <button 
          onClick={() => setMessage(`Botão clicado às ${new Date().toLocaleTimeString()}`)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Clique Aqui
        </button>
        
        <button 
          onClick={() => setMessage('Página de Debug Carregada!')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <h4>📋 Informações do Sistema:</h4>
        <p><strong>URL Atual:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server Side'}</p>
        <p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</p>
        <p><strong>Timestamp:</strong> {Date.now()}</p>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
        <p>Se você está vendo esta página, o Next.js está funcionando corretamente.</p>
        <p>Próximo passo: Testar autenticação com Prisma.</p>
      </div>
    </div>
  );
}

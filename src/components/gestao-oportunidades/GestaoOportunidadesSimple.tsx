'use client';

import React from 'react';

export default function GestaoOportunidadesSimple() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          🎯 Sistema de Gestão de Oportunidades - TESTE
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">
              ✅ Componente Carregado com Sucesso!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Se você está vendo esta mensagem, significa que:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600 dark:text-gray-300">
              <li>✅ O componente foi compilado corretamente</li>
              <li>✅ O roteamento está funcionando</li>
              <li>✅ O lazy loading está operacional</li>
              <li>✅ O menu de navegação está conectado</li>
            </ul>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Status do Sistema
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Este é um componente de teste para verificar se a Gestão de Oportunidades 
              está funcionando corretamente no Vercel. Se aparecer, o problema anterior 
              era relacionado ao controle de acesso ou ao componente AccessControl.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
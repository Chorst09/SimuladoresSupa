'use client';

import React, { useState } from 'react';
import AccessControl from '@/components/shared/AccessControl';
import ClienteModal from './ClienteModal';
import FornecedorModal from './FornecedorModal';
import OportunidadeModal from './OportunidadeModal';

function GestaoOportunidadesContent() {
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [isFornecedorModalOpen, setIsFornecedorModalOpen] = useState(false);
  const [isOportunidadeModalOpen, setIsOportunidadeModalOpen] = useState(false);

  const handleNovaOportunidade = () => {
    setIsOportunidadeModalOpen(true);
  };

  const handleNovoCliente = () => {
    setIsClienteModalOpen(true);
  };

  const handleNovoFornecedor = () => {
    setIsFornecedorModalOpen(true);
  };

  const handleCardClick = (titulo: string, cliente: string) => {
    alert(`Detalhes da oportunidade:\n\nTítulo: ${titulo}\nCliente: ${cliente}\n\nFuncionalidade de detalhes será implementada em breve!`);
    // TODO: Implementar modal ou navegação para detalhes da oportunidade
  };

  const handleKPIClick = (kpiName: string) => {
    alert(`Drill-down do KPI "${kpiName}" será implementado em breve!\n\nEsta funcionalidade permitirá ver detalhes e filtros específicos.`);
    // TODO: Implementar drill-down dos KPIs
  };

  const handleSuccess = () => {
    // Aqui você pode adicionar lógica para atualizar os dados na tela
    // Por exemplo, recarregar a lista de oportunidades, clientes, etc.
    alert('Cadastro realizado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Sistema de Gestão de Oportunidades
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* KPI Cards */}
            <div 
              onClick={() => handleKPIClick('Oportunidades Abertas')}
              className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase">
                    Oportunidades Abertas
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">12</p>
                </div>
                <div className="text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 6v12"/>
                    <path d="M17.196 9 6.804 15"/>
                    <path d="m6.804 9 10.392 6"/>
                  </svg>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleKPIClick('Pipeline Total')}
              className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 uppercase">
                    Pipeline Total
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ 2.5M</p>
                </div>
                <div className="text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleKPIClick('Taxa de Conversão')}
              className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border-l-4 border-purple-500 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase">
                    Taxa de Conversão
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">68%</p>
                </div>
                <div className="text-purple-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleKPIClick('Valor Médio')}
              className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border-l-4 border-orange-500 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400 uppercase">
                    Valor Médio
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">R$ 85K</p>
                </div>
                <div className="text-orange-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Aguardando Aprovação */}
            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">
                Aguardando Aprovação (8)
              </h3>
              <div className="space-y-3">
                <div 
                  onClick={() => handleCardClick('E-commerce InovaTech', 'InovaTech Soluções')}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                    E-commerce InovaTech
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    InovaTech Soluções
                  </p>
                  <div className="flex justify-between items-center mt-3 text-xs">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      R$ 50.000
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      25/10/2025
                    </span>
                  </div>
                </div>

                <div 
                  onClick={() => handleCardClick('Migração AWS', 'ConstruBem Ltda')}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                    Migração AWS
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ConstruBem Ltda
                  </p>
                  <div className="flex justify-between items-center mt-3 text-xs">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      R$ 75.000
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      15/11/2025
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Aprovada */}
            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">
                Aprovada (3)
              </h3>
              <div className="space-y-3">
                <div 
                  onClick={() => handleCardClick('Consultoria de Segurança', 'ConstruBem Ltda')}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-green-500 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                    Consultoria de Segurança
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ConstruBem Ltda
                  </p>
                  <div className="flex justify-between items-center mt-3 text-xs">
                    <span className="font-bold text-green-600 dark:text-green-400">
                      R$ 20.000
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      10/08/2025
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vencida */}
            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">
                Vencida (2)
              </h3>
              <div className="space-y-3">
                <div 
                  onClick={() => handleCardClick('Sistema ERP', 'TechCorp Ltda')}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-red-500 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                    Sistema ERP
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    TechCorp Ltda
                  </p>
                  <div className="flex justify-between items-center mt-3 text-xs">
                    <span className="font-bold text-red-600 dark:text-red-400">
                      R$ 120.000
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      05/01/2025
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Negada */}
            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-4">
                Negada (1)
              </h3>
              <div className="space-y-3">
                <div 
                  onClick={() => handleCardClick('Campanha Marketing', 'InovaTech Soluções')}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4 border-gray-400 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                    Campanha Marketing
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    InovaTech Soluções
                  </p>
                  <div className="flex justify-between items-center mt-3 text-xs">
                    <span className="font-bold text-gray-600 dark:text-gray-400">
                      R$ 15.000
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      20/07/2025
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="mt-8 flex gap-4">
            <button 
              onClick={handleNovaOportunidade}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nova Oportunidade
            </button>
            
            <button 
              onClick={handleNovoCliente}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Novo Cliente
            </button>

            <button 
              onClick={handleNovoFornecedor}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
                <path d="M7 7h.01"/>
              </svg>
              Novo Fornecedor
            </button>
          </div>

          {/* Informações Adicionais */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Sistema Completo de CRM
            </h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Este é um sistema completo de gestão de oportunidades com funcionalidades de:
            </p>
            <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 text-sm mt-2 space-y-1">
              <li>Dashboard com KPIs em tempo real</li>
              <li>Kanban board para gestão visual</li>
              <li>Gestão completa de clientes e fornecedores</li>
              <li>Sistema de notificações e alertas</li>
              <li>Relatórios e análises detalhadas</li>
              <li>Interface responsiva e modo escuro</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modais */}
      <ClienteModal
        isOpen={isClienteModalOpen}
        onClose={() => setIsClienteModalOpen(false)}
        onSuccess={handleSuccess}
      />
      
      <FornecedorModal
        isOpen={isFornecedorModalOpen}
        onClose={() => setIsFornecedorModalOpen(false)}
        onSuccess={handleSuccess}
      />
      
      <OportunidadeModal
        isOpen={isOportunidadeModalOpen}
        onClose={() => setIsOportunidadeModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

export default function GestaoOportunidades() {
  return (
    <AccessControl 
      allowedRoles={['admin', 'director']}
      fallbackMessage="O sistema de Gestão de Oportunidades é restrito a Administradores e Diretores."
    >
      <GestaoOportunidadesContent />
    </AccessControl>
  );
}
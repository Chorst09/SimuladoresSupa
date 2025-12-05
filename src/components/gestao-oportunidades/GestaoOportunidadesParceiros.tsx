'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import OportunidadeParceiroModal from './OportunidadeParceiroModal';

interface OportunidadeParceiro {
  id: string;
  nome_fabricante: string;
  numero_oportunidade_ext: string;
  cliente_nome: string;
  contato_nome: string;
  contato_email: string;
  contato_telefone?: string;
  produto_descricao: string;
  valor: number;
  status: string;
  gerente_contas?: string;
  data_criacao: string;
  data_expiracao: string;
  observacoes?: string;
  creator?: {
    email: string;
    profile?: {
      full_name: string;
    };
  };
  historico?: Array<{
    id: string;
    status_anterior: string | null;
    status_novo: string;
    observacoes: string | null;
    created_at: string;
    usuario: {
      email: string;
      profile?: {
        full_name: string;
      };
    };
  }>;
}

const STATUS_MAP = {
  aguardando_aprovacao: { label: 'Aguardando Aprovação', color: 'bg-yellow-100 text-yellow-800' },
  aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
  expirado: { label: 'Expirado', color: 'bg-red-100 text-red-800' },
  negado: { label: 'Negado', color: 'bg-gray-100 text-gray-800' },
};

const FABRICANTES = ['Dell', 'Lenovo', 'HP', 'Cisco', 'Microsoft', 'VMware', 'Outro'];

export default function GestaoOportunidadesParceiros() {
  const { user } = useAuth();
  const [oportunidades, setOportunidades] = useState<OportunidadeParceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroFabricante, setFiltroFabricante] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroGerente, setFiltroGerente] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [oportunidadeSelecionada, setOportunidadeSelecionada] = useState<OportunidadeParceiro | null>(null);

  // Verificar permissões do usuário
  const isAdminOrDirector = user?.role && ['administrador', 'diretor'].includes(user.role.toLowerCase());
  
  // Função para verificar se o usuário pode editar/excluir uma oportunidade
  const canEditOportunidade = (oportunidade: OportunidadeParceiro) => {
    if (!user) return false;
    if (isAdminOrDirector) return true;
    return oportunidade.creator?.email === user.email;
  };

  useEffect(() => {
    carregarOportunidades();
  }, [filtroFabricante, filtroStatus, filtroGerente]);

  const carregarOportunidades = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroFabricante) params.append('fabricante', filtroFabricante);
      if (filtroStatus) params.append('status', filtroStatus);

      const response = await fetch(`/api/oportunidades-parceiro?${params}`);
      let data = await response.json();
      
      // Garantir que data é um array
      if (Array.isArray(data)) {
        // Aplicar filtro de gerente no frontend (já que não está na API)
        if (filtroGerente) {
          data = data.filter(o => o.gerente_contas === filtroGerente);
        }
        setOportunidades(data);
      } else {
        console.error('Resposta da API não é um array:', data);
        setOportunidades([]);
      }
    } catch (error) {
      console.error('Erro ao carregar oportunidades:', error);
      setOportunidades([]);
    } finally {
      setLoading(false);
    }
  };

  // Obter lista única de gerentes
  const gerentesUnicos = Array.from(
    new Set(oportunidades.map(o => o.gerente_contas).filter(Boolean))
  ).sort();

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const verificarExpirado = (dataExpiracao: string) => {
    return new Date(dataExpiracao) < new Date();
  };

  // Calcular métricas do dashboard
  const calcularMetricas = () => {
    const total = oportunidades.length;
    const aguardando = oportunidades.filter(o => o.status === 'aguardando_aprovacao').length;
    const aprovadas = oportunidades.filter(o => o.status === 'aprovado').length;
    const negadas = oportunidades.filter(o => o.status === 'negado').length;
    const expiradas = oportunidades.filter(o => o.status === 'expirado' || verificarExpirado(o.data_expiracao)).length;
    
    const valorTotal = oportunidades.reduce((acc, o) => acc + Number(o.valor), 0);
    const valorAguardando = oportunidades
      .filter(o => o.status === 'aguardando_aprovacao')
      .reduce((acc, o) => acc + Number(o.valor), 0);
    const valorAprovado = oportunidades
      .filter(o => o.status === 'aprovado')
      .reduce((acc, o) => acc + Number(o.valor), 0);
    
    const taxaConversao = total > 0 ? ((aprovadas / total) * 100).toFixed(1) : '0';
    const valorMedio = total > 0 ? valorTotal / total : 0;

    // Distribuição por fabricante
    const porFabricante = FABRICANTES.map(fab => {
      const ops = oportunidades.filter(o => o.nome_fabricante === fab);
      return {
        nome: fab,
        quantidade: ops.length,
        valor: ops.reduce((acc, o) => acc + Number(o.valor), 0),
      };
    }).filter(f => f.quantidade > 0);

    // Oportunidades a expirar (próximos 7 dias)
    const hoje = new Date();
    const seteDiasDepois = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
    const aExpirar = oportunidades.filter(o => {
      const dataExp = new Date(o.data_expiracao);
      return o.status === 'aguardando_aprovacao' && dataExp > hoje && dataExp <= seteDiasDepois;
    });

    return {
      total,
      aguardando,
      aprovadas,
      negadas,
      expiradas,
      valorTotal,
      valorAguardando,
      valorAprovado,
      taxaConversao,
      valorMedio,
      porFabricante,
      aExpirar,
    };
  };

  const metricas = calcularMetricas();

  const handleAtualizarStatus = async (id: string, novoStatus: string, observacoes: string) => {
    try {
      const response = await fetch(`/api/oportunidades-parceiro/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: novoStatus,
          observacoes,
          usuario_id: 'user-id-placeholder', // TODO: pegar do contexto de autenticação
        }),
      });

      if (response.ok) {
        carregarOportunidades();
        setDetalhesOpen(false);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestão de Oportunidades - Parceiros
          </h1>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nova Oportunidade
          </button>
        </div>

        {/* Alerta de Oportunidades a Expirar */}
        {metricas.aExpirar.length > 0 && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-lg p-4 mb-6 shadow-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-orange-600 dark:text-orange-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-2">
                  ⚠️ {metricas.aExpirar.length} Oportunidade{metricas.aExpirar.length > 1 ? 's' : ''} a Expirar nos Próximos 7 Dias
                </h3>
                <div className="space-y-2">
                  {metricas.aExpirar.map((op) => {
                    const diasRestantes = Math.ceil(
                      (new Date(op.data_expiracao).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div
                        key={op.id}
                        className="bg-white dark:bg-gray-800 rounded p-3 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {op.nome_fabricante} - {op.numero_oportunidade_ext}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Cliente: {op.cliente_nome} | Valor: {formatarMoeda(Number(op.valor))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${diasRestantes <= 2 ? 'text-red-600' : 'text-orange-600'}`}>
                            {diasRestantes} dia{diasRestantes > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatarData(op.data_expiracao)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Dashboard de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card: Oportunidades Abertas */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-blue-100 text-sm font-medium">OPORTUNIDADES ABERTAS</p>
              <p className="text-4xl font-bold mt-2">{metricas.aguardando}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-blue-100 text-xs mt-2">Aguardando aprovação</p>
        </div>

        {/* Card: Pipeline Total */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-green-100 text-sm font-medium">PIPELINE TOTAL</p>
              <p className="text-4xl font-bold mt-2">{formatarMoeda(metricas.valorAguardando)}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-green-100 text-xs mt-2">Em oportunidades abertas</p>
        </div>

        {/* Card: Taxa de Conversão */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-purple-100 text-sm font-medium">TAXA DE CONVERSÃO</p>
              <p className="text-4xl font-bold mt-2">{metricas.taxaConversao}%</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-purple-100 text-xs mt-2">{metricas.aprovadas} aprovadas de {metricas.total} total</p>
        </div>

        {/* Card: Valor Médio */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-orange-100 text-sm font-medium">VALOR MÉDIO</p>
              <p className="text-4xl font-bold mt-2">{formatarMoeda(metricas.valorMedio)}</p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-orange-100 text-xs mt-2">Por oportunidade</p>
        </div>
      </div>

      {/* Cards de Status Resumido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Aguardando</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{metricas.aguardando}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Aprovadas</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{metricas.aprovadas}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-gray-500">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Negadas</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{metricas.negadas}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Expiradas</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{metricas.expiradas}</p>
        </div>
      </div>

      {/* Distribuição por Fabricante */}
      {metricas.porFabricante.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Cards de Fabricantes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Distribuição por Fabricante</h2>
            <div className="grid grid-cols-2 gap-4">
              {metricas.porFabricante.map((fab, index) => {
                const cores = [
                  'from-blue-500 to-blue-600',
                  'from-green-500 to-green-600',
                  'from-purple-500 to-purple-600',
                  'from-orange-500 to-orange-600',
                  'from-pink-500 to-pink-600',
                  'from-indigo-500 to-indigo-600',
                  'from-teal-500 to-teal-600',
                ];
                const cor = cores[index % cores.length];
                return (
                  <div key={fab.nome} className="text-center">
                    <div className={`bg-gradient-to-br ${cor} rounded-lg p-4 mb-2 shadow-md`}>
                      <p className="text-3xl font-bold text-white">{fab.quantidade}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{fab.nome}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatarMoeda(fab.valor)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gráfico de Barras Horizontal */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Valor por Fabricante</h2>
            <div className="space-y-3">
              {metricas.porFabricante
                .sort((a, b) => b.valor - a.valor)
                .map((fab, index) => {
                  const maxValor = Math.max(...metricas.porFabricante.map(f => f.valor));
                  const porcentagem = (fab.valor / maxValor) * 100;
                  const cores = [
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-purple-500',
                    'bg-orange-500',
                    'bg-pink-500',
                    'bg-indigo-500',
                    'bg-teal-500',
                  ];
                  const cor = cores[index % cores.length];
                  return (
                    <div key={fab.nome}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{fab.nome}</span>
                        <span className="text-gray-600 dark:text-gray-400">{formatarMoeda(fab.valor)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`${cor} h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                          style={{ width: `${porcentagem}%` }}
                        >
                          <span className="text-xs text-white font-bold">{fab.quantidade}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          Filtros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Fabricante</label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filtroFabricante}
              onChange={(e) => setFiltroFabricante(e.target.value)}
            >
              <option value="">Todos os fabricantes</option>
              {FABRICANTES.map((fab) => (
                <option key={fab} value={fab}>
                  {fab}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status</label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Gerente de Contas</label>
            <select
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filtroGerente}
              onChange={(e) => setFiltroGerente(e.target.value)}
            >
              <option value="">Todos os gerentes</option>
              {gerentesUnicos.map((gerente) => (
                <option key={gerente} value={gerente}>
                  {gerente}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroFabricante('');
                setFiltroStatus('');
                setFiltroGerente('');
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Oportunidades */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando oportunidades...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {oportunidades.map((oportunidade) => (
            <div
              key={oportunidade.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {/* Ícone do fabricante */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {oportunidade.nome_fabricante.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {oportunidade.nome_fabricante}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {oportunidade.numero_oportunidade_ext}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        STATUS_MAP[oportunidade.status as keyof typeof STATUS_MAP].color
                      }`}
                    >
                      {STATUS_MAP[oportunidade.status as keyof typeof STATUS_MAP].label}
                    </span>
                    {verificarExpirado(oportunidade.data_expiracao) &&
                      oportunidade.status === 'aguardando_aprovacao' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          ⚠️ Expirado
                        </span>
                      )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cliente</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {oportunidade.cliente_nome}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contato</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {oportunidade.contato_nome}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {oportunidade.contato_email}
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gerente de Contas</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {oportunidade.gerente_contas || 'Não atribuído'}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Valor</p>
                    <p className="font-bold text-lg text-green-600 dark:text-green-400">
                      {formatarMoeda(Number(oportunidade.valor))}
                    </p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expira em</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatarData(oportunidade.data_expiracao)}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Produto</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {oportunidade.produto_descricao}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setOportunidadeSelecionada(oportunidade);
                      setDetalhesOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
          {oportunidades.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-400"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                Nenhuma oportunidade encontrada
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Clique em "Nova Oportunidade" para começar
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Nova/Editar Oportunidade */}
      <OportunidadeParceiroModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={carregarOportunidades}
      />

      {/* Modal de Detalhes */}
      {detalhesOpen && oportunidadeSelecionada && (
        <DetalhesModal
          oportunidade={oportunidadeSelecionada}
          onClose={() => setDetalhesOpen(false)}
          onAtualizarStatus={handleAtualizarStatus}
          canEdit={canEditOportunidade(oportunidadeSelecionada)}
        />
      )}
      </div>
    </div>
  );
}

// Modal de Detalhes
function DetalhesModal({
  oportunidade,
  onClose,
  onAtualizarStatus,
  canEdit,
}: {
  oportunidade: OportunidadeParceiro;
  onClose: () => void;
  onAtualizarStatus: (id: string, status: string, observacoes: string) => void;
  canEdit: boolean;
}) {
  const [novoStatus, setNovoStatus] = useState(oportunidade.status);
  const [observacoes, setObservacoes] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Detalhes da Oportunidade</h2>
            <button onClick={onClose} className="text-gray-300 hover:text-white text-2xl">
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Fabricante</label>
                <p className="font-medium text-white">{oportunidade.nome_fabricante}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Nº Oportunidade</label>
                <p className="font-medium text-white">{oportunidade.numero_oportunidade_ext}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Cliente</label>
                <p className="font-medium text-white">{oportunidade.cliente_nome}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Valor</label>
                <p className="font-medium text-green-400">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(Number(oportunidade.valor))}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Contato</label>
              <p className="font-medium text-white">{oportunidade.contato_nome}</p>
              <p className="text-sm text-gray-300">{oportunidade.contato_email}</p>
              {oportunidade.contato_telefone && (
                <p className="text-sm text-gray-300">{oportunidade.contato_telefone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400">Produto</label>
              <p className="font-medium text-white">{oportunidade.produto_descricao}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Data de Criação</label>
                <p className="font-medium text-white">
                  {new Date(oportunidade.data_criacao).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">Data de Expiração</label>
                <p className="font-medium text-white">
                  {new Date(oportunidade.data_expiracao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {oportunidade.observacoes && (
              <div>
                <label className="block text-sm font-medium text-gray-400">Observações</label>
                <p className="font-medium text-white">{oportunidade.observacoes}</p>
              </div>
            )}

            {canEdit ? (
              <div className="border-t border-slate-700 pt-4">
                <label className="block text-sm font-medium text-white mb-2">Atualizar Status</label>
                <div className="space-y-3">
                  <select
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value)}
                  >
                    {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-gray-400"
                    rows={2}
                    placeholder="Observações sobre a mudança de status"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                  />
                  <button
                    onClick={() => onAtualizarStatus(oportunidade.id, novoStatus, observacoes)}
                    disabled={novoStatus === oportunidade.status}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    Atualizar Status
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-700 pt-4">
                <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-300">
                    ℹ️ Você não tem permissão para editar esta oportunidade
                  </p>
                </div>
              </div>
            )}

            {/* Histórico */}
            {oportunidade.historico && oportunidade.historico.length > 0 && (
              <div className="border-t border-slate-700 pt-4">
                <label className="block text-sm font-medium text-white mb-2">Histórico de Mudanças</label>
                <div className="space-y-2">
                  {oportunidade.historico.map((hist) => (
                    <div key={hist.id} className="bg-slate-700 p-3 rounded text-sm">
                      <p className="text-white">
                        <span className="font-medium text-blue-400">
                          {hist.usuario.profile?.full_name || hist.usuario.email}
                        </span>{' '}
                        alterou de{' '}
                        <span className="font-medium text-orange-400">
                          {hist.status_anterior
                            ? STATUS_MAP[hist.status_anterior as keyof typeof STATUS_MAP].label
                            : 'N/A'}
                        </span>{' '}
                        para{' '}
                        <span className="font-medium text-green-400">
                          {STATUS_MAP[hist.status_novo as keyof typeof STATUS_MAP].label}
                        </span>
                      </p>
                      <p className="text-gray-400">
                        {new Date(hist.created_at).toLocaleString('pt-BR')}
                      </p>
                      {hist.observacoes && <p className="mt-1 text-gray-300">{hist.observacoes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

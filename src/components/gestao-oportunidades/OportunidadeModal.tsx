'use client';

import React, { useState, useEffect } from 'react';
import { oportunidadeSchema, type OportunidadeFormData } from '@/lib/validations/gestao-oportunidades';
import { useAuth } from '@/hooks/use-auth';

interface Cliente {
  id: string;
  nome_razao_social: string;
  status: string;
}

interface Fornecedor {
  id: string;
  nome_razao_social: string;
  status: string;
}

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

interface OportunidadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OportunidadeModal({ isOpen, onClose, onSuccess }: OportunidadeModalProps) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<OportunidadeFormData>({
    numero_oportunidade: '',
    titulo: '',
    cliente_id: '',
    valor_estimado: '',
    fase: 'aguardando_aprovacao',
    data_fechamento_prevista: '',
    data_vencimento: '',
    responsavel_id: user?.id || '',
    probabilidade_fechamento: '50',
    descricao: '',
    fornecedores: []
  });
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Carregar dados necessários quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      // Carregar dados via APIs
      const [clientesResponse, fornecedoresResponse, profilesResponse] = await Promise.all([
        fetch('/api/clientes?status=ativo', { credentials: 'include' }),
        fetch('/api/fornecedores?status=ativo', { credentials: 'include' }),
        fetch('/api/profiles', { credentials: 'include' })
      ]);

      const [clientesData, fornecedoresData, profilesData] = await Promise.all([
        clientesResponse.json(),
        fornecedoresResponse.json(),
        profilesResponse.json()
      ]);

      setClientes(clientesData?.data || []);
      setFornecedores(fornecedoresData?.data || []);
      setProfiles(profilesData?.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFornecedorChange = (fornecedorId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      fornecedores: checked
        ? [...prev.fornecedores, fornecedorId]
        : prev.fornecedores.filter(id => id !== fornecedorId)
    }));
  };

  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Converte para número e formata
    const number = parseFloat(numbers) / 100;
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setFormData(prev => ({ ...prev, valor_estimado: formatted }));
    
    if (errors.valor_estimado) {
      setErrors(prev => ({ ...prev, valor_estimado: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validar dados
      const validatedData = oportunidadeSchema.parse(formData);
      
      // Converter valor para número
      const valorNumerico = parseFloat(validatedData.valor_estimado.replace(/[^\d,.-]/g, '').replace(',', '.'));
      
      // Preparar dados para inserção
      const oportunidadeData = {
        numero_oportunidade: validatedData.numero_oportunidade,
        titulo: validatedData.titulo,
        cliente_id: validatedData.cliente_id,
        valor_estimado: valorNumerico,
        fase: validatedData.fase,
        data_fechamento_prevista: validatedData.data_fechamento_prevista,
        data_vencimento: validatedData.data_vencimento,
        responsavel_id: validatedData.responsavel_id,
        probabilidade_fechamento: validatedData.probabilidade_fechamento ? parseInt(validatedData.probabilidade_fechamento) : null,
        descricao: validatedData.descricao || null
      };

      // Inserir oportunidade via API
      const response = await fetch('/api/oportunidades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...validatedData,
          created_by: user?.id
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao criar oportunidade');
      }

      // Sucesso
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        numero_oportunidade: '',
        titulo: '',
        cliente_id: '',
        valor_estimado: '',
        fase: 'aguardando_aprovacao',
        data_fechamento_prevista: '',
        data_vencimento: '',
        responsavel_id: user?.id || '',
        probabilidade_fechamento: '50',
        descricao: '',
        fornecedores: []
      });
      
    } catch (error: any) {
      if (error.errors) {
        // Erros de validação do Zod
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          fieldErrors[err.path[0]] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        // Erro da API
        setErrors({ submit: error.message || 'Erro ao cadastrar oportunidade' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nova Oportunidade
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isLoadingData ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Carregando dados...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Número da Oportunidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Número da Oportunidade *
                  </label>
                  <input
                    type="text"
                    name="numero_oportunidade"
                    value={formData.numero_oportunidade}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.numero_oportunidade ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: OPP-2025-001"
                  />
                  {errors.numero_oportunidade && (
                    <p className="text-red-500 text-sm mt-1">{errors.numero_oportunidade}</p>
                  )}
                </div>

                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Título da Oportunidade *
                  </label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.titulo ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Digite o título da oportunidade"
                  />
                  {errors.titulo && (
                    <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>
                  )}
                </div>

                {/* Cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cliente *
                  </label>
                  <select
                    name="cliente_id"
                    value={formData.cliente_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.cliente_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map(cliente => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome_razao_social}
                      </option>
                    ))}
                  </select>
                  {errors.cliente_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.cliente_id}</p>
                  )}
                </div>

                {/* Valor Estimado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valor Estimado *
                  </label>
                  <input
                    type="text"
                    name="valor_estimado"
                    value={formData.valor_estimado}
                    onChange={handleValueChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.valor_estimado ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="R$ 0,00"
                  />
                  {errors.valor_estimado && (
                    <p className="text-red-500 text-sm mt-1">{errors.valor_estimado}</p>
                  )}
                </div>

                {/* Fase */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fase *
                  </label>
                  <select
                    name="fase"
                    value={formData.fase}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.fase ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="aguardando_aprovacao">Aguardando Aprovação</option>
                    <option value="aprovada">Aprovada</option>
                    <option value="vencida">Vencida</option>
                    <option value="negada">Negada</option>
                  </select>
                  {errors.fase && (
                    <p className="text-red-500 text-sm mt-1">{errors.fase}</p>
                  )}
                </div>

                {/* Data de Fechamento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Fechamento Prevista *
                  </label>
                  <input
                    type="date"
                    name="data_fechamento_prevista"
                    value={formData.data_fechamento_prevista}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.data_fechamento_prevista ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.data_fechamento_prevista && (
                    <p className="text-red-500 text-sm mt-1">{errors.data_fechamento_prevista}</p>
                  )}
                </div>

                {/* Data de Vencimento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    name="data_vencimento"
                    value={formData.data_vencimento}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.data_vencimento ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.data_vencimento && (
                    <p className="text-red-500 text-sm mt-1">{errors.data_vencimento}</p>
                  )}
                </div>

                {/* Responsável */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Responsável *
                  </label>
                  <select
                    name="responsavel_id"
                    value={formData.responsavel_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.responsavel_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione um responsável</option>
                    {profiles.map(profile => (
                      <option key={profile.id} value={profile.id}>
                        {profile.full_name} ({profile.role})
                      </option>
                    ))}
                  </select>
                  {errors.responsavel_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.responsavel_id}</p>
                  )}
                </div>

                {/* Probabilidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Probabilidade de Fechamento (%)
                  </label>
                  <input
                    type="number"
                    name="probabilidade_fechamento"
                    value={formData.probabilidade_fechamento}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.probabilidade_fechamento ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="50"
                  />
                  {errors.probabilidade_fechamento && (
                    <p className="text-red-500 text-sm mt-1">{errors.probabilidade_fechamento}</p>
                  )}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.descricao ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Descreva os detalhes da oportunidade"
                />
                {errors.descricao && (
                  <p className="text-red-500 text-sm mt-1">{errors.descricao}</p>
                )}
              </div>

              {/* Fornecedores */}
              {fornecedores.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fornecedores Associados (opcional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-3 dark:border-gray-600">
                    {fornecedores.map(fornecedor => (
                      <label key={fornecedor.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.fornecedores.includes(fornecedor.id)}
                          onChange={(e) => handleFornecedorChange(fornecedor.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {fornecedor.nome_razao_social}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Erro geral */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Salvando...' : 'Salvar Oportunidade'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
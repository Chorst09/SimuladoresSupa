'use client';

import React, { useState } from 'react';
import { fornecedorSchema, type FornecedorFormData } from '@/lib/validations/gestao-oportunidades';

interface FornecedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FornecedorModal({ isOpen, onClose, onSuccess }: FornecedorModalProps) {
  const [formData, setFormData] = useState<FornecedorFormData>({
    nome_razao_social: '',
    cnpj: '',
    contato_principal_nome: '',
    contato_principal_email: '',
    contato_principal_telefone: '',
    area_atuacao: '',
    observacoes: '',
    status: 'ativo'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatCNPJ = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Formato CNPJ: XX.XXX.XXX/XXXX-XX
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setFormData(prev => ({ ...prev, cnpj: formatted }));
    
    if (errors.cnpj) {
      setErrors(prev => ({ ...prev, cnpj: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validar dados
      const validatedData = fornecedorSchema.parse(formData);
      
      // Inserir via API
      const response = await fetch('/api/fornecedores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(validatedData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao criar fornecedor');
      }

      // Sucesso
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        nome_razao_social: '',
        cnpj: '',
        contato_principal_nome: '',
        contato_principal_email: '',
        contato_principal_telefone: '',
        area_atuacao: '',
        observacoes: '',
        status: 'ativo'
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
        setErrors({ submit: error.message || 'Erro ao cadastrar fornecedor' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Novo Fornecedor
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome/Razão Social */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome/Razão Social *
              </label>
              <input
                type="text"
                name="nome_razao_social"
                value={formData.nome_razao_social}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.nome_razao_social ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite o nome ou razão social"
              />
              {errors.nome_razao_social && (
                <p className="text-red-500 text-sm mt-1">{errors.nome_razao_social}</p>
              )}
            </div>

            {/* CNPJ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CNPJ *
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleCNPJChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.cnpj ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="XX.XXX.XXX/XXXX-XX"
                maxLength={18}
              />
              {errors.cnpj && (
                <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>
              )}
            </div>

            {/* Nome do Contato Principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Contato Principal *
              </label>
              <input
                type="text"
                name="contato_principal_nome"
                value={formData.contato_principal_nome}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.contato_principal_nome ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome da pessoa de contato"
              />
              {errors.contato_principal_nome && (
                <p className="text-red-500 text-sm mt-1">{errors.contato_principal_nome}</p>
              )}
            </div>

            {/* Email do Contato Principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email do Contato Principal *
              </label>
              <input
                type="email"
                name="contato_principal_email"
                value={formData.contato_principal_email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.contato_principal_email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="email@exemplo.com"
              />
              {errors.contato_principal_email && (
                <p className="text-red-500 text-sm mt-1">{errors.contato_principal_email}</p>
              )}
            </div>

            {/* Telefone do Contato Principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefone do Contato Principal
              </label>
              <input
                type="tel"
                name="contato_principal_telefone"
                value={formData.contato_principal_telefone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.contato_principal_telefone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(11) 99999-9999"
              />
              {errors.contato_principal_telefone && (
                <p className="text-red-500 text-sm mt-1">{errors.contato_principal_telefone}</p>
              )}
            </div>

            {/* Área de Atuação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Área de Atuação
              </label>
              <input
                type="text"
                name="area_atuacao"
                value={formData.area_atuacao}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.area_atuacao ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Tecnologia da Informação, Consultoria, etc."
              />
              {errors.area_atuacao && (
                <p className="text-red-500 text-sm mt-1">{errors.area_atuacao}</p>
              )}
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observações
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.observacoes ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Informações adicionais sobre o fornecedor"
              />
              {errors.observacoes && (
                <p className="text-red-500 text-sm mt-1">{errors.observacoes}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>

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
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Salvando...' : 'Salvar Fornecedor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
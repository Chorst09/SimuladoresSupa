'use client';

import React, { useState } from 'react';
import { clienteSchema, type ClienteFormData } from '@/lib/validations/gestao-oportunidades';
import { supabase } from '@/lib/supabaseClient';

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClienteModal({ isOpen, onClose, onSuccess }: ClienteModalProps) {
  const [formData, setFormData] = useState<ClienteFormData>({
    nome_razao_social: '',
    cnpj_cpf: '',
    nome_contato: '',
    email_contato: '',
    telefone: '',
    endereco_completo: '',
    status: 'prospect'
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

  const formatCNPJCPF = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 11) {
      // Formato CPF: XXX.XXX.XXX-XX
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // Formato CNPJ: XX.XXX.XXX/XXXX-XX
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const handleCNPJCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJCPF(e.target.value);
    setFormData(prev => ({ ...prev, cnpj_cpf: formatted }));
    
    if (errors.cnpj_cpf) {
      setErrors(prev => ({ ...prev, cnpj_cpf: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validar dados
      const validatedData = clienteSchema.parse(formData);
      
      // Inserir no Supabase
      const { data, error } = await supabase
        .from('clientes')
        .insert([validatedData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Sucesso
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        nome_razao_social: '',
        cnpj_cpf: '',
        nome_contato: '',
        email_contato: '',
        telefone: '',
        endereco_completo: '',
        status: 'prospect'
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
        // Erro do Supabase
        setErrors({ submit: error.message || 'Erro ao cadastrar cliente' });
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
              Novo Cliente
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.nome_razao_social ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite o nome ou razão social"
              />
              {errors.nome_razao_social && (
                <p className="text-red-500 text-sm mt-1">{errors.nome_razao_social}</p>
              )}
            </div>

            {/* CNPJ/CPF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CNPJ/CPF
              </label>
              <input
                type="text"
                name="cnpj_cpf"
                value={formData.cnpj_cpf}
                onChange={handleCNPJCPFChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.cnpj_cpf ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="XX.XXX.XXX/XXXX-XX ou XXX.XXX.XXX-XX"
                maxLength={18}
              />
              {errors.cnpj_cpf && (
                <p className="text-red-500 text-sm mt-1">{errors.cnpj_cpf}</p>
              )}
            </div>

            {/* Nome do Contato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Contato *
              </label>
              <input
                type="text"
                name="nome_contato"
                value={formData.nome_contato}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.nome_contato ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome da pessoa de contato"
              />
              {errors.nome_contato && (
                <p className="text-red-500 text-sm mt-1">{errors.nome_contato}</p>
              )}
            </div>

            {/* Email do Contato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email do Contato *
              </label>
              <input
                type="email"
                name="email_contato"
                value={formData.email_contato}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.email_contato ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="email@exemplo.com"
              />
              {errors.email_contato && (
                <p className="text-red-500 text-sm mt-1">{errors.email_contato}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.telefone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(11) 99999-9999"
              />
              {errors.telefone && (
                <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>
              )}
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Endereço Completo
              </label>
              <textarea
                name="endereco_completo"
                value={formData.endereco_completo}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.endereco_completo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Rua, número, bairro, cidade, estado, CEP"
              />
              {errors.endereco_completo && (
                <p className="text-red-500 text-sm mt-1">{errors.endereco_completo}</p>
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="prospect">Prospect</option>
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
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Salvando...' : 'Salvar Cliente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
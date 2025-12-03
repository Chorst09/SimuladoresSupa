'use client';

import { useState } from 'react';

interface OportunidadeParceiroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  oportunidade?: any;
}

const FABRICANTES = ['Dell', 'Lenovo', 'HP', 'Cisco', 'Microsoft', 'VMware', 'Outro'];

export default function OportunidadeParceiroModal({
  isOpen,
  onClose,
  onSuccess,
  oportunidade,
}: OportunidadeParceiroModalProps) {
  const [formData, setFormData] = useState({
    nome_fabricante: oportunidade?.nome_fabricante || '',
    numero_oportunidade_ext: oportunidade?.numero_oportunidade_ext || '',
    cliente_nome: oportunidade?.cliente_nome || '',
    contato_nome: oportunidade?.contato_nome || '',
    contato_email: oportunidade?.contato_email || '',
    contato_telefone: oportunidade?.contato_telefone || '',
    produto_descricao: oportunidade?.produto_descricao || '',
    valor: oportunidade?.valor || '',
    gerente_contas: oportunidade?.gerente_contas || '',
    data_expiracao: oportunidade?.data_expiracao || '',
    observacoes: oportunidade?.observacoes || '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = oportunidade
        ? `/api/oportunidades-parceiro/${oportunidade.id}`
        : '/api/oportunidades-parceiro';
      
      const response = await fetch(url, {
        method: oportunidade ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valor: parseFloat(formData.valor.toString()),
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao salvar oportunidade');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar oportunidade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {oportunidade ? 'Editar' : 'Nova'} Oportunidade de Parceiro
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Fabricante *
                </label>
                <select
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.nome_fabricante}
                  onChange={(e) =>
                    setFormData({ ...formData, nome_fabricante: e.target.value })
                  }
                >
                  <option value="">Selecione o fabricante</option>
                  {FABRICANTES.map((fab) => (
                    <option key={fab} value={fab}>
                      {fab}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Nº Oportunidade *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: DELL-2024-001"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.numero_oportunidade_ext}
                  onChange={(e) =>
                    setFormData({ ...formData, numero_oportunidade_ext: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Cliente *
              </label>
              <input
                required
                type="text"
                placeholder="Nome da empresa cliente"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.cliente_nome}
                onChange={(e) =>
                  setFormData({ ...formData, cliente_nome: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Nome do Contato *
                </label>
                <input
                  required
                  type="text"
                  placeholder="João Silva"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.contato_nome}
                  onChange={(e) =>
                    setFormData({ ...formData, contato_nome: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Email do Contato *
                </label>
                <input
                  required
                  type="email"
                  placeholder="joao@empresa.com"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.contato_email}
                  onChange={(e) =>
                    setFormData({ ...formData, contato_email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Telefone
                </label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.contato_telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, contato_telefone: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Descrição do Produto *
              </label>
              <input
                required
                type="text"
                placeholder="Ex: Servidores Dell PowerEdge R750 - 5 unidades"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.produto_descricao}
                onChange={(e) =>
                  setFormData({ ...formData, produto_descricao: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Gerente de Contas
              </label>
              <input
                type="text"
                placeholder="Nome do gerente de contas responsável"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.gerente_contas}
                onChange={(e) =>
                  setFormData({ ...formData, gerente_contas: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Valor (R$) *
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="150000.00"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Data de Expiração *
                </label>
                <input
                  required
                  type="date"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.data_expiracao}
                  onChange={(e) =>
                    setFormData({ ...formData, data_expiracao: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Observações
              </label>
              <textarea
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Informações adicionais sobre a oportunidade..."
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? 'Salvando...' : 'Salvar Oportunidade'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

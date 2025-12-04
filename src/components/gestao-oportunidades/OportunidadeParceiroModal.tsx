'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface Produto {
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

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
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nome_fabricante: oportunidade?.nome_fabricante || '',
    numero_oportunidade_ext: oportunidade?.numero_oportunidade_ext || '',
    cliente_nome: oportunidade?.cliente_nome || '',
    contato_nome: oportunidade?.contato_nome || '',
    contato_email: oportunidade?.contato_email || '',
    contato_telefone: oportunidade?.contato_telefone || '',
    gerente_contas: oportunidade?.gerente_contas || '',
    data_expiracao: oportunidade?.data_expiracao || '',
    observacoes: oportunidade?.observacoes || '',
  });
  
  const [produtos, setProdutos] = useState<Produto[]>([
    { descricao: '', quantidade: 1, valor_unitario: 0, valor_total: 0 }
  ]);
  
  const [loading, setLoading] = useState(false);
  
  const calcularValorTotal = () => {
    return produtos.reduce((sum, p) => sum + p.valor_total, 0);
  };
  
  const adicionarProduto = () => {
    setProdutos([...produtos, { descricao: '', quantidade: 1, valor_unitario: 0, valor_total: 0 }]);
  };
  
  const removerProduto = (index: number) => {
    if (produtos.length > 1) {
      setProdutos(produtos.filter((_, i) => i !== index));
    }
  };
  
  const atualizarProduto = (index: number, campo: keyof Produto, valor: any) => {
    const novosProdutos = [...produtos];
    novosProdutos[index] = { ...novosProdutos[index], [campo]: valor };
    
    // Recalcular valor total do produto
    if (campo === 'quantidade' || campo === 'valor_unitario') {
      novosProdutos[index].valor_total = novosProdutos[index].quantidade * novosProdutos[index].valor_unitario;
    }
    
    setProdutos(novosProdutos);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = oportunidade
        ? `/api/oportunidades-parceiro/${oportunidade.id}`
        : '/api/oportunidades-parceiro';
      
      // Criar descrição consolidada dos produtos
      const produto_descricao = produtos
        .map(p => `${p.descricao} (${p.quantidade}x)`)
        .join('; ');
      
      const response = await fetch(url, {
        method: oportunidade ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          produto_descricao,
          valor: calcularValorTotal(),
          created_by: user?.id,
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
                <input
                  required
                  type="text"
                  list="fabricantes-list"
                  placeholder="Ex: Dell, Lenovo, HP..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.nome_fabricante}
                  onChange={(e) =>
                    setFormData({ ...formData, nome_fabricante: e.target.value })
                  }
                />
                <datalist id="fabricantes-list">
                  {FABRICANTES.map((fab) => (
                    <option key={fab} value={fab} />
                  ))}
                </datalist>
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Produtos *
                </label>
                <button
                  type="button"
                  onClick={adicionarProduto}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  + Adicionar Produto
                </button>
              </div>
              
              <div className="space-y-3">
                {produtos.map((produto, index) => (
                  <div key={index} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Produto {index + 1}
                      </span>
                      {produtos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerProduto(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 text-sm"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        required
                        type="text"
                        placeholder="Descrição do produto"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        value={produto.descricao}
                        onChange={(e) => atualizarProduto(index, 'descricao', e.target.value)}
                      />
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <input
                            required
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Qtde"
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            value={produto.quantidade || ''}
                            onChange={(e) => atualizarProduto(index, 'quantidade', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <input
                            required
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Valor Unit."
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            value={produto.valor_unitario || ''}
                            onChange={(e) => atualizarProduto(index, 'valor_unitario', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            disabled
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed text-sm"
                            value={`R$ ${produto.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Valor Total da Oportunidade:
                  </span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    R$ {calcularValorTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
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

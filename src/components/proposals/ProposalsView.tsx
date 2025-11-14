"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Trash2, PlusCircle, FileDown, User, Calendar, DollarSign, FileText, Briefcase, Calculator, ArrowLeft } from 'lucide-react';
import type { Proposal, Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import ProposalForm from './ProposalForm';
import CommercialProposalView from '../commercial-proposal/CommercialProposalView';
import { useAuth } from '@/hooks/use-auth';

interface ProposalsViewProps {
  proposals: Proposal[];
  partners: Partner[];
  onSave: (proposal: Proposal) => void;
  onDelete: (id: string) => void;
  onBackToTop?: () => void;
}

const ProposalsView: React.FC<ProposalsViewProps> = ({ proposals, partners, onSave, onDelete, onBackToTop }) => {
  const router = useRouter();
  const { user } = useAuth(); // Get the user object
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Debug effect
  React.useEffect(() => {
    console.log('ProposalsView Debug:', {
      totalProposals: proposals.length,
      proposals: proposals.slice(0, 3),
      user: user
    });
  }, [proposals, user]);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountManager, setSelectedAccountManager] = useState<string>('all');
  const [showProposalTypeDialog, setShowProposalTypeDialog] = useState(false);
  const [showCommercialProposal, setShowCommercialProposal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Extrair lista única de gerentes de contas
  const accountManagers = React.useMemo(() => {
    const managers = new Set<string>();
    proposals.forEach(proposal => {
      if (proposal.accountManager) {
        const managerName = typeof proposal.accountManager === 'string' 
          ? proposal.accountManager 
          : proposal.accountManager?.name;
        if (managerName) {
          managers.add(managerName);
        }
      }
    });
    return Array.from(managers).sort();
  }, [proposals]);

  const filteredProposals = proposals.filter(proposal => {
    if (!proposal) return false; // Defensively handle null/undefined proposals in the array
    const term = searchTerm.toLowerCase();

    const titleMatch = typeof proposal.title === 'string' && proposal.title.toLowerCase().includes(term);
    const clientMatch = (typeof proposal.client === 'string' && proposal.client.toLowerCase().includes(term)) ||
                       (typeof proposal.client === 'object' && proposal.client?.name?.toLowerCase().includes(term));
    const accountManagerMatch = (typeof proposal.accountManager === 'string' && proposal.accountManager.toLowerCase().includes(term)) ||
                               (typeof proposal.accountManager === 'object' && proposal.accountManager?.name?.toLowerCase().includes(term));

    const searchMatch = titleMatch || clientMatch || accountManagerMatch;

    // Filtro por gerente de contas
    if (selectedAccountManager !== 'all') {
      const proposalManager = typeof proposal.accountManager === 'string' 
        ? proposal.accountManager 
        : proposal.accountManager?.name || '';
      
      if (proposalManager !== selectedAccountManager) {
        return false;
      }
    }

    return searchMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Rascunho': return 'bg-gray-100 text-gray-800';
      case 'Enviada': return 'bg-blue-100 text-blue-800';
      case 'Em Análise': return 'bg-yellow-100 text-yellow-800';
      case 'Aprovada': return 'bg-green-100 text-green-800';
      case 'Rejeitada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setIsFormOpen(true);
  };



  const handleProposalTypeSelect = (type: 'commercial' | 'technical') => {
    setShowProposalTypeDialog(false);
    if (type === 'commercial') {
      setShowCommercialProposal(true);
    } else {
      setEditingProposal(null);
      setIsFormOpen(true);
    }
  };

  const handleViewCommercialProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowCommercialProposal(true);
  };

  const handleSave = (proposal: Proposal) => {
    onSave(proposal);
    setIsFormOpen(false);
    setEditingProposal(null);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingProposal(null);
  };

  const handleCommercialProposalClose = () => {
    setShowCommercialProposal(false);
  };

  const getDistributorName = (distributorId: number | string) => {
    const distributor = partners.find(p => p.id.toString() === distributorId.toString());
    return distributor?.name || 'N/A';
  };

  const handleNavigateToCalculator = (proposal: Proposal) => {
    const baseId = proposal.baseId || '';
    let tab = 'dashboard';
    
    if (baseId.startsWith('Prop_PABX_')) tab = 'calculator-pabx-sip';
    else if (baseId.startsWith('Prop_MV_')) tab = 'calculator-maquinas-virtuais';
    else if (baseId.startsWith('Prop_IR_')) tab = 'calculator-radio-internet';
    else if (baseId.startsWith('Prop_IF_')) tab = 'calculator-internet-fibra';
    else if (baseId.startsWith('Prop_DFR_')) tab = 'calculator-double-fibra-radio';
    else if (baseId.startsWith('Prop_IM_')) tab = 'calculator-internet-man';
    
    // Use router.push to navigate to the correct tab
    router.push(`/?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          {onBackToTop && (
            <Button 
              variant="outline" 
              onClick={onBackToTop}
              className="flex items-center shrink-0 bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
              aria-label="Voltar para as calculadoras"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          )}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Propostas</h1>
              <p className="text-slate-400">
                Visualize e gerencie as propostas geradas nas calculadoras
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Estatísticas Modernas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl hover:shadow-blue-500/25 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-700/50 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {proposals.length}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1 group-hover:text-cyan-300 transition-colors">
                Total de Propostas
              </h3>
              <p className="text-slate-400 text-sm">Todas as propostas</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl hover:shadow-green-500/25 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-700/50 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800 opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-600 to-green-800 shadow-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {formatCurrency(proposals.reduce((sum, p) => sum + (p.value || 0), 0))}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1 group-hover:text-cyan-300 transition-colors">
                Valor Total
              </h3>
              <p className="text-slate-400 text-sm">Soma de todas as propostas</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl hover:shadow-emerald-500/25 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-700/50 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-800 opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {proposals.filter(p => p.status === 'Aprovada').length}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1 group-hover:text-cyan-300 transition-colors">
                Aprovadas
              </h3>
              <p className="text-slate-400 text-sm">Propostas aprovadas</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl hover:shadow-yellow-500/25 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-700/50 group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 to-yellow-800 opacity-10 group-hover:opacity-20 transition-opacity duration-300" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {proposals.filter(p => p.status === 'Em Análise').length}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1 group-hover:text-cyan-300 transition-colors">
                Em Análise
              </h3>
              <p className="text-slate-400 text-sm">Aguardando aprovação</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
        </div>
      </div>

      {/* Filtros de Busca */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Input
          placeholder="Buscar propostas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-400"
        />
        
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <select
            value={selectedAccountManager}
            onChange={(e) => setSelectedAccountManager(e.target.value)}
            className="bg-slate-800/50 border border-slate-600 text-white rounded-md px-3 py-2 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 min-w-[200px]"
          >
            <option value="all">Todos os Gerentes</option>
            {accountManagers.map((manager) => (
              <option key={manager} value={manager}>
                {manager}
              </option>
            ))}
          </select>
        </div>

        {(searchTerm || selectedAccountManager !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedAccountManager('all');
            }}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Tabela de Propostas Moderna */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Lista de Propostas</h3>
          </div>
        </div>
        <div className="p-6">
          {/* Debug info - moved to useEffect */}
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300">Título</TableHead>
                  <TableHead className="text-slate-300">Cliente</TableHead>
                  <TableHead className="text-slate-300">Gerente de Conta</TableHead>
                  <TableHead className="text-slate-300">Distribuidor</TableHead>
                  <TableHead className="text-slate-300">Valor</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Data de Criação</TableHead>
                  <TableHead className="text-slate-300">Validade</TableHead>
                  <TableHead className="text-right text-slate-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.map((proposal) => (
                  <TableRow key={proposal.id} className="border-slate-700 hover:bg-slate-800/30 transition-colors">
                    <TableCell className="font-medium text-white">{proposal.title}</TableCell>
                    <TableCell className="text-slate-300">{typeof proposal.client === 'string' ? proposal.client : proposal.client?.name || 'N/A'}</TableCell>
                    <TableCell className="text-slate-300">{typeof proposal.accountManager === 'string' ? proposal.accountManager : proposal.accountManager?.name || 'N/A'}</TableCell>
                    <TableCell className="text-slate-300">{getDistributorName(proposal.distributorId)}</TableCell>
                    <TableCell className="text-slate-300">{formatCurrency(proposal.value || 0)}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(proposal.status)} border-0`}>
                        {proposal.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{formatDate(proposal.date)}</TableCell>
                    <TableCell className="text-slate-300">{formatDate(proposal.expiryDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCommercialProposal(proposal)}
                          className="flex items-center text-cyan-400 hover:text-cyan-300 hover:bg-slate-700/50"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          <span>Ver</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleNavigateToCalculator(proposal)}
                          className="flex items-center text-blue-400 hover:text-blue-300 hover:bg-slate-700/50"
                        >
                          <Calculator className="h-4 w-4 mr-1" />
                          <span>Calcular</span>
                        </Button>
                        {(user?.role === 'admin' || proposal.createdBy === user?.id) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(proposal)}
                              className="text-yellow-400 hover:text-yellow-300 hover:bg-slate-700/50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(proposal.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-slate-700/50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredProposals.length === 0 && (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-slate-800/50 rounded-full">
                  <FileText className="h-12 w-12 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Nenhuma proposta encontrada</h3>
                  <p className="text-slate-400">
                    {proposals.length === 0 
                      ? "Você ainda não possui propostas salvas. Use as calculadoras para gerar suas propostas!" 
                      : "Nenhuma proposta corresponde aos critérios de busca."}
                  </p>
                </div>
                {proposals.length === 0 && onBackToTop && (
                  <Button onClick={onBackToTop} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border-0">
                    <Calculator className="h-4 w-4 mr-2" />
                    Ir para Calculadoras
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de Seleção do Tipo de Proposta */}
      <Dialog open={showProposalTypeDialog} onOpenChange={setShowProposalTypeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Escolha o Tipo de Proposta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button 
              onClick={() => handleProposalTypeSelect('commercial')}
              className="w-full h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
            >
              <FileText className="h-8 w-8" />
              <span className="font-semibold">Proposta Comercial</span>
              <span className="text-sm text-muted-foreground">Layout personalizado com design profissional</span>
            </Button>
            <Button 
              onClick={() => handleProposalTypeSelect('technical')}
              className="w-full h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
            >
              <Briefcase className="h-8 w-8" />
              <span className="font-semibold">Proposta Técnica</span>
              <span className="text-sm text-muted-foreground">Formulário detalhado com especificações técnicas</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo da Proposta Comercial */}
      <Dialog open={showCommercialProposal} onOpenChange={setShowCommercialProposal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proposta Comercial</DialogTitle>
          </DialogHeader>
          <CommercialProposalView partners={partners} proposal={selectedProposal} />
        </DialogContent>
      </Dialog>

      {/* Diálogo da Proposta Técnica */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProposal ? 'Editar Proposta' : 'Nova Proposta Técnica'}
            </DialogTitle>
          </DialogHeader>
          <ProposalForm
            proposal={editingProposal}
            partners={partners}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalsView;
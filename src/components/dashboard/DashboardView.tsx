"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/use-auth';
import { Proposal, Partner } from '@/lib/types';
import ProposalsView from '@/components/proposals/ProposalsView';
import StatCard from './StatCard';
import { Phone, Server, Wifi, Radio, Calculator, ChevronRight } from 'lucide-react';

interface CalculatorCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  calculatorId: string;
  color: string;
  onNavigate: (calculatorId: string) => void;
}

const CalculatorCard = ({ title, description, icon, calculatorId, color, onNavigate }: CalculatorCardProps) => (
  <div 
    className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 ${color} h-full cursor-pointer`}
    onClick={() => onNavigate(calculatorId)}
  >
    <div className="flex items-center mb-4">
      <div className="p-2 rounded-full bg-opacity-20 bg-current mr-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{description}</p>
    <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
      Acessar calculadora <ChevronRight className="ml-1 h-4 w-4" />
    </div>
  </div>
);

interface DashboardViewProps {
  onNavigateToCalculator?: (calculatorId: string) => void;
}

const DashboardView = ({ onNavigateToCalculator }: DashboardViewProps) => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Contar propostas por tipo
  const countProposalsByType = useMemo(() => {
    const counts = {
      pabx: 0,
      maquinasVirtuais: 0,
      fibra: 0,
      doubleFibraRadio: 0,
      man: 0
    };
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    proposals.forEach(proposal => {
      const proposalDate = new Date(proposal.date);
      if (proposalDate.getMonth() === currentMonth && proposalDate.getFullYear() === currentYear) {
        if (proposal.baseId?.startsWith('Prop_PabxSip_')) {
          counts.pabx++;
        } else if (proposal.baseId?.startsWith('Prop_MV_')) {
          counts.maquinasVirtuais++;
        } else if (proposal.baseId?.startsWith('Prop_Fibra_')) {
          counts.fibra++;
        } else if (proposal.baseId?.startsWith('Prop_Double_')) {
          counts.doubleFibraRadio++;
        } else if (proposal.baseId?.startsWith('Prop_InterMan_')) {
          counts.man++;
        }
      }
    });
    
    return counts;
  }, [proposals]);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!user) return;

      try {
        let query = supabase.from('proposals').select('*');

        // Se não for admin ou diretor, filtra apenas as propostas do usuário
        if (user.role !== 'admin' && user.role !== 'diretor') {
          query = query.eq('user_id', user.id);
        }

        const { data: proposalsData, error } = await query;

        if (error) {
          console.error('Erro ao buscar propostas:', error);
          return;
        }

        const proposalsList = (proposalsData || []).map(data => {
          let title = "Proposta";
          if (data.base_id) {
            if (data.base_id.startsWith("Prop_MV_")) title = `Proposta Máquinas Virtuais - ${data.base_id.split("_")[2]}`;
            else if (data.base_id.startsWith("Prop_PabxSip_")) title = `Proposta PABX/SIP - ${data.base_id.split("_")[2]}`;
            else if (data.base_id.startsWith("Prop_InterMan_")) title = `Proposta Internet MAN - ${data.base_id.split("_")[2]}`;
            else if (data.base_id.startsWith("Prop_Double_")) title = `Proposta Double-Fibra/Radio - ${data.base_id.split("_")[2]}`;
            else if (data.base_id.startsWith("Prop_Fibra_")) title = `Proposta Internet Fibra - ${data.base_id.split("_")[2]}`;
            else if (data.base_id.startsWith("Prop_Radio_")) title = `Proposta Internet Rádio - ${data.base_id.split("_")[2]}`;
          }

          const createdAtDate = data.created_at ? new Date(data.created_at) : new Date();
          const expiryDate = new Date(createdAtDate);
          expiryDate.setDate(createdAtDate.getDate() + 30); // Default 30 days validity

          return {
            id: data.id,
            baseId: data.base_id || '',
            version: data.version || 1,
            title: title,
            client: data.client || 'N/A',
            value: data.value || 0,
            status: data.status || 'Rascunho',
            createdBy: data.created_by || 'N/A',
            accountManager: data.account_manager || 'N/A',
            createdAt: data.created_at,
            distributorId: data.distributor_id || 'N/A',
            date: createdAtDate.toISOString(),
            expiryDate: expiryDate.toISOString(),
          } as Proposal;
        });
        setProposals(proposalsList);
      } catch (error) {
        console.error("Error fetching proposals:", error);
      }
    };

    const fetchPartners = async () => {
      try {
        const { data: partnersData, error } = await supabase
          .from('partners')
          .select('*');

        if (error) {
          console.error('Erro ao buscar parceiros:', error);
          return;
        }

        const partnersList = (partnersData || []).map(data => {
          return {
            id: data.id || 0,
            name: data.name || 'Sem nome',
            type: 'Cliente', // Default type as per Partner interface
            contact: data.contact || '',
            phone: data.phone || '',
            status: data.status === 'Ativo' ? 'Ativo' : 'Inativo',
            site: data.site || '',
            products: data.products || '',
            sitePartner: data.site_partner || '',
            siteRO: data.site_ro || '',
            templateRO: data.template_ro || '',
            procedimentoRO: data.procedimento_ro || '',
            login: data.login || '',
            password: data.password || '',
            mainContact: data.main_contact || ''
          } as Partner;
        });
        setPartners(partnersList);
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };

    if (user) {
      fetchProposals();
      fetchPartners();
    }
    setLoading(false);
  }, [user]);

  const handleSave = (proposal: Proposal) => {
    // Lógica para salvar (criar ou atualizar) uma proposta
    console.log('Saving proposal:', proposal);
  };

  const handleDelete = (id: string) => {
    // Lógica para deletar uma proposta
    console.log('Deleting proposal with id:', id);
  };

  const handleBackToTop = () => {
    // Scroll to the calculadoras section smoothly
    const calculadorasSection = document.querySelector('[data-section="calculadoras"]');
    if (calculadorasSection) {
      calculadorasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback to scroll to page top if section not found
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      <div data-section="calculadoras">
        <h2 className="text-2xl font-bold mb-4">Calculadoras</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <CalculatorCard
            title="PABX/SIP"
            description="Calcule orçamentos para soluções de telefonia IP"
            icon={<Phone className="w-5 h-5 text-blue-500" />}
            calculatorId="calculator-pabx-sip"
            color="border-l-blue-500"
            onNavigate={onNavigateToCalculator || (() => {})}
          />
          <CalculatorCard
            title="Máquinas Virtuais"
            description="Calcule recursos e custos de máquinas virtuais"
            icon={<Server className="w-5 h-5 text-purple-500" />}
            calculatorId="calculator-maquinas-virtuais"
            color="border-l-purple-500"
            onNavigate={onNavigateToCalculator || (() => {})}
          />
          <CalculatorCard
            title="Internet Fibra"
            description="Calcule valores para planos de internet fibra"
            icon={<Wifi className="w-5 h-5 text-green-500" />}
            calculatorId="calculator-internet-fibra"
            color="border-l-green-500"
            onNavigate={onNavigateToCalculator || (() => {})}
          />
          <CalculatorCard
            title="Internet Radio"
            description="Calcule valores para planos de internet via rádio"
            icon={<Radio className="w-5 h-5 text-blue-500" />}
            calculatorId="calculator-internet-radio"
            color="border-l-blue-500"
            onNavigate={onNavigateToCalculator || (() => {})}
          />
          <CalculatorCard
            title="Double-Fibra/Radio"
            description="Calcule valores para planos de internet Double-Fibra/Radio"
            icon={<Wifi className="w-5 h-5 text-teal-500" />}
            calculatorId="calculator-internet-ok-v2"
            color="border-l-teal-500"
            onNavigate={onNavigateToCalculator || (() => {})}
          />
          <CalculatorCard
            title="Internet MAN"
            description="Calcule valores para redes metropolitanas"
            icon={<Wifi className="w-5 h-5 text-cyan-500" />}
            calculatorId="calculator-internet-man"
            color="border-l-cyan-500"
            onNavigate={onNavigateToCalculator || (() => {})}
          />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Visão Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard 
            icon={<Phone className="w-6 h-6 text-blue-500" />} 
            title="Propostas PABX/SIP" 
            value={countProposalsByType.pabx.toString()} 
            subtext="Este mês" 
          />
          <StatCard 
            icon={<Server className="w-6 h-6 text-purple-500" />} 
            title="Propostas Máquinas Virtuais" 
            value={countProposalsByType.maquinasVirtuais.toString()} 
            subtext="Este mês" 
          />
          <StatCard 
            icon={<Wifi className="w-6 h-6 text-green-500" />} 
            title="Propostas Internet Fibra" 
            value={countProposalsByType.fibra.toString()} 
            subtext="Este mês" 
          />
          <StatCard 
            icon={<Radio className="w-6 h-6 text-red-500" />} 
            title="Propostas Double-Fibra/Radio" 
            value={countProposalsByType.doubleFibraRadio.toString()} 
            subtext="Este mês" 
          />
          <StatCard 
            icon={<Wifi className="w-6 h-6 text-cyan-500" />} 
            title="Propostas Internet MAN" 
            value={countProposalsByType.man.toString()} 
            subtext="Este mês" 
          />
        </div>
      </div>
      
      <ProposalsView 
        proposals={proposals} 
        partners={partners}
        onSave={handleSave}
        onDelete={handleDelete}
        onBackToTop={handleBackToTop}
      />
    </div>
  );
};

export default DashboardView;
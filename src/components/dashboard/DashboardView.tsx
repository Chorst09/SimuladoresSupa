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

const CalculatorCard = ({ title, description, icon, calculatorId, color, onNavigate }: CalculatorCardProps) => {
  const gradientMap: { [key: string]: string } = {
    'border-l-blue-500': 'from-blue-600 to-blue-800',
    'border-l-purple-500': 'from-purple-600 to-purple-800',
    'border-l-green-500': 'from-green-600 to-green-800',
    'border-l-teal-500': 'from-teal-600 to-teal-800',
    'border-l-cyan-500': 'from-cyan-600 to-cyan-800',
  };

  const hoverShadowMap: { [key: string]: string } = {
    'border-l-blue-500': 'hover:shadow-blue-500/25',
    'border-l-purple-500': 'hover:shadow-purple-500/25',
    'border-l-green-500': 'hover:shadow-green-500/25',
    'border-l-teal-500': 'hover:shadow-teal-500/25',
    'border-l-cyan-500': 'hover:shadow-cyan-500/25',
  };

  const gradient = gradientMap[color] || 'from-blue-600 to-blue-800';
  const hoverShadow = hoverShadowMap[color] || 'hover:shadow-blue-500/25';

  return (
    <div 
      className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl ${hoverShadow} hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-700/50 h-full cursor-pointer group overflow-hidden relative`}
      onClick={() => onNavigate(calculatorId)}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
      
      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-center mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg mr-4`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">{title}</h3>
        </div>
        <p className="text-slate-300 mb-6 leading-relaxed">{description}</p>
        <div className="flex items-center text-cyan-400 font-semibold group-hover:text-cyan-300 transition-colors">
          Acessar calculadora 
          <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/5 to-transparent rounded-tr-full" />
    </div>
  );
};

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
      man: 0,
      manRadio: 0
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
        } else if (proposal.baseId?.startsWith('Prop_ManRadio_')) {
          counts.manRadio++;
        }
      }
    });
    
    return counts;
  }, [proposals]);

  useEffect(() => {
    const fetchProposals = async () => {
      if (!user) return;

      try {
        console.log('Fetching proposals for user:', user.id, user.email);
        
        const response = await fetch('/api/proposals', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error('Error response:', response.status, response.statusText);
          return;
        }

        const proposalsData = await response.json();
        console.log('Fetched proposals from API:', proposalsData);

        const proposalsList = (proposalsData || []).map((data: any) => {
          let title = data.title || "Proposta";
          
          // If title is not set, generate from baseId
          if (!data.title && data.baseId) {
            if (data.baseId.startsWith("Prop_MV_")) title = `Proposta Máquinas Virtuais - ${data.baseId.split("_")[2]}`;
            else if (data.baseId.startsWith("Prop_PabxSip_")) title = `Proposta PABX/SIP - ${data.baseId.split("_")[2]}`;
            else if (data.baseId.startsWith("Prop_InterMan_")) title = `Proposta Internet Man Fibra - ${data.baseId.split("_")[2]}`;
            else if (data.baseId.startsWith("Prop_Double_")) title = `Proposta Double-Fibra/Radio - ${data.baseId.split("_")[2]}`;
            else if (data.baseId.startsWith("Prop_Fibra_")) title = `Proposta Internet Fibra - ${data.baseId.split("_")[2]}`;
            else if (data.baseId.startsWith("Prop_Radio_")) title = `Proposta Internet Rádio - ${data.baseId.split("_")[2]}`;
            else if (data.baseId.startsWith("Prop_ManRadio_")) title = `Proposta Internet Man Radio - ${data.baseId.split("_")[2]}`;
          }

          const createdAtDate = data.createdAt ? new Date(data.createdAt) : new Date();
          const expiryDate = data.expiryDate ? new Date(data.expiryDate) : new Date(createdAtDate.getTime() + 30 * 24 * 60 * 60 * 1000);

          return {
            id: data.id,
            baseId: data.baseId || '',
            version: data.version || 1,
            title: title,
            client: data.client || 'N/A',
            value: data.value || 0,
            status: data.status || 'Rascunho',
            createdBy: data.createdBy || 'N/A',
            accountManager: data.accountManager || 'N/A',
            createdAt: data.createdAt,
            distributorId: data.distributorId || 'N/A',
            date: createdAtDate.toISOString(),
            expiryDate: expiryDate.toISOString(),
          } as Proposal;
        });
        
        console.log('Processed proposals:', proposalsList);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 space-y-8">
      <div data-section="calculadoras">
        {/* Header moderno */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Calculadoras</h2>
              <p className="text-slate-400">Escolha a ferramenta ideal para seu orçamento</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
            title="Internet Man Fibra"
            description="Calcule valores para redes metropolitanas"
            icon={<Wifi className="w-5 h-5 text-cyan-500" />}
            calculatorId="calculator-internet-man"
            color="border-l-cyan-500"
            onNavigate={onNavigateToCalculator || (() => {})}
          />
          <CalculatorCard
            title="Internet Man Radio"
            description="Calcule valores para internet via rádio"
            icon={<Wifi className="w-5 h-5 text-orange-500" />}
            calculatorId="calculator-internet-man-radio"
            color="border-l-orange-500"
            onNavigate={onNavigateToCalculator || (() => {})}
          />
        </div>
      </div>
      
      <div>
        {/* Header da Visão Geral */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Server className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Visão Geral</h2>
              <p className="text-slate-400">Acompanhe suas propostas deste mês</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
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
            title="Propostas Internet Man Fibra" 
            value={countProposalsByType.man.toString()} 
            subtext="Este mês" 
          />
          <StatCard 
            icon={<Radio className="w-6 h-6 text-orange-500" />} 
            title="Propostas Internet Man Radio" 
            value={countProposalsByType.manRadio.toString()} 
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
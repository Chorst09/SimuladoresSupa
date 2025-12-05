"use client";

import React, { useState, useEffect, useMemo } from 'react';
// PostgreSQL via Prisma - APIs REST
import { useAuth } from '@/hooks/use-auth';
import { Proposal, Partner } from '@/lib/types';
import ProposalsView from '@/components/proposals/ProposalsView';
import StatCard from './StatCard';
import { Phone, Server, Wifi, Radio, Calculator, ChevronRight, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  
  // Contar propostas por tipo (agrupando por baseId para contar versões como 1 proposta)
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
    
    console.log('📊 Contando propostas - Mês atual:', currentMonth, 'Ano:', currentYear);
    console.log('📊 Total de propostas:', proposals.length);
    
    // Agrupar propostas por baseId (para contar versões como 1 proposta)
    const uniqueBaseIds = new Set<string>();
    
    proposals.forEach(proposal => {
      const proposalDate = new Date(proposal.date);
      const proposalMonth = proposalDate.getMonth();
      const proposalYear = proposalDate.getFullYear();
      
      console.log('📅 Proposta:', proposal.baseId, 'Data:', proposal.date, 'Mês:', proposalMonth, 'Ano:', proposalYear);
      
      if (proposalMonth === currentMonth && proposalYear === currentYear) {
        // Usar baseId para identificar propostas únicas (independente da versão)
        const baseId = proposal.baseId || proposal.id;
        
        console.log('✅ Proposta do mês atual:', baseId);
        
        // Se já contamos essa proposta (baseId), pular
        if (uniqueBaseIds.has(baseId)) {
          console.log('⏭️ Proposta já contada (versão duplicada):', baseId);
          return;
        }
        
        uniqueBaseIds.add(baseId);
        
        // Contar por tipo (aceitar múltiplos formatos de baseId)
        if (baseId.startsWith('Prop_PabxSip_')) {
          counts.pabx++;
          console.log('📞 PABX/SIP:', counts.pabx);
        } else if (baseId.startsWith('Prop_MV_')) {
          counts.maquinasVirtuais++;
          console.log('💻 Máquinas Virtuais:', counts.maquinasVirtuais);
        } else if (baseId.startsWith('Prop_InternetFibra_') || baseId.startsWith('Prop_Inter_Fibra_')) {
          counts.fibra++;
          console.log('🌐 Internet Fibra:', counts.fibra);
        } else if (baseId.startsWith('Prop_Double_') || baseId.startsWith('Prop_Inter_Double_')) {
          counts.doubleFibraRadio++;
          console.log('📡 Double Fibra/Radio:', counts.doubleFibraRadio);
        } else if (baseId.startsWith('Prop_ManFibra_') || baseId.startsWith('Prop_Inter_Man_')) {
          counts.man++;
          console.log('🔗 Man Fibra:', counts.man);
        } else if (baseId.startsWith('Prop_ManRadio_') || baseId.startsWith('Prop_InterMan_Radio_')) {
          counts.manRadio++;
          console.log('📻 Man Radio:', counts.manRadio);
        } else if (baseId.startsWith('Prop_InternetRadio_') || baseId.startsWith('Prop_Inter_Radio_')) {
          // Internet Radio não tinha categoria própria, vou adicionar ao contador de fibra por enquanto
          // ou criar uma nova categoria se necessário
          counts.fibra++;
          console.log('📻 Internet Radio (contado como Fibra):', counts.fibra);
        } else {
          console.log('❓ Tipo não reconhecido:', baseId);
        }
      } else {
        console.log('❌ Proposta fora do mês atual');
      }
    });
    
    console.log('📊 Contagem final:', counts);
    
    return counts;
  }, [proposals]);

  // Calcular valores totais por tipo de calculadora
  const valuesByType = useMemo(() => {
    const values = {
      pabx: 0,
      maquinasVirtuais: 0,
      fibra: 0,
      doubleFibraRadio: 0,
      man: 0,
      manRadio: 0
    };
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Agrupar por baseId para evitar contar versões duplicadas
    const processedBaseIds = new Set<string>();
    
    proposals.forEach(proposal => {
      const proposalDate = new Date(proposal.date);
      if (proposalDate.getMonth() === currentMonth && proposalDate.getFullYear() === currentYear) {
        const baseId = proposal.baseId || proposal.id;
        
        // Se já processamos essa proposta (baseId), pular
        if (processedBaseIds.has(baseId)) {
          return;
        }
        
        processedBaseIds.add(baseId);
        
        const value = proposal.value || 0;
        
        // Somar valores por tipo
        if (baseId.startsWith('Prop_PabxSip_')) {
          values.pabx += value;
        } else if (baseId.startsWith('Prop_MV_')) {
          values.maquinasVirtuais += value;
        } else if (baseId.startsWith('Prop_InternetFibra_') || baseId.startsWith('Prop_Inter_Fibra_') || baseId.startsWith('Prop_InternetRadio_') || baseId.startsWith('Prop_Inter_Radio_')) {
          values.fibra += value;
        } else if (baseId.startsWith('Prop_Double_') || baseId.startsWith('Prop_Inter_Double_')) {
          values.doubleFibraRadio += value;
        } else if (baseId.startsWith('Prop_ManFibra_') || baseId.startsWith('Prop_Inter_Man_')) {
          values.man += value;
        } else if (baseId.startsWith('Prop_ManRadio_') || baseId.startsWith('Prop_InterMan_Radio_')) {
          values.manRadio += value;
        }
      }
    });
    
    console.log('💰 Valores por tipo:', values);
    
    return values;
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

        // A API retorna { success: true, data: { proposals: [...] } }
        const proposalsArray = proposalsData?.data?.proposals || proposalsData?.proposals || proposalsData || [];
        console.log('Proposals array:', proposalsArray);

        const proposalsList = proposalsArray.map((data: any) => {
          let title = data.title || "Proposta";
          
          // If title is not set, generate from baseId
          if (!data.title && data.baseId) {
            if (data.baseId.startsWith("Prop_MV_")) title = `Proposta Máquinas Virtuais - ${data.baseId.split("_")[2]}`;
            else if (data.baseId.startsWith("Prop_PabxSip_")) title = `Proposta PABX/SIP - ${data.baseId.split("_")[2]}`;
            else if (data.baseId.startsWith("Prop_ManFibra_")) title = `Proposta Internet Man Fibra - ${data.baseId.split("_")[2]}`;
            else if (data.baseId.startsWith("Prop_Double_")) title = `Proposta Double-Fibra/Radio - ${data.baseId.split("_")[2]}`;
            else if (data.baseId.startsWith("Prop_InternetFibra_")) title = `Proposta Internet Fibra - ${data.baseId.split("_")[2]}`;
            else if (data.baseId.startsWith("Prop_InternetRadio_")) title = `Proposta Internet Rádio - ${data.baseId.split("_")[2]}`;
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
            type: data.type || 'standard',
            value: parseFloat(data.value) || 0,
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
        // Partners desabilitado - migrar para API quando necessário
        const partnersData: any[] = [];
        const error = null;

        if (error) {
          console.error('Erro ao buscar parceiros:', error);
          return;
        }

        const partnersList = (partnersData || []).map((data: any) => {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta proposta?')) {
      return;
    }

    try {
      const response = await fetch(`/api/proposals/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir proposta');
      }

      // Atualizar lista de propostas removendo a excluída
      setProposals(prev => prev.filter(p => p.id !== id));
      
      console.log('✅ Proposta excluída com sucesso');
    } catch (error) {
      console.error('❌ Erro ao excluir proposta:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir proposta');
    }
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

        {/* Gráficos - Linha 1: Quantidade de Propostas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Barras - Propostas por Tipo */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700/50 p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-blue-400 mr-2" />
              <h3 className="text-xl font-bold text-white">Propostas por Tipo</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'PABX/SIP', value: countProposalsByType.pabx, fill: '#3b82f6' },
                { name: 'Máq. Virtuais', value: countProposalsByType.maquinasVirtuais, fill: '#a855f7' },
                { name: 'Internet Fibra', value: countProposalsByType.fibra, fill: '#22c55e' },
                { name: 'Double Fibra/Radio', value: countProposalsByType.doubleFibraRadio, fill: '#ef4444' },
                { name: 'MAN Fibra', value: countProposalsByType.man, fill: '#06b6d4' },
                { name: 'MAN Radio', value: countProposalsByType.manRadio, fill: '#f97316' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {[
                    { name: 'PABX/SIP', value: countProposalsByType.pabx, fill: '#3b82f6' },
                    { name: 'Máq. Virtuais', value: countProposalsByType.maquinasVirtuais, fill: '#a855f7' },
                    { name: 'Internet Fibra', value: countProposalsByType.fibra, fill: '#22c55e' },
                    { name: 'Double Fibra/Radio', value: countProposalsByType.doubleFibraRadio, fill: '#ef4444' },
                    { name: 'MAN Fibra', value: countProposalsByType.man, fill: '#06b6d4' },
                    { name: 'MAN Radio', value: countProposalsByType.manRadio, fill: '#f97316' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza - Distribuição */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700/50 p-6">
            <div className="flex items-center mb-4">
              <PieChartIcon className="w-6 h-6 text-purple-400 mr-2" />
              <h3 className="text-xl font-bold text-white">Distribuição de Propostas</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'PABX/SIP', value: countProposalsByType.pabx, fill: '#3b82f6' },
                    { name: 'Máq. Virtuais', value: countProposalsByType.maquinasVirtuais, fill: '#a855f7' },
                    { name: 'Internet Fibra', value: countProposalsByType.fibra, fill: '#22c55e' },
                    { name: 'Double Fibra/Radio', value: countProposalsByType.doubleFibraRadio, fill: '#ef4444' },
                    { name: 'MAN Fibra', value: countProposalsByType.man, fill: '#06b6d4' },
                    { name: 'MAN Radio', value: countProposalsByType.manRadio, fill: '#f97316' },
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'PABX/SIP', value: countProposalsByType.pabx, fill: '#3b82f6' },
                    { name: 'Máq. Virtuais', value: countProposalsByType.maquinasVirtuais, fill: '#a855f7' },
                    { name: 'Internet Fibra', value: countProposalsByType.fibra, fill: '#22c55e' },
                    { name: 'Double Fibra/Radio', value: countProposalsByType.doubleFibraRadio, fill: '#ef4444' },
                    { name: 'MAN Fibra', value: countProposalsByType.man, fill: '#06b6d4' },
                    { name: 'MAN Radio', value: countProposalsByType.manRadio, fill: '#f97316' },
                  ].filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráficos - Linha 2: Valores por Calculadora */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Barras - Valores por Calculadora */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700/50 p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-emerald-400 mr-2" />
              <h3 className="text-xl font-bold text-white">Valores por Calculadora</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'PABX/SIP', value: valuesByType.pabx, fill: '#3b82f6' },
                { name: 'Máq. Virtuais', value: valuesByType.maquinasVirtuais, fill: '#a855f7' },
                { name: 'Internet Fibra', value: valuesByType.fibra, fill: '#22c55e' },
                { name: 'Double Fibra/Radio', value: valuesByType.doubleFibraRadio, fill: '#ef4444' },
                { name: 'MAN Fibra', value: valuesByType.man, fill: '#06b6d4' },
                { name: 'MAN Radio', value: valuesByType.manRadio, fill: '#f97316' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Valor']}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {[
                    { name: 'PABX/SIP', value: valuesByType.pabx, fill: '#3b82f6' },
                    { name: 'Máq. Virtuais', value: valuesByType.maquinasVirtuais, fill: '#a855f7' },
                    { name: 'Internet Fibra', value: valuesByType.fibra, fill: '#22c55e' },
                    { name: 'Double Fibra/Radio', value: valuesByType.doubleFibraRadio, fill: '#ef4444' },
                    { name: 'MAN Fibra', value: valuesByType.man, fill: '#06b6d4' },
                    { name: 'MAN Radio', value: valuesByType.manRadio, fill: '#f97316' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza - Distribuição de Valores */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700/50 p-6">
            <div className="flex items-center mb-4">
              <PieChartIcon className="w-6 h-6 text-emerald-400 mr-2" />
              <h3 className="text-xl font-bold text-white">Distribuição de Valores</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'PABX/SIP', value: valuesByType.pabx, fill: '#3b82f6' },
                    { name: 'Máq. Virtuais', value: valuesByType.maquinasVirtuais, fill: '#a855f7' },
                    { name: 'Internet Fibra', value: valuesByType.fibra, fill: '#22c55e' },
                    { name: 'Double Fibra/Radio', value: valuesByType.doubleFibraRadio, fill: '#ef4444' },
                    { name: 'MAN Fibra', value: valuesByType.man, fill: '#06b6d4' },
                    { name: 'MAN Radio', value: valuesByType.manRadio, fill: '#f97316' },
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, value }) => `${name}: R$ ${(value / 1000).toFixed(0)}k (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[
                    { name: 'PABX/SIP', value: valuesByType.pabx, fill: '#3b82f6' },
                    { name: 'Máq. Virtuais', value: valuesByType.maquinasVirtuais, fill: '#a855f7' },
                    { name: 'Internet Fibra', value: valuesByType.fibra, fill: '#22c55e' },
                    { name: 'Double Fibra/Radio', value: valuesByType.doubleFibraRadio, fill: '#ef4444' },
                    { name: 'MAN Fibra', value: valuesByType.man, fill: '#06b6d4' },
                    { name: 'MAN Radio', value: valuesByType.manRadio, fill: '#f97316' },
                  ].filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
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
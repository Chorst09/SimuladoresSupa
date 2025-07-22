'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Briefcase, Tag, Server, Lightbulb, DollarSign, FileText } from 'lucide-react';
import { uuidv4 } from '@/lib/uuid';

import type { OperationType, Regime, OutrosCustos, LaborCost, CompanyInfo, ClientInfo, AccountManagerInfo, QuoteItem, SaleItem, RentalItem, ServiceItem } from '@/types';
import { initialRegimes, initialOutrosCustos, initialLaborCost, initialCompanyInfo, initialIcmsInterstate, brazilianStates } from '@/lib/constants';
import { usePricingCalculator } from '@/hooks/use-pricing-calculator';

import AppHeader from '@/components/app-header';
import TabButton from '@/components/tab-button';
import ConfigModal from '@/components/config-modal';
import QuoteModal from '@/components/quote-modal';
import ItemsTable from '@/components/items-table';
import ResultPanel from '@/components/result-panel';
import { Input } from '@/components/ui/input';
import QuoteDisplay from '@/components/quote-display';
import { Button } from '@/components/ui/button';
import QuoteInfoPanel from '@/components/quote-info-panel';
import InputField from '@/components/input-field';
import { FilePlus2, Save, Search } from 'lucide-react';
import DREAnalysis from '@/components/dre-analysis';

export default function PrecisionPricingPage() {
  const [operationType, setOperationType] = useState<OperationType>('venda');

  // Configuration States
  const [regimes, setRegimes] = useState<Regime[]>(initialRegimes);
  const [activeRegimeId, setActiveRegimeId] = useState<string>(initialRegimes[0].id);
  const [outrosCustos, setOutrosCustos] = useState<OutrosCustos>(initialOutrosCustos);
  const [laborCostConfig, setLaborCostConfig] = useState<LaborCost>(initialLaborCost);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const [icmsInterstate, setIcmsInterstate] = useState<Record<string, number>>(initialIcmsInterstate);

  // Quote Info States
  const [clientInfo, setClientInfo] = useState<ClientInfo>({ name: '', company: '', phone: '', email: '' });
  const [accountManagerInfo, setAccountManagerInfo] = useState<AccountManagerInfo>({ name: 'Seu Nome', email: 'seu.email@empresa.com', phone: '(41) 98888-8888' });
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);

  // Modal States
  const [isConfigModalOpen, setConfigModalOpen] = useState(false);
  const [isQuoteModalOpen, setQuoteModalOpen] = useState(false);

  // Input States
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);

  const [proposalNumber, setProposalNumber] = useState('');
  const [rentalPeriod, setRentalPeriod] = useState(12);
  const [desiredMarginVenda, setDesiredMarginVenda] = useState(20);
  const [desiredMarginLocacao, setDesiredMarginLocacao] = useState(20);
  const [desiredMarginServicos, setDesiredMarginServicos] = useState(20); const [isIcmsContributor, setIsIcmsContributor] = useState(false);
  const [destinationUF, setDestinationUF] = useState('SP');
  const [proposalStep, setProposalStep] = useState<'initial' | 'client-info' | 'add-items' | 'view-quote'>('initial');

  useEffect(() => {
    setSaleItems([{ id: uuidv4(), description: 'Servidor Dell', quantity: 1, unitCost: 8500, creditoIcmsCompra: 1020, icmsDestLocal: 18.0, icmsST: false }]);
    setRentalItems([{ id: uuidv4(), description: 'Servidor Dell', quantity: 1, assetValueBRL: 5000, sucataPercent: 10, icmsCompra: 0, icmsPr: 12.0, frete: 0 }]);
    setServiceItems([{ id: uuidv4(), description: 'Consultoria de TI', estimatedHours: 20, baseSalary: initialLaborCost.geral.salarioBase, contractType: 'clt' }]);
  }, []);

  const { calculationResults, operationAnalysis, calculateHourlyCost } = usePricingCalculator({
    operationType,
    activeRegimeId,
    regimes,
    outrosCustos,
    laborCostConfig,
    icmsInterstate,
    saleItems,
    rentalItems,
    serviceItems,
    rentalPeriod,
    desiredMarginVenda,
    desiredMarginLocacao,
    desiredMarginServicos,
    isIcmsContributor,
    destinationUF,
  });

  const handleNewProposal = useCallback(() => {
    setProposalStep('client-info'); // Start with client info step
    setOperationType('venda');
    setClientInfo({ name: '', company: '', phone: '', email: '' });
    setAccountManagerInfo({ name: 'Seu Nome', email: 'seu.email@empresa.com', phone: '(41) 98888-8888' });
    setQuoteItems([]);
    setSaleItems([{ id: uuidv4(), description: 'Servidor Dell', quantity: 1, unitCost: 8500, creditoIcmsCompra: 1020, icmsDestLocal: 18.0, icmsST: false }]);
    setRentalItems([{ id: uuidv4(), description: 'Servidor Dell', quantity: 1, assetValueBRL: 5000, sucataPercent: 10, icmsCompra: 0, icmsPr: 12.0, frete: 0 }]);
    setServiceItems([{ id: uuidv4(), description: 'Consultoria de TI', estimatedHours: 20, baseSalary: initialLaborCost.geral.salarioBase, contractType: 'clt' }]);
    setProposalNumber('');
    setRentalPeriod(12);
    setDesiredMarginVenda(20);
    setDesiredMarginLocacao(20);
    setDesiredMarginServicos(20);
    setIsIcmsContributor(false);
    setDestinationUF('SP');
    // Note: Configuration states (regimes, outrosCustos, laborCostConfig, companyInfo, icmsInterstate) are not reset as they are typically global for the user/company.
  }, []);

  const generateNextProposalNumber = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const storageKey = `lastProposalNumber_${currentYear}`;
    const lastNumber = localStorage.getItem(storageKey);
    let nextNumber = lastNumber ? parseInt(lastNumber, 10) + 1 : 1;

    // Save the incremented number for the current year
    localStorage.setItem(storageKey, nextNumber.toString());

    // Format the number with leading zeros and append the year
    const formattedNumber = nextNumber.toString().padStart(4, '0');
    return `${formattedNumber}/${currentYear}`;
  }, []);

  const handleSaveProposal = useCallback(() => {
    console.log("Saving proposal:", proposalNumber);
    if (!proposalNumber) {
      alert("Por favor, insira um número para a proposta antes de salvar.");
      return;
    }
    const proposalData = {
      operationType,
      clientInfo,
      accountManagerInfo,
      quoteItems,
      saleItems,
      rentalItems,
      serviceItems,
      rentalPeriod,
      desiredMarginVenda,
      desiredMarginLocacao,
      desiredMarginServicos,
      isIcmsContributor,
      destinationUF,
      // Save configuration states as well if they should be proposal-specific
      activeRegimeId,
      regimes,
      outrosCustos,
      laborCostConfig,
      companyInfo,
      icmsInterstate,
    };
    try {
      localStorage.setItem(`proposal_${proposalNumber}`, JSON.stringify(proposalData));
      console.log("Proposal saved successfully!");
      alert(`Proposta ${proposalNumber} salva com sucesso!`);
    } catch (error) {
      console.error("Erro ao salvar proposta no localStorage:", error);
      alert("Ocorreu um erro ao salvar a proposta.");
      console.error("Error saving proposal:", error);
    }
  }, [
    proposalNumber,
    operationType,
    clientInfo,
    accountManagerInfo,
    quoteItems,
    saleItems,
    rentalItems,
    serviceItems,
    rentalPeriod,
    desiredMarginVenda,
    desiredMarginLocacao,
    desiredMarginServicos,
    isIcmsContributor,
    destinationUF,
    activeRegimeId,
    regimes,
    outrosCustos,
    laborCostConfig,
    companyInfo,
    icmsInterstate,
  ]);

  const handleLoadProposal = useCallback(() => {
    console.log("Attempting to load proposal:", proposalNumber);
    // The load functionality will still rely on the user entering the number to search.
    if (!proposalNumber) {
      alert("Por favor, insira o número da proposta que deseja buscar.");
      return;
    }
    const savedData = localStorage.getItem(`proposal_${proposalNumber}`);
    if (savedData) {
      try {
        const proposalData = JSON.parse(savedData);
        console.log("Proposal data loaded:", proposalData);
        setOperationType(proposalData.operationType || 'venda');
        setClientInfo(proposalData.clientInfo || { name: '', company: '', phone: '', email: '' });
        setAccountManagerInfo(proposalData.accountManagerInfo || { name: 'Seu Nome', email: 'seu.email@empresa.com', phone: '(41) 98888-8888' });
        setQuoteItems(proposalData.quoteItems || []);
        setSaleItems(proposalData.saleItems || [{ id: uuidv4(), description: 'Servidor Dell', quantity: 1, unitCost: 8500, creditoIcmsCompra: 1020, icmsDestLocal: 18.0, icmsST: false }]);
        setRentalItems(proposalData.rentalItems || [{ id: uuidv4(), description: 'Servidor Dell', quantity: 1, assetValueBRL: 5000, sucataPercent: 10, icmsCompra: 0, icmsPr: 12.0, frete: 0 }]);
        setServiceItems(proposalData.serviceItems || [{ id: uuidv4(), description: 'Consultoria de TI', estimatedHours: 20, baseSalary: initialLaborCost.geral.salarioBase, contractType: 'clt' }]);
        setRentalPeriod(proposalData.rentalPeriod || 12);
        setDesiredMarginVenda(proposalData.desiredMarginVenda || 20);
        setDesiredMarginLocacao(proposalData.desiredMarginLocacao || 20);
        setDesiredMarginServicos(proposalData.desiredMarginServicos || 20);
        setIsIcmsContributor(proposalData.isIcmsContributor || false);
        setDestinationUF(proposalData.destinationUF || 'SP');
        // Restore configuration states (handle potential missing data with fallbacks)
        setActiveRegimeId(proposalData.activeRegimeId || initialRegimes[0].id);
        setRegimes(proposalData.regimes || initialRegimes);
        alert(`Proposta ${proposalNumber} carregada com sucesso!`);
        setProposalStep('add-items'); // Move to add items step if a proposal is loaded
      } catch (error) {
        console.error("Error loading proposal:", error);
        alert(`Erro ao carregar proposta ${proposalNumber}. O formato dos dados pode estar incorreto.`);
      }
    } else {
      console.log("Proposal not found.");
      alert(`Proposta ${proposalNumber} não encontrada.`);
    }
  }, [proposalNumber]);

  // Auto-generate proposal number on initial load and on new proposal
  React.useEffect(() => {
    if (!proposalNumber && proposalStep === 'initial') handleNewProposal(); // Generate on initial load only if step is initial
  }, [handleNewProposal, proposalNumber]); // Dependency on handleNewProposal and proposalNumber to avoid infinite loops

  const activeRegime = regimes.find(r => r.id === activeRegimeId);

  const handleAddToQuote = () => {
    if (!calculationResults) return;

    const { itemCalculations, finalPrice } = calculationResults;

    let newQuoteItems: QuoteItem[] = [];

    switch (operationType) {
      case 'venda':
        newQuoteItems = saleItems.map(item => {
          const itemCalc = itemCalculations?.[item.id] || {};
          const itemFinalPrice = itemCalc.rbUnitario || 0;
          return {
            id: uuidv4(),
            description: item.description,
            quantity: item.quantity || 0,
            price: itemFinalPrice,
            type: 'venda',
            baseCost: item.unitCost,
            totalPrice: itemFinalPrice * (item.quantity || 0),
          };
        });
        break;
      case 'servicos': {
        const totalBaseCost = serviceItems.reduce((sum, item) => {
          const itemCalc = itemCalculations?.[item.id] || {};
          return sum + (itemCalc.totalCost || 0);
        }, 0);

        const pricingRatio = totalBaseCost > 0 ? finalPrice / totalBaseCost : 0;
        newQuoteItems = serviceItems.map(item => {
          const itemCalc = itemCalculations?.[item.id] || {};
          const itemBaseCost = itemCalc.totalCost || 0;
          const itemFinalPrice = itemBaseCost * pricingRatio;
          const pricePerHour = (item.estimatedHours || 0) > 0 ? itemFinalPrice / item.estimatedHours : 0;
          return {
            id: uuidv4(),
            description: item.description,
            quantity: 1, // Service is a single "package"
            price: pricePerHour,
            type: 'servicos',
            baseCost: itemBaseCost,
            totalPrice: itemFinalPrice,
            estimatedHours: item.estimatedHours,
          };
        });
        break;
      }
      case 'locacao':
        newQuoteItems = rentalItems.map(item => {
          const itemCalc = itemCalculations?.[item.id] || {};
          const finalMonthlyPrice = itemCalc.rbUnitario || 0;
          const itemLineMonthlyBaseCost = itemCalc.monthlyCost || 0;
          const totalLineBaseCost = itemLineMonthlyBaseCost * rentalPeriod;
          const totalContractPrice = finalMonthlyPrice * (item.quantity || 0) * rentalPeriod;

          return {
            id: uuidv4(),
            description: item.description,
            quantity: item.quantity || 0,
            price: finalMonthlyPrice,
            type: 'locacao',
            period: rentalPeriod,
            baseCost: totalLineBaseCost,
            totalPrice: totalContractPrice,
          };
        });
        break;
    }
    setQuoteItems(prev => [...prev, ...newQuoteItems.filter(item => item.totalPrice > 0)]);
  };

  const renderInputs = () => {
    const activeRegime = regimes.find(r => r.id === activeRegimeId);
    if (!activeRegime) return null;

    return (
      <div className="space-y-6">
        <ItemsTable
          operationType={operationType}
          items={{ saleItems, rentalItems, serviceItems }}
          setItems={{ setSaleItems, setRentalItems, setServiceItems }}
          laborCostConfig={laborCostConfig}
          calculationParams={{
            activeRegime,
            rentalPeriod,
            desiredMargin: 0,
            divisor: null,
            isIcmsContributor,
            destinationUF,
            icmsInterstate,
          }}
          calculationResults={calculationResults}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          {operationType === 'locacao' && <InputField label="Período do Contrato (meses)" value={rentalPeriod} onChange={(e) => setRentalPeriod(parseFloat(e.target.value) || 0)} icon={<Briefcase size={16} />} unit="meses" type="number" />}
          {operationType === 'venda' && (
            <InputField label="Margem de Lucro Desejada" value={desiredMarginVenda} onChange={(e) => setDesiredMarginVenda(parseFloat(e.target.value) || 0)} icon={<Lightbulb size={16} />} unit="%" step="1" type="number" />
          )}
          {operationType === 'locacao' && (
            <InputField label="Margem de Lucro Desejada" value={desiredMarginLocacao} onChange={(e) => setDesiredMarginLocacao(parseFloat(e.target.value) || 0)} icon={<Lightbulb size={16} />} unit="%" step="1" type="number" />
          )}
          {operationType === 'servicos' && (
            <InputField label="Margem de Lucro Desejada" value={desiredMarginServicos} onChange={(e) => setDesiredMarginServicos(parseFloat(e.target.value) || 0)} icon={<Lightbulb size={16} />} unit="%" step="1" type="number" />
          )}
        </div>

        {operationType === 'venda' && (
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isIcmsContributor" name="isIcmsContributor" checked={isIcmsContributor} onChange={(e) => setIsIcmsContributor(e.target.checked)} className="form-checkbox h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <label htmlFor="isIcmsContributor" className="text-sm text-foreground/80">Consumidor Final é Contribuinte do ICMS?</label>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="destinationUF" className="text-sm text-foreground/80">UF Destino:</label>
              <select id="destinationUF" name="destinationUF" value={destinationUF} onChange={(e) => setDestinationUF(e.target.value)} className="bg-background border border-input rounded-md text-foreground py-1 px-2 focus:ring-ring focus:border-ring">
                {brazilianStates.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderClientInfo = () => {
    return (
      <div className="space-y-8">
        <QuoteInfoPanel
          clientInfo={clientInfo} setClientInfo={setClientInfo}
          accountManagerInfo={accountManagerInfo} setAccountManagerInfo={setAccountManagerInfo}
        />
        <Button onClick={() => setProposalStep('add-items')}>Continuar para Adicionar Itens</Button>
      </div>
    );
  };

  const renderAddItems = () => {
    return (
      <>
        <div className="flex flex-col gap-8">
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-headline font-semibold text-foreground mb-4 border-b pb-3">Parâmetros de Cálculo</h3>
            {renderInputs()}
          </div>
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
            <ResultPanel
              results={calculationResults}
              operationAnalysis={operationAnalysis}
              onAddToQuote={handleAddToQuote}
              operationType={operationType}
              rentalPeriod={rentalPeriod}
            />
          </div>
        </div>
      </>
    );
  };


  return (
    <main className="min-h-screen bg-background text-foreground font-body p-4 sm:p-6 lg:p-8">
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setConfigModalOpen(false)}
        initialConfig={{ regimes, activeRegimeId, outrosCustos, laborCost: laborCostConfig, companyInfo: companyInfo, icmsInterstate }}
        onSave={(newConfig) => {
          setRegimes(newConfig.regimes);
          setActiveRegimeId(newConfig.activeRegimeId);
          setOutrosCustos(newConfig.outrosCustos);
          setLaborCostConfig(newConfig.laborCost)
          setCompanyInfo(newConfig.companyInfo);
          setIcmsInterstate(newConfig.icmsInterstate);
        }}
      />
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        companyInfo={companyInfo}
        clientInfo={clientInfo}
        accountManagerInfo={accountManagerInfo}
        quoteItems={quoteItems}
        proposalNumber={proposalNumber}
      />
      <div className="max-w-screen-2xl mx-auto">
        <AppHeader onConfigClick={() => setConfigModalOpen(true)} taxRegimeName={calculationResults.taxRegimeName} />
        {/* Remover o bloco de imagem de fundo do título, mantendo apenas o título e subtítulo centralizados */}
        {/* Remover o bloco de título e subtítulo duplicado, mantendo apenas o AppHeader */}
        <div className="bg-card/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-sm border space-y-8">
          {/* Proposal Management Section */}
          <div className="mb-8 max-w-lg mx-auto">
            {/* Input and action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col">
                <label htmlFor="proposalNumber" className="text-sm font-medium mb-1">Número da Proposta</label>
                <Input
                  id="proposalNumber"
                  value={proposalNumber}
                  onChange={(e) => setProposalNumber(e.target.value.toUpperCase())}
                  placeholder="Digite o número"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => setProposalNumber(generateNextProposalNumber())} className="flex items-center justify-center gap-2 font-bold shadow-lg bg-gradient-to-tr from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 scale-105 transition-transform">
                  <FilePlus2 size={16} /> Nova
                </Button>
                <Button variant="secondary" onClick={handleLoadProposal} className="flex items-center justify-center gap-2 font-bold shadow-lg bg-orange-600 text-white hover:bg-orange-700 scale-105 transition-transform">
                  <Search size={16} /> Buscar
                </Button>
                <Button variant="secondary" onClick={handleSaveProposal} className="flex items-center justify-center gap-2 col-span-2 font-bold shadow-lg bg-blue-900 text-white hover:bg-blue-800 scale-105 transition-transform">
                  <Save size={16} /> Salvar Proposta
                </Button>
                <Button onClick={() => setQuoteModalOpen(true)} className="flex items-center justify-center gap-2 col-span-2 font-bold shadow-lg bg-green-800 text-white hover:bg-green-900 scale-105 transition-transform">
                  <FileText size={16} /> Gerar Proposta Formal
                </Button>
              </div>
            </div>
            {/* Operation Type Buttons */}
            <div className="flex space-x-2 bg-background p-1.5 rounded-lg border shadow-inner mt-4 sm:mt-0 justify-center">
              <TabButton label="Venda" icon={<Tag />} isActive={operationType === 'venda'} onClick={() => setOperationType('venda')} />
              <TabButton label="Locação" icon={<Server />} isActive={operationType === 'locacao'} onClick={() => setOperationType('locacao')} />
              <TabButton label="Serviços" icon={<Briefcase />} isActive={operationType === 'servicos'} onClick={() => setOperationType('servicos')} />
            </div>
          </div>

          {/* Conditional Content */}
          {proposalStep === 'client-info' && renderClientInfo()}
          {proposalStep === 'add-items' && renderAddItems()}
        </div>

        {/* Quote Display and DRE Analysis Section */}
        <div className="mt-8 space-y-8">
          <QuoteDisplay
            items={quoteItems}
            onRemove={(id) => setQuoteItems(prev => prev.filter(item => item.id !== id))}
            onClear={() => setQuoteItems([])}
            onGenerateQuote={() => setQuoteModalOpen(true)}
          />
          {quoteItems.length > 0 && (
            <DREAnalysis
              quoteItems={quoteItems}
              activeRegime={activeRegime}
              outrosCustos={outrosCustos}
              desiredMarginVenda={desiredMarginVenda}
              desiredMarginLocacao={desiredMarginLocacao}
              desiredMarginServicos={desiredMarginServicos}
            />
          )}
        </div> {/* Closing mt-8 space-y-8 div */}

        <footer className="text-center mt-12 text-muted-foreground text-xs">
          <p><strong>Aviso Legal:</strong> Esta é uma ferramenta de simulação. As alíquotas de impostos são valores representativos e podem variar. Consulte sempre um contador profissional.</p>
        </footer>
      </div>
    </main>
  );
}
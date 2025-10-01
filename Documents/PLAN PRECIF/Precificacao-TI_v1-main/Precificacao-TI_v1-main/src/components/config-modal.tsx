
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { X, Check, Trash2, Hourglass, DollarSign } from 'lucide-react';
import type { Regime, OutrosCustos, LaborCost, CompanyInfo } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InputField from './input-field';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { initialRegimes } from '@/lib/constants';
import { uuidv4 } from '@/lib/uuid';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: {
    regimes: Regime[];
    activeRegimeId: string;
    outrosCustos: OutrosCustos;
    laborCost: LaborCost;
    companyInfo: CompanyInfo;
    icmsInterstate: Record<string, number>;
  }) => void;
  initialConfig: {
    regimes: Regime[];
    activeRegimeId: string;
    outrosCustos: OutrosCustos;
    laborCost: LaborCost;
    companyInfo: CompanyInfo;
    icmsInterstate: Record<string, number>;
  };
}

const laborEncargosLabels: Record<string, string> = {
    ferias: 'Férias',
    tercoFerias: '1/3 Férias',
    decimoTerceiro: '13º Salário',
    inssBase: 'INSS (Base)',
    inssSistemaS: 'INSS (Sistema S)',
    inssFerias13: 'INSS (Férias/13º)',
    fgts: 'FGTS',
    fgtsFerias13: 'FGTS (Férias/13º)',
    multaFgts: 'Multa FGTS (Rescisão)',
    outros: 'Outros',
};

const laborBeneficiosLabels: Record<string, string> = {
    valeTransporte: 'Vale Transporte',
    planoSaude: 'Plano de Saúde',
    alimentacao: 'Vale Alimentação/Refeição',
};

const ConfigModal = ({ isOpen, onClose, onSave, initialConfig }: ConfigModalProps) => {
  const [tempRegimes, setTempRegimes] = useState<Regime[]>([]);
  const [tempActiveRegimeId, setTempActiveRegimeId] = useState('');
  const [tempOutrosCustos, setTempOutrosCustos] = useState<OutrosCustos>(initialConfig.outrosCustos);
  const [tempLaborCost, setTempLaborCost] = useState<LaborCost>(initialConfig.laborCost);
  const [tempCompanyInfo, setTempCompanyInfo] = useState<CompanyInfo>(initialConfig.companyInfo);
  const [tempIcmsInterstate, setTempIcmsInterstate] = useState<Record<string, number>>(initialConfig.icmsInterstate);
  const [showAddRegimeOptions, setShowAddRegimeOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempRegimes(JSON.parse(JSON.stringify(initialConfig.regimes)));
      setTempActiveRegimeId(initialConfig.activeRegimeId);
      setTempOutrosCustos(JSON.parse(JSON.stringify(initialConfig.outrosCustos)));
      setTempLaborCost(JSON.parse(JSON.stringify(initialConfig.laborCost)));
      setTempCompanyInfo(JSON.parse(JSON.stringify(initialConfig.companyInfo)));
      setTempIcmsInterstate(JSON.parse(JSON.stringify(initialConfig.icmsInterstate)));
      setShowAddRegimeOptions(false);
    }
  }, [isOpen, initialConfig]);

  const handleSave = () => {
    onSave({
      regimes: tempRegimes,
      activeRegimeId: tempActiveRegimeId,
      outrosCustos: tempOutrosCustos,
      laborCost: tempLaborCost,
      companyInfo: tempCompanyInfo,
      icmsInterstate: tempIcmsInterstate
    });
    onClose();
  };
  
  const handleLaborCostChange = (section: 'encargos' | 'beneficios', field: string, value: string) => {
    const parsed = parseFloat(value) || 0;
    setTempLaborCost(prev => ({ ...prev!, clt: { ...prev!.clt, [section]: { ...prev!.clt[section], [field]: parsed } } }));
  };
  const handleGeneralLaborChange = (field: keyof LaborCost['geral'], value: string) => {
    setTempLaborCost(prev => ({ ...prev!, geral: { ...prev!.geral, [field]: parseFloat(value) || 0 } }));
  };
  const handleOutrosCustosChange = (key: keyof OutrosCustos, value: string) => setTempOutrosCustos(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  const handleCompanyInfoChange = (key: keyof CompanyInfo, value: string) => setTempCompanyInfo(prev => ({ ...prev, [key]: value }));
  const handleIcmsChange = (uf: string, value: string) => setTempIcmsInterstate(prev => ({ ...prev, [uf]: parseFloat(value) || 0 }));

  const totalEncargos = useMemo(() => (tempLaborCost?.clt?.encargos ? Object.values(tempLaborCost.clt.encargos).reduce((sum, val) => sum + val, 0) : 0), [tempLaborCost]);
  const totalBeneficios = useMemo(() => (tempLaborCost?.clt?.beneficios ? Object.values(tempLaborCost.clt.beneficios).reduce((sum, val) => sum + val, 0) : 0), [tempLaborCost]);

  const hourlyCost = useMemo(() => {
    if (!tempLaborCost || !tempLaborCost.geral || !tempLaborCost.clt) return 0;
    
    const { geral, clt } = tempLaborCost;
    const { diasUteis, horasDia, salarioBase } = geral;

    const totalHorasMes = (diasUteis || 1) * (horasDia || 1);
    if (totalHorasMes === 0) return 0;

    const totalEncargosPercent = Object.values(clt.encargos).reduce((s, v) => s + v, 0) / 100;
    const custoMensalEncargos = salarioBase * totalEncargosPercent;
    const totalBeneficiosValue = Object.values(clt.beneficios).reduce((s, v) => s + v, 0);
    const custoTotalMensal = salarioBase + custoMensalEncargos + totalBeneficiosValue;
    
    return custoTotalMensal / totalHorasMes;
  }, [tempLaborCost]);

  const vendaHora = useMemo(() => {
    if (!hourlyCost || hourlyCost <= 0) return 0;
    
    const margemRate = (tempOutrosCustos.margemLucroServico || 0) / 100;
    const comissaoRate = (tempOutrosCustos.comissaoServico || 0) / 100;
    const despesasRate = ((tempOutrosCustos.despesasAdmin || 0) + (tempOutrosCustos.outrasDespesas || 0)) / 100;
    
    const totalRates = margemRate + comissaoRate + despesasRate;

    if (totalRates >= 1) return 0; 
    
    const denominator = 1 - totalRates;
    const sellPriceBeforeTax = hourlyCost / denominator;

    // Simplified tax calculation for display
    const activeRegime = tempRegimes.find(r => r.id === tempActiveRegimeId);
    if (!activeRegime) return sellPriceBeforeTax;
    
    let taxRate = 0;
    if (activeRegime.type === 'presumido') {
        const { pis = 0, cofins = 0, iss = 0, irpj = 0, csll = 0, presuncaoServico = 0 } = activeRegime.rates;
        taxRate = (pis / 100) + (cofins / 100) + (iss / 100) + ((presuncaoServico/100) * ((irpj/100) + (csll/100)));
    } else if (activeRegime.type === 'simples') {
        const { anexoIII = 0 } = activeRegime.rates;
        taxRate = anexoIII / 100;
    }
    else if (activeRegime.type === 'real') {
        const { pis = 0, cofins = 0, iss = 0 } = activeRegime.rates;
        taxRate = (pis / 100) + (cofins / 100) + (iss / 100);
    }

    if(taxRate >= 1) return sellPriceBeforeTax;

    return sellPriceBeforeTax / (1 - taxRate);

  }, [hourlyCost, tempOutrosCustos, tempRegimes, tempActiveRegimeId]);

  if (!isOpen) return null;

  const addRegime = (type: Regime['type']) => {
    const newId = uuidv4();
    const baseRegime = initialRegimes.find(r => r.type === type);
    if (!baseRegime) return;

    const newRegime: Regime = {
      id: newId,
      name: `Novo ${baseRegime.name.replace(' (Padrão)', '')}`,
      type: type,
      rates: { ...baseRegime.rates }
    };
    setTempRegimes(prev => [...prev, newRegime]);
    setShowAddRegimeOptions(false);
  };
  
  const removeRegime = (id: string) => {
    if (tempRegimes.length <= 1) {
      alert('É necessário ter pelo menos um regime.');
      return;
    }
    if (window.confirm('Tem certeza que deseja remover este regime?')) {
      const newRegimes = tempRegimes.filter(r => r.id !== id);
      setTempRegimes(newRegimes);
      if (tempActiveRegimeId === id) setTempActiveRegimeId(newRegimes[0].id);
    }
  };

  const renderRateFields = (regime: Regime) => {
    const { type, rates, id } = regime;
    const handleRegimeValueChange = (field: string, value: string) => {
      setTempRegimes(prev => prev.map(r => r.id === id ? { ...r, rates: { ...r.rates, [field]: parseFloat(value) || 0 } } : r));
    };
    const commonProps = (field: keyof typeof rates) => ({ value: rates[field] || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleRegimeValueChange(field, e.target.value), unit: "%", type: "number" });

    switch (type) {
      case 'presumido': return <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><InputField label="PIS" {...commonProps('pis')} /><InputField label="COFINS" {...commonProps('cofins')} /><InputField label="CSLL" {...commonProps('csll')} /><InputField label="IRPJ" {...commonProps('irpj')} /><InputField label="ICMS" {...commonProps('icms')} /><InputField label="ISS" {...commonProps('iss')} /><InputField label="Base Presunção Venda" {...commonProps('presuncaoVenda')} /><InputField label="Base Presunção Serviço" {...commonProps('presuncaoServico')} /></div>;
      case 'real': return <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><InputField label="PIS" {...commonProps('pis')} /><InputField label="COFINS" {...commonProps('cofins')} /><InputField label="CSLL" {...commonProps('csll')} /><InputField label="IRPJ" {...commonProps('irpj')} /><InputField label="ICMS" {...commonProps('icms')} /><InputField label="ISS" {...commonProps('iss')} /></div>;
      case 'simples': return <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><InputField label="Anexo I (Comércio)" {...commonProps('anexoI')} /><InputField label="Anexo III (Serviço)" {...commonProps('anexoIII')} /></div>;
      case 'mei': return <p className="text-muted-foreground text-center p-4 bg-muted rounded-md">O MEI paga um valor fixo mensal (DAS-MEI), não possuindo alíquotas percentuais sobre a nota fiscal.</p>;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="font-headline">Configurações Gerais e Tributárias</DialogTitle>
        </DialogHeader>
        <div className="flex-grow flex min-h-0">
          <Tabs defaultValue="regimes" className="flex-grow flex w-full">
            <TabsList className="flex flex-col h-full w-1/4 bg-muted/50 p-2 rounded-none border-r justify-start items-stretch">
              <TabsTrigger value="regimes" className="justify-start px-4 py-2">Regimes Tributários</TabsTrigger>
              <TabsTrigger value="custos" className="justify-start px-4 py-2">Custos e Despesas</TabsTrigger>
              <TabsTrigger value="maoDeObra" className="justify-start px-4 py-2">Mão de Obra</TabsTrigger>
              <TabsTrigger value="icms" className="justify-start px-4 py-2">ICMS Interestadual</TabsTrigger>
              <TabsTrigger value="empresa" className="justify-start px-4 py-2">Dados da Empresa</TabsTrigger>
            </TabsList>
            <div className="w-3/4 p-6 overflow-y-auto">
              <TabsContent value="regimes" className="space-y-6 mt-0">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold font-headline">Gerenciar Regimes</h3>
                    <Button onClick={() => setShowAddRegimeOptions(s => !s)} variant="outline">{showAddRegimeOptions ? 'Cancelar' : 'Adicionar Regime'}</Button>
                </div>
                {showAddRegimeOptions && (
                    <div className="p-4 border rounded-lg mt-4 grid grid-cols-2 gap-2">
                        <Button variant="ghost" onClick={() => addRegime('presumido')}>Lucro Presumido</Button>
                        <Button variant="ghost" onClick={() => addRegime('real')}>Lucro Real</Button>
                        <Button variant="ghost" onClick={() => addRegime('simples')}>Simples Nacional</Button>
                        <Button variant="ghost" onClick={() => addRegime('mei')}>MEI</Button>
                    </div>
                )}
                {tempRegimes.map(reg => (
                  <div key={reg.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <InputField label="Nome do Regime" value={reg.name} onChange={(e) => setTempRegimes(p => p.map(r => r.id === reg.id ? { ...r, name: e.target.value } : r))} />
                      <div className="flex items-center gap-2 pt-7">
                        <Button variant="ghost" size="icon" onClick={() => removeRegime(reg.id)} className="text-destructive"><Trash2 size={18} /></Button>
                        <Button onClick={() => setTempActiveRegimeId(reg.id)} disabled={tempActiveRegimeId === reg.id} variant={tempActiveRegimeId === reg.id ? "default" : "secondary"}>
                          {tempActiveRegimeId === reg.id ? <><Check size={16} className="mr-2" /> Ativo</> : 'Ativar'}
                        </Button>
                      </div>
                    </div>
                    {renderRateFields(reg)}
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="custos" className="mt-0">
                  <h3 className="text-xl font-bold font-headline mb-4">Custos e Despesas Globais (%)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <InputField label="Comissão Venda" value={String(tempOutrosCustos.comissaoVenda)} onChange={(e) => handleOutrosCustosChange('comissaoVenda', e.target.value)} unit="%" type="number"/>
                    <InputField label="Comissão Locação" value={String(tempOutrosCustos.comissaoLocacao)} onChange={(e) => handleOutrosCustosChange('comissaoLocacao', e.target.value)} unit="%" type="number"/>
                    <InputField label="Comissão Serviço" value={String(tempOutrosCustos.comissaoServico)} onChange={(e) => handleOutrosCustosChange('comissaoServico', e.target.value)} unit="%" type="number"/>
                    <InputField label="Margem Lucro Serviço" value={String(tempOutrosCustos.margemLucroServico ?? 0)} onChange={(e) => handleOutrosCustosChange('margemLucroServico', e.target.value)} unit="%" type="number"/>
                    <InputField label="Despesas Admin." value={String(tempOutrosCustos.despesasAdmin)} onChange={(e) => handleOutrosCustosChange('despesasAdmin', e.target.value)} unit="%" type="number"/>
                    <InputField label="Outras Despesas" value={String(tempOutrosCustos.outrasDespesas)} onChange={(e) => handleOutrosCustosChange('outrasDespesas', e.target.value)} unit="%" type="number"/>
                    <InputField label="Custo Financeiro Mensal" value={String(tempOutrosCustos.custoFinanceiroMensal)} onChange={(e) => handleOutrosCustosChange('custoFinanceiroMensal', e.target.value)} unit="%" type="number"/>
                    <InputField label="Taxa Desconto VPL" value={String(tempOutrosCustos.taxaDescontoVPL)} onChange={(e) => handleOutrosCustosChange('taxaDescontoVPL', e.target.value)} unit="%" type="number"/>
                    <InputField label="Depreciacao" value={String(tempOutrosCustos.depreciacao ?? 0)} onChange={(e) => handleOutrosCustosChange('depreciacao', e.target.value)} unit="%" type="number"/>
                  </div>
              </TabsContent>
              <TabsContent value="maoDeObra" className="mt-0">
                <h3 className="text-xl font-bold font-headline mb-4">Gasto com Mão de Obra</h3>
                {tempLaborCost && tempLaborCost.clt && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4 p-4 border rounded-lg">
                      <h4 className="text-lg font-semibold text-primary">Encargos Sociais (CLT)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(tempLaborCost.clt.encargos).map(([key, value]) => <InputField key={key} label={laborEncargosLabels[key] || key} value={String(value)} onChange={e => handleLaborCostChange('encargos', key, e.target.value)} unit="%" type="number"/>)}
                      </div>
                      <div className="pt-2 mt-4 border-t text-right"><span className="text-sm text-muted-foreground">Total Encargos: </span><span className="font-bold text-lg">{formatPercent(totalEncargos)}</span></div>
                    </div>
                    <div className="space-y-6">
                      <div className="p-4 border rounded-lg">
                        <h4 className="text-lg font-semibold text-primary mb-4">Benefícios (CLT)</h4>
                        <div className="space-y-4">
                          {Object.entries(tempLaborCost.clt.beneficios).map(([key, value]) => <InputField key={key} label={laborBeneficiosLabels[key] || key} value={String(value)} onChange={e => handleLaborCostChange('beneficios', key, e.target.value)} unit="R$" type="number"/>)}
                        </div>
                        <div className="pt-2 mt-4 border-t text-right"><span className="text-sm text-muted-foreground">Total Benefícios: </span><span className="font-bold text-lg">{formatCurrency(totalBeneficios)}</span></div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="text-lg font-semibold text-primary mb-4">Parâmetros Gerais</h4>
                        <div className="space-y-4">
                          <InputField label="Salário Base Padrão" value={String(tempLaborCost.geral.salarioBase)} onChange={(e) => handleGeneralLaborChange('salarioBase', e.target.value)} unit="R$" type="number"/>
                          <InputField label="Dias Úteis no Mês" value={String(tempLaborCost.geral.diasUteis)} onChange={(e) => handleGeneralLaborChange('diasUteis', e.target.value)} type="number"/>
                          <InputField label="Horas/Dia" value={String(tempLaborCost.geral.horasDia)} onChange={(e) => handleGeneralLaborChange('horasDia', e.target.value)} type="number"/>
                        </div>
                        <div className="pt-4 mt-4 border-t space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Hourglass size={14} className="text-muted-foreground" />
                                Custo/Hora (CLT)
                            </span>
                            <span className="font-bold text-lg text-primary">{formatCurrency(hourlyCost)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <DollarSign size={14} className="text-muted-foreground" />
                                Valor/Venda (Hora)
                            </span>
                            <span className="font-bold text-lg text-accent">{formatCurrency(vendaHora)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            Preço de venda final estimado para a hora, com base no regime tributário ativo.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
               <TabsContent value="icms" className="mt-0">
                  <h3 className="text-xl font-bold font-headline mb-4">Alíquotas ICMS Interestadual (Origem: PR)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(tempIcmsInterstate).map(([uf, rate]) => (<InputField key={uf} label={uf} value={String(rate)} onChange={(e) => handleIcmsChange(uf, e.target.value)} unit="%" type="number"/>))}
                  </div>
              </TabsContent>
              <TabsContent value="empresa" className="mt-0">
                <h3 className="text-xl font-bold font-headline mb-4">Dados da Sua Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Nome da Empresa" value={tempCompanyInfo.name} onChange={e => handleCompanyInfoChange('name', e.target.value)} />
                    <InputField label="CNPJ" value={tempCompanyInfo.cnpj} onChange={e => handleCompanyInfoChange('cnpj', e.target.value)} />
                    <InputField label="Endereço" value={tempCompanyInfo.address} onChange={e => handleCompanyInfoChange('address', e.target.value)} />
                    <InputField label="Cidade/Estado" value={tempCompanyInfo.cityState} onChange={e => handleCompanyInfoChange('cityState', e.target.value)} />
                    <InputField label="Telefone" value={tempCompanyInfo.phone} onChange={e => handleCompanyInfoChange('phone', e.target.value)} />
                    <InputField label="E-mail" value={tempCompanyInfo.email} onChange={e => handleCompanyInfoChange('email', e.target.value)} />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        <DialogFooter className="p-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancelar</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigModal;

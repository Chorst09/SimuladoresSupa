
"use client"

import { useMemo } from 'react';
import type { QuoteItem, Regime, OutrosCustos } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, Calculator } from 'lucide-react';

interface DREAnalysisProps {
  quoteItems: QuoteItem[];
  activeRegime: Regime | undefined;
  outrosCustos: OutrosCustos;
  desiredMarginVenda: number;
 desiredMarginLocacao: number;
 desiredMarginServicos: number;
}

interface DREColumnProps {
    title: string;
    data: { label: string; value: number; percent: number; isTotal?: boolean; isFinal?: boolean; }[];
}

const DREColumn = ({ title, data }: DREColumnProps) => (
  <div className="bg-background p-4 rounded-lg shadow-inner border">
    <h3 className="text-lg font-bold text-primary text-center mb-4">{title}</h3>
    <div className="space-y-1 text-sm">
      {data.map(row => (
        <div key={row.label} className={`flex justify-between items-center p-2 rounded-md ${row.isTotal ? 'bg-muted font-semibold' : ''}`}>
          <span className={row.isFinal ? 'text-primary' : 'text-foreground/80'}>{row.label}</span>
          <div className="text-right">
            <span className={`font-mono ${row.isFinal ? 'text-primary' : 'text-foreground'}`}>
              {formatCurrency(row.value)}
            </span>
            <span className="text-xs text-muted-foreground font-mono block">
              {formatPercent(row.percent)}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MarkupAnalysis = ({ data }: { data: any }) => {
  if (!data) return null;

  const analysisItems = [
    { label: "Preço de Custo:", value: formatCurrency(data.precoCusto) },
    { label: "Despesas fixas:", value: formatPercent(data.despesasFixas) },
    { label: "Despesas variáveis:", value: formatPercent(data.despesasVariaveis) },
    { label: "Margem de lucro:", value: formatPercent(data.margemLucro) },
    { label: "Markup:", value: data.markup.toFixed(2).replace('.', ','), isHighlighted: true, isLabelBold: true },
    { label: "Preço de venda:", value: formatCurrency(data.precoVenda), isHighlighted: true },
  ];

  return (
    <Card className="mt-6 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl"><Calculator /> Análise de Venda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-md mx-auto space-y-3">
          {analysisItems.map(item => (
            <div key={item.label} className={`flex justify-between items-center text-lg p-2 rounded-md ${item.isHighlighted ? 'bg-primary/10' : ''}`}>
              <span className={`font-medium text-foreground/90 ${item.isLabelBold ? 'font-bold' : ''}`}>{item.label}</span>
              <span className={`font-semibold font-mono ${item.isHighlighted ? 'text-primary' : 'text-foreground'}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


const DREAnalysis = ({ quoteItems, activeRegime, outrosCustos, desiredMarginVenda, desiredMarginLocacao, desiredMarginServicos }: DREAnalysisProps) => {
  if (!activeRegime) {
    return (
      <Card className="text-center p-10 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Análise DRE</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mt-2 text-muted-foreground">Vá para a tela de Configurações e ative um regime tributário.</p>
        </CardContent>
      </Card>
    );
  }

  const dreData = useMemo(() => {
    const calculateDREForType = (type: QuoteItem['type'], isSale: boolean) => {
      const items = quoteItems.filter(i => i.type === type);
      if (items.length === 0) return null;

      const receitaBruta = items.reduce((sum, item) => sum + item.totalPrice, 0);

      if (receitaBruta === 0) return null;

      let impostos = 0;
      const custoTotal = items.reduce((sum, i) => sum + (i.baseCost * i.quantity), 0);

      const { comissaoVenda, comissaoLocacao, comissaoServico, despesasAdmin, outrasDespesas } = outrosCustos;
      let activeCommissionRate = 0;
      switch (type) {
        case 'venda': activeCommissionRate = comissaoVenda / 100; break;
        case 'locacao': activeCommissionRate = comissaoLocacao / 100; break;
        case 'servicos': activeCommissionRate = comissaoServico / 100; break;
      }
      
      let receitaLiquidaParcial = receitaBruta;

      switch (activeRegime.type) {
        case 'presumido': {
          const { pis = 0, cofins = 0, irpj = 0, csll = 0, presuncaoVenda = 0, presuncaoServico = 0, icms = 0, iss = 0 } = activeRegime.rates;
          const presumption = (isSale ? presuncaoVenda : presuncaoServico) / 100;
          const specificTax = (isSale ? icms : iss) / 100;
          impostos = receitaBruta * ((pis / 100) + (cofins / 100) + specificTax + (presumption * (irpj / 100)) + (presumption * (csll / 100)));
          break;
        }
        case 'real': {
          const { pis = 0, cofins = 0, irpj = 0, csll = 0, icms = 0, iss = 0 } = activeRegime.rates;
          const specificTax = (isSale ? icms : iss) / 100;
          let tempImpostos = receitaBruta * ((pis / 100) + (cofins / 100) + specificTax);
          
          const adminAndOtherExpensesRate = (despesasAdmin / 100) + (outrasDespesas / 100);
          const comissaoValor = (receitaBruta - tempImpostos) * activeCommissionRate;
          const despesasOpValor = (receitaBruta - tempImpostos) * adminAndOtherExpensesRate;

          const lucroOp = receitaBruta - tempImpostos - custoTotal - comissaoValor - (isSale ? 0 : despesasOpValor);

          impostos = tempImpostos + (lucroOp > 0 ? lucroOp * ((irpj / 100) + (csll / 100)) : 0);
          break;
        }
        case 'simples': {
          const { anexoI = 0, anexoIII = 0 } = activeRegime.rates;
          impostos = receitaBruta * ((isSale ? anexoI : anexoIII) / 100);
          break;
        }
        case 'mei': impostos = 0; break;
      }
      
      receitaLiquidaParcial = receitaBruta - impostos;
      const comissaoValor = receitaLiquidaParcial * activeCommissionRate;

      const adminAndOtherExpensesRate = isSale ? 0 : (despesasAdmin / 100) + (outrasDespesas / 100);
      const despesasOperacionais = receitaLiquidaParcial * adminAndOtherExpensesRate + comissaoValor;

      const receitaLiquida = receitaBruta - impostos;
      const lucroBruto = receitaLiquida - custoTotal;
      const lucroLiquido = lucroBruto - despesasOperacionais;
      const toPercent = (value: number) => (receitaBruta !== 0 ? (value / receitaBruta) * 100 : 0);

      const dreRows = [
        { label: "Receita Bruta", value: receitaBruta, percent: toPercent(receitaBruta) },
        { label: "(-) Impostos", value: -impostos, percent: toPercent(-impostos) },
        { label: "= Receita Líquida", value: receitaLiquida, percent: toPercent(receitaLiquida), isTotal: true },
        { label: "(-) Custo (CMV/CSV)", value: -custoTotal, percent: toPercent(-custoTotal) },
        { label: "= Lucro Bruto", value: lucroBruto, percent: toPercent(lucroBruto), isTotal: true },
        { label: "(-) Despesas Op.", value: -despesasOperacionais, percent: toPercent(-despesasOperacionais) },
      ];
      
      // Add desired margin row for Locação
      if (type === 'locacao') {
        const desiredProfitValue = receitaBruta * (desiredMarginLocacao / 100);
        dreRows.splice(dreRows.findIndex(row => row.label === "= Lucro Bruto") + 1, 0, // Insert after Lucro Bruto
          { label: "Margem de Lucro Desejada", value: desiredProfitValue, percent: desiredMarginLocacao }
        );
      }
      dreRows.push({ label: "= Lucro Líquido", value: lucroLiquido, percent: toPercent(lucroLiquido), isFinal: true, isTotal: true });

      return dreRows;
    };
    
    const isSale = quoteItems.some(i => i.type === 'venda');
    const isRental = quoteItems.some(i => i.type === 'locacao');
    const isService = quoteItems.some(i => i.type === 'servicos');

    return {
      venda: isSale ? calculateDREForType('venda', true) : null,
      locacao: isRental ? calculateDREForType('locacao', false) : null,
      servicos: isService ? calculateDREForType('servicos', false) : null,
    };
  }, [quoteItems, activeRegime, outrosCustos, desiredMarginLocacao]);

    const markupData = useMemo(() => {
        if (quoteItems.length === 0 || !quoteItems.some(i => i.type === 'venda')) return null;

        const vendaItems = quoteItems.filter(i => i.type === 'venda');
        const totalCusto = vendaItems.reduce((sum, item) => sum + (item.baseCost * item.quantity), 0);
        const totalReceita = vendaItems.reduce((sum, item) => sum + item.totalPrice, 0);

        let impostos = 0;
        switch (activeRegime.type) {
            case 'presumido': {
              const { pis = 0, cofins = 0, irpj = 0, csll = 0, presuncaoVenda = 0, icms = 0 } = activeRegime.rates;
              const presumption = presuncaoVenda / 100;
              impostos = totalReceita * ((pis / 100) + (cofins / 100) + (icms / 100) + (presumption * (irpj / 100)) + (presumption * (csll / 100)));
              break;
            }
            case 'real': {
              const { pis = 0, cofins = 0, irpj = 0, csll = 0, icms = 0 } = activeRegime.rates;
              const tempImpostos = totalReceita * ((pis / 100) + (cofins / 100) + (icms/100));
              const comissaoValor = (totalReceita - tempImpostos) * (outrosCustos.comissaoVenda / 100);
              const lucroOp = totalReceita - tempImpostos - totalCusto - comissaoValor;
              impostos = tempImpostos + (lucroOp > 0 ? lucroOp * ((irpj / 100) + (csll / 100)) : 0);
              break;
            }
            case 'simples': {
              const { anexoI = 0 } = activeRegime.rates;
              impostos = totalReceita * (anexoI / 100);
              break;
            }
            case 'mei': impostos = 0; break;
        }

        const receitaLiquida = totalReceita - impostos;
        const comissaoValor = receitaLiquida * (outrosCustos.comissaoVenda / 100);
        
        const despesasFixasPercent = 0; // Venda não tem despesas fixas/admin
        const despesasVariaveisPercent = totalReceita > 0 ? (comissaoValor / totalReceita) * 100 : 0;
        
        const markup = totalCusto > 0 ? totalReceita / totalCusto : 0;

        return {
            precoCusto: totalCusto,
            despesasFixas: despesasFixasPercent,
            despesasVariaveis: despesasVariaveisPercent,
            margemLucro: desiredMarginVenda,
            markup: markup,
            precoVenda: totalReceita,
        };
    }, [quoteItems, outrosCustos, desiredMarginVenda, activeRegime]);

  if (quoteItems.length === 0) {
    return (
      <Card className="text-center p-10 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Análise DRE</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mt-2 text-muted-foreground">Adicione itens ao orçamento para gerar a análise.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl"><BarChart2 />Análise DRE do Orçamento</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {dreData.venda && <DREColumn title="DRE Venda" data={dreData.venda} />}
                    {dreData.locacao && <DREColumn title="DRE Locação (Total Contrato)" data={dreData.locacao} />}
                    {dreData.servicos && <DREColumn title="DRE Serviços" data={dreData.servicos} />}
                </div>
                {!dreData.venda && !dreData.locacao && !dreData.servicos && (
                    <p className="text-muted-foreground text-center py-8">Não há itens no orçamento para os tipos de operação.</p>
                )}
            </CardContent>
        </Card>
        {markupData && <MarkupAnalysis data={markupData} />}
    </div>
  );
};

export default DREAnalysis;

import { useMemo } from 'react';
import type { OperationType, Regime, OutrosCustos, LaborCost, SaleItem, RentalItem, ServiceItem } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/formatters';

interface UsePricingCalculatorProps {
  operationType: OperationType;
  activeRegimeId: string;
  regimes: Regime[];
  outrosCustos: OutrosCustos;
  laborCostConfig: LaborCost;
  icmsInterstate: Record<string, number>;
  saleItems: SaleItem[];
  rentalItems: RentalItem[];
  serviceItems: ServiceItem[];
  rentalPeriod: number;
  desiredMarginVenda: number;
  desiredMarginLocacao: number;
  desiredMarginServicos: number;
  isIcmsContributor: boolean;
  destinationUF: string;
}

export const usePricingCalculator = (props: UsePricingCalculatorProps) => {
  const {
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
  } = props;

  const calculateHourlyCost = (baseSalary: number, contractType: 'clt' | 'terceiro') => {
    if (!laborCostConfig) return 0;
    const { clt, geral } = laborCostConfig;
    const totalHorasMes = (geral.diasUteis || 1) * (geral.horasDia || 1);
    if (totalHorasMes === 0) return 0;
    if (contractType === 'clt' && clt) {
      const totalEncargosPercent = Object.values(clt.encargos).reduce((s, v) => s + v, 0) / 100;
      const custoMensalEncargos = baseSalary * totalEncargosPercent;
      const totalBeneficios = Object.values(clt.beneficios).reduce((s, v) => s + v, 0);
      const custoTotalMensal = baseSalary + custoMensalEncargos + totalBeneficios;
      return custoTotalMensal / totalHorasMes;
    }
    return baseSalary / totalHorasMes;
  };

  const { calculationResults, operationAnalysis } = useMemo(() => {
    const activeRegime = regimes.find(r => r.id === activeRegimeId);
    if (!activeRegime) {
      return {
        calculationResults: { finalPrice: 0, monthlyPrice: 0, taxRegimeName: 'Nenhum regime selecionado', divisor: null, itemCalculations: {}, impostosValor: 0, margemEComissaoValor: 0, baseCost: 0, accountingCost: 0 },
        operationAnalysis: [],
      };
    }
    
    const pmt = (rate: number, nper: number, pv: number): number => {
        if (nper <= 0 || rate < 0) return 0;
        if (rate === 0) return pv / nper;
        const pvif = Math.pow(1 + rate, nper);
        return (rate * pv * pvif) / (pvif - 1);
    };

    const { comissaoVenda, comissaoLocacao, comissaoServico, margemLucroServico, despesasAdmin, outrasDespesas, custoFinanceiroMensal: cfgCustoFinanceiro, taxaDescontoVPL = 0 } = outrosCustos;
    const itemCalculations: Record<string, any> = {};

    let finalPrice = 0;
    let baseCost = 0;
    let accountingCost = 0;
    let totalImpostos = 0;
    let margemEComissaoValor = 0;
    
    let configuredCommissionRate = 0;
    let configuredMarginRate = 0;
    switch (operationType) {
      case 'venda': 
        configuredCommissionRate = comissaoVenda / 100;
        configuredMarginRate = desiredMarginVenda / 100;
        break;
      case 'locacao': 
        configuredCommissionRate = comissaoLocacao / 100;
        configuredMarginRate = desiredMarginLocacao / 100;
        break;
      case 'servicos': 
        configuredCommissionRate = comissaoServico / 100;
        configuredMarginRate = desiredMarginServicos / 100;
    }
    
    const despesasRate = (despesasAdmin / 100) + (outrasDespesas / 100);


    if (operationType === 'locacao') {
        let custoTotalAtivo = 0;
        rentalItems.forEach(item => {
            const qty = item.quantity || 1;
            if (qty === 0) {
                itemCalculations[item.id] = { monthlyCost: 0, monthlyCostTotal: 0, totalAssetCost: 0, totalBRL: 0, difal: 0, rbUnitario: 0, rbTotal: 0, marginComissaoValor: 0, impostosValor: 0 };
                return;
            };
            const valorTotalLinha = (item.assetValueBRL || 0);
            
            let icmsCompraValor = (item.icmsCompra || 0);
            
            const baseDifal = valorTotalLinha;
            const icmsPrRate = (item.icmsPr || 0) / 100;
            const difalDenominator = 1 - icmsPrRate;
            let difalCalculado = 0;

            if (difalDenominator > 0 && icmsPrRate > 0) {
                const baseCalculo = (baseDifal - icmsCompraValor) / difalDenominator;
                difalCalculado = (baseCalculo * icmsPrRate) - icmsCompraValor;
            }

            const custoAtivoItem = (valorTotalLinha + (difalCalculado > 0 ? difalCalculado : 0) + (item.frete || 0)) * qty;
            
            itemCalculations[item.id] = { 
                totalAssetCost: custoAtivoItem, 
                totalBRL: valorTotalLinha * qty,
                difal: difalCalculado > 0 ? difalCalculado * qty : 0,
            };
            custoTotalAtivo += custoAtivoItem;
        });
        
        if (rentalPeriod <= 0 || custoTotalAtivo <= 0) {
            return {
                calculationResults: { finalPrice: 0, monthlyPrice: 0, taxRegimeName: activeRegime.name, divisor: null, itemCalculations, impostosValor: 0, margemEComissaoValor: 0, baseCost: 0, accountingCost: 0 },
                operationAnalysis: [],
            };
        }

        const custoFinanceiroRate = cfgCustoFinanceiro / 100;
        baseCost = pmt(custoFinanceiroRate, rentalPeriod, custoTotalAtivo);
        
        let totalMonthlyGrossRevenue = 0;
        
        rentalItems.forEach(item => {
            const qty = item.quantity || 1;
            if (qty === 0) return;

            const itemInvestment = itemCalculations[item.id]?.totalAssetCost || 0;
            const itemProportionOfCost = custoTotalAtivo > 0 ? itemInvestment / custoTotalAtivo : 0;
            
            const lineMonthlyCost = baseCost * itemProportionOfCost;
            
            const marginAndCommissionDenominator = 1 - (configuredMarginRate + configuredCommissionRate);
            const lineMarginAndCommissionValue = marginAndCommissionDenominator > 0 ? (lineMonthlyCost / marginAndCommissionDenominator) * (configuredMarginRate + configuredCommissionRate) : 0;
            
            const revenueBeforeTaxes = lineMonthlyCost + lineMarginAndCommissionValue;

            let lineTaxRate = 0;
            const { pis = 0, cofins = 0 } = activeRegime.rates;
            
            if (activeRegime.type === 'presumido' || activeRegime.type === 'real') {
                lineTaxRate = (pis / 100) + (cofins / 100);
            } else if (activeRegime.type === 'simples') {
                const { anexoIII = 0 } = activeRegime.rates;
                lineTaxRate = anexoIII / 100;
            }
            
            const taxDenominator = 1 - lineTaxRate;
            const lineGrossRevenue = taxDenominator > 0 ? revenueBeforeTaxes / taxDenominator : revenueBeforeTaxes;
            
            const lineImpostos = lineGrossRevenue * lineTaxRate;
            
            const rbUnitario = qty > 0 ? lineGrossRevenue / qty : 0;
            const rbTotal = lineGrossRevenue * rentalPeriod;
            
            itemCalculations[item.id] = {
                ...itemCalculations[item.id],
                monthlyCost: lineMonthlyCost / qty,
                monthlyCostTotal: lineMonthlyCost,
                marginComissaoValor: lineMarginAndCommissionValue,
                impostosValor: lineImpostos,
                rbUnitario,
                rbTotal,
            };

            totalMonthlyGrossRevenue += lineGrossRevenue;
            totalImpostos += lineImpostos;
            margemEComissaoValor += lineMarginAndCommissionValue;
        });

        finalPrice = totalMonthlyGrossRevenue;

    } else if (operationType === 'venda') {
      saleItems.forEach(item => {
        const qty = item.quantity || 1;
        if(qty === 0) {
            itemCalculations[item.id] = { baseCost: 0, icmsVendaCalculated: 0, rbUnitario: 0, impostosValor: 0, marginComissaoValor: 0, difalVenda: 0 };
            return;
        }
        
        const unitCost = item.unitCost || 0;
        const creditoIcmsCompra = item.creditoIcmsCompra || 0;
        
        const netProductCost = unitCost - creditoIcmsCompra;
        
        const { pis = 0, cofins = 0, irpj = 0, csll = 0, presuncaoVenda = 0, icms = 0 } = activeRegime.rates;
        let icmsVendaRate = (icmsInterstate[destinationUF] || icms) / 100;
        
        const pisRate = pis / 100;
        const cofinsRate = cofins / 100;

        let difalRate = 0;
        if (isIcmsContributor) {
            const icmsDestinoLocalRate = (item.icmsDestLocal || 0) / 100;
            if (icmsDestinoLocalRate > icmsVendaRate) {
                difalRate = icmsDestinoLocalRate - icmsVendaRate;
            }
        }
        
        if (item.icmsST) {
          icmsVendaRate = 0;
          difalRate = 0;
        }
        
        let grossRevenue = 0;
        let impostosNaVenda = 0;
        let comissaoValor = 0;
        let margemValor = 0;

        if (activeRegime.type === 'presumido' || activeRegime.type === 'real') {
            const netRevenueBeforeTaxes = netProductCost / (1 - configuredCommissionRate - configuredMarginRate);
            const taxDenominator = 1 - pisRate - cofinsRate - icmsVendaRate - difalRate;
            grossRevenue = taxDenominator > 0 ? netRevenueBeforeTaxes / taxDenominator : 0;
            
            const difalVendaValue = grossRevenue * difalRate;
            const pisValue = grossRevenue * pisRate;
            const cofinsValue = grossRevenue * cofinsRate;
            const icmsVendaValue = grossRevenue * icmsVendaRate;
            impostosNaVenda = pisValue + cofinsValue + icmsVendaValue + difalVendaValue;

            comissaoValor = (grossRevenue - impostosNaVenda) * configuredCommissionRate;
            margemValor = grossRevenue - impostosNaVenda - comissaoValor - netProductCost;

        } else if (activeRegime.type === 'simples') {
            const { anexoI = 0 } = activeRegime.rates;
            const simplesRate = anexoI / 100;
            const totalRate = configuredCommissionRate + configuredMarginRate + simplesRate;
            const denominator = 1 - totalRate;
            grossRevenue = denominator > 0 ? netProductCost / denominator : 0;
            impostosNaVenda = grossRevenue * simplesRate;
            comissaoValor = grossRevenue * configuredCommissionRate;
            margemValor = grossRevenue * configuredMarginRate;
        }

        itemCalculations[item.id] = { 
            baseCost: unitCost, 
            icmsVendaCalculated: icmsVendaRate * 100,
            rbUnitario: grossRevenue,
            impostosValor: impostosNaVenda,
            marginComissaoValor: margemValor + comissaoValor,
            difalVenda: grossRevenue * difalRate,
        };

        finalPrice += grossRevenue * qty;

        baseCost += unitCost * qty;
        accountingCost += netProductCost * qty;
        totalImpostos += impostosNaVenda * qty;
        margemEComissaoValor += (margemValor + comissaoValor) * qty;
      });

    } else if (operationType === 'servicos') {
      serviceItems.forEach(item => {
        const hourlyCost = calculateHourlyCost(item.baseSalary || 0, item.contractType);
        const cost = (item.estimatedHours || 0) * hourlyCost;
        baseCost += cost;
        itemCalculations[item.id] = { hourlyCost, totalCost: cost };
      });    accountingCost = baseCost;
      accountingCost = accountingCost; // accountingCost already sums up costs in the loop
      
      let impostosRate = 0;
      let profitTaxRate = 0;

      switch (activeRegime.type) {
        case 'presumido': {
          const { pis = 0, cofins = 0, irpj = 0, csll = 0, presuncaoServico = 0, iss = 0 } = activeRegime.rates;
          const presumption = presuncaoServico / 100;
          impostosRate = (pis / 100) + (cofins / 100) + (iss / 100);
          profitTaxRate = (presumption * (irpj / 100)) + (presumption * (csll / 100));
          break;
        }
        case 'real': {
          const { pis = 0, cofins = 0, irpj = 0, csll = 0, iss = 0 } = activeRegime.rates;
          impostosRate = (pis / 100) + (cofins / 100) + (iss / 100);
          profitTaxRate = (irpj / 100) + (csll / 100);
          break;
        }
        case 'simples': {
          const { anexoIII = 0 } = activeRegime.rates;
          impostosRate = anexoIII / 100;
          break;
        }
      }
      
      const otherCostsAndMarginRate = configuredCommissionRate + despesasRate + configuredMarginRate;

      if (activeRegime.type === 'real') {
        const initialDenominator = 1 - impostosRate;
        const initialGrossRevenue = initialDenominator > 0 ? accountingCost / (initialDenominator - configuredCommissionRate - despesasRate - configuredMarginRate) : 0;
        const profit = initialGrossRevenue - (initialGrossRevenue * impostosRate) - accountingCost - (initialGrossRevenue * (configuredCommissionRate + despesasRate + configuredMarginRate));
        const profitTaxValue = profit > 0 ? profit * profitTaxRate : 0;
        finalPrice = initialGrossRevenue + profitTaxValue;

      } else {
        const denominator = 1 - impostosRate - otherCostsAndMarginRate - profitTaxRate;
        finalPrice = denominator > 0 ? baseCost / denominator : 0;
      }
      
      totalImpostos = finalPrice * impostosRate;
       if (activeRegime.type === 'presumido') {
         totalImpostos += finalPrice * profitTaxRate;
      } else if (activeRegime.type === 'real') {
         const profit = finalPrice - totalImpostos - baseCost - (finalPrice * (configuredCommissionRate + despesasRate + configuredMarginRate));
         if (profit > 0) {
 totalImpostos += profit * profitTaxRate;
         }
      }
      margemEComissaoValor = finalPrice - totalImpostos - accountingCost - (finalPrice * (despesasRate));

      const markupRatio = baseCost > 0 ? finalPrice / baseCost : 0;
      serviceItems.forEach(item => {
        if (itemCalculations[item.id]) {
            const hourlyCost = itemCalculations[item.id]?.hourlyCost || 0;
            const sellPricePerHour = hourlyCost * markupRatio;
            itemCalculations[item.id].sellPricePerHour = sellPricePerHour;
            itemCalculations[item.id].totalSellPrice = sellPricePerHour * (item.estimatedHours || 0);
        }
      });
    }

    let analysisData: any[] = [];
    
    if (operationType === 'venda' && finalPrice > 0) {
      let irpjValor = 0;
      let csllValor = 0;
      let pisValor = 0;
      let cofinsValor = 0;
      let icmsValor = 0;
      let difalValor = 0;

      const { pis = 0, cofins = 0, irpj = 0, csll = 0, presuncaoVenda = 0, icms = 0, anexoI = 0 } = activeRegime.rates;
      const icmsAliquotaInterestadual = (icmsInterstate[destinationUF] || 0) / 100;
      
      let totalTaxExpense = 0;
      let comissaoValor = 0;
      let lucroOp = 0;
      let lucroLiquido = 0;
      let receitaLiquida = 0;
      
      switch (activeRegime.type) {
        case 'presumido':
            pisValor = finalPrice * (pis / 100);
            cofinsValor = finalPrice * (cofins / 100);
            icmsValor = finalPrice * icmsAliquotaInterestadual;
            if (isIcmsContributor) {
                const icmsDestinoLocalRate = (saleItems.reduce((acc, i) => acc + i.icmsDestLocal, 0) / saleItems.length) / 100;
                if (icmsDestinoLocalRate > icmsAliquotaInterestadual) {
                  difalValor = finalPrice * (icmsDestinoLocalRate - icmsAliquotaInterestadual);
                }
            }
            if(saleItems.some(i => i.icmsST)){
                icmsValor = 0;
                difalValor = 0;
            }
            totalTaxExpense = pisValor + cofinsValor + icmsValor + difalValor;
            receitaLiquida = finalPrice - totalTaxExpense;
            comissaoValor = receitaLiquida * configuredCommissionRate;
            lucroOp = receitaLiquida - accountingCost - comissaoValor;
            irpjValor = (finalPrice * (presuncaoVenda / 100)) * (irpj / 100);
            csllValor = (finalPrice * (presuncaoVenda / 100)) * (csll / 100);
            lucroLiquido = lucroOp - irpjValor - csllValor;
            break;
        case 'real':
            pisValor = finalPrice * (pis / 100);
            cofinsValor = finalPrice * (cofins / 100);
            icmsValor = finalPrice * icmsAliquotaInterestadual;
            totalTaxExpense = pisValor + cofinsValor + icmsValor;
            receitaLiquida = finalPrice - totalTaxExpense;
            comissaoValor = receitaLiquida * configuredCommissionRate;
            lucroOp = receitaLiquida - accountingCost - comissaoValor;
            irpjValor = lucroOp > 0 ? lucroOp * (irpj / 100) : 0;
            csllValor = lucroOp > 0 ? lucroOp * (csll / 100) : 0;
            lucroLiquido = lucroOp - irpjValor - csllValor;
            break;
        case 'simples':
            totalTaxExpense = finalPrice * (anexoI / 100);
            receitaLiquida = finalPrice - totalTaxExpense;
            comissaoValor = receitaLiquida * configuredCommissionRate;
            lucroOp = receitaLiquida - accountingCost - comissaoValor;
            lucroLiquido = lucroOp;
            break;
      }
      
      const markup = accountingCost > 0 ? finalPrice / accountingCost : 0;

      const analysisVenda = [
        { label: "Preço de Custo:", value: accountingCost, formatter: formatCurrency },
        { label: "Despesas fixas:", value: 0, formatter: formatPercent },
        { label: "Despesas variáveis:", value: finalPrice > 0 ? (comissaoValor/finalPrice) * 100 : 0, formatter: formatPercent },
        { label: "Margem de lucro:", value: desiredMarginVenda, formatter: formatPercent },
        { label: "Markup:", value: markup, isHighlighted: true, isLabelBold: true, formatter: (val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
        { label: "Preço de venda:", value: finalPrice, isHighlighted: true, formatter: formatCurrency },
      ];
      analysisData.push({ title: "Análise de Venda", data: analysisVenda });

      const margensData: any[] = [
          { label: "Receita Bruta", value: finalPrice, percent: 100, formatter: formatCurrency },
          { label: "(-) Impostos", value: -totalTaxExpense, percent: finalPrice > 0 ? (-totalTaxExpense/finalPrice)*100 : 0, formatter: formatCurrency },
          { label: "= Receita Líquida", value: receitaLiquida, percent: finalPrice > 0 ? (receitaLiquida/finalPrice)*100 : 0, isTotal: true, formatter: formatCurrency },
          { label: "(-) Custo (CMV)", value: -accountingCost, percent: finalPrice > 0 ? (-accountingCost/finalPrice)*100 : 0, formatter: formatCurrency },
          { label: "(-) Comissão", value: -comissaoValor, percent: finalPrice > 0 ? (-comissaoValor/finalPrice)*100 : 0, formatter: formatCurrency },
          { label: "= Lucro Operacional", value: lucroOp, percent: finalPrice > 0 ? (lucroOp/finalPrice)*100 : 0, isTotal: true, formatter: formatCurrency },
          { label: "(-) IRPJ/CSLL", value: -(irpjValor+csllValor), percent: finalPrice > 0 ? (-(irpjValor+csllValor)/finalPrice)*100 : 0, formatter: formatCurrency, hideValue: activeRegime.type !== 'presumido' && activeRegime.type !== 'real' },
          { label: "= Lucro Líquido", value: lucroLiquido, percent: finalPrice > 0 ? (lucroLiquido/finalPrice)*100 : 0, isTotal: true, isFinal: true, formatter: formatCurrency },
      ].filter(item => !item.hideValue);
      analysisData.push({ title: "Análise de Margens", headers: { value: 'VALORES', percent: '%' }, data: margensData });

      const percLucroRL = receitaLiquida > 0 ? (lucroLiquido / receitaLiquida) * 100 : 0;
      analysisData.push({ title: "Indicadores", data: [
          { label: "% Lucro s/ Receita Líquida", value: percLucroRL, isFinal: true, formatter: formatPercent },
          { label: "Markup", value: markup, formatter: (val: number) => val.toFixed(4) },
      ]});

    } else if (operationType === 'locacao' && finalPrice > 0) {
        const custoTotalAtivo = rentalItems.reduce((sum, item) => sum + (itemCalculations[item.id]?.totalAssetCost || 0), 0);
        
        let monthlyPISCOFINS = 0;
        let pisCofinsRate = 0;
        const { pis = 0, cofins = 0, anexoIII = 0 } = activeRegime.rates;
        
        if (activeRegime.type === 'presumido' || activeRegime.type === 'real') {
            pisCofinsRate = (pis / 100) + (cofins / 100);
        } else if (activeRegime.type === 'simples') {
            pisCofinsRate = anexoIII / 100;
        }
        monthlyPISCOFINS = finalPrice * pisCofinsRate;
        
        const receitaLiquidaImpostos = finalPrice - monthlyPISCOFINS;
        const comissaoValor = finalPrice * configuredCommissionRate;
        const custoProdutoMensal = custoTotalAtivo > 0 && rentalPeriod > 0 ? custoTotalAtivo / rentalPeriod : 0;
        
        const custoFinanceiro = baseCost - custoProdutoMensal;

        const lucroLiquido = receitaLiquidaImpostos - custoProdutoMensal - comissaoValor - custoFinanceiro;
        const lucroLiquidoPercent = finalPrice > 0 ? (lucroLiquido / finalPrice) * 100 : 0;
        const lucroLiquidoSobreRL = receitaLiquidaImpostos > 0 ? (lucroLiquido / receitaLiquidaImpostos) * 100 : 0;
        
        const margensData = [
            { label: "Receita Bruta", value: finalPrice, percent: 100, formatter: formatCurrency },
            { label: "(-) Impostos (PIS/COFINS)", value: -monthlyPISCOFINS, percent: finalPrice > 0 ? (-monthlyPISCOFINS / finalPrice) * 100 : 0, formatter: formatCurrency },
            { label: "= Receita Líquida", value: receitaLiquidaImpostos, percent: finalPrice > 0 ? (receitaLiquidaImpostos / finalPrice) * 100 : 0, isTotal: true, formatter: formatCurrency },
            { label: "(-) custos produtos", value: -custoProdutoMensal, percent: finalPrice > 0 ? (-custoProdutoMensal / finalPrice) * 100 : 0, formatter: formatCurrency },
            { label: "(-) Comissão", value: -comissaoValor, percent: finalPrice > 0 ? (-comissaoValor / finalPrice) * 100 : 0, formatter: formatCurrency },
            { label: "(-) Custos Financeiros", value: -custoFinanceiro, percent: finalPrice > 0 ? (-custoFinanceiro / finalPrice) * 100 : 0, formatter: formatCurrency },
            { label: "= Lucro Líquido", value: lucroLiquido, percent: lucroLiquidoPercent, isTotal: true, isFinal: true, formatter: formatCurrency },
            { label: "% Lucro S/ RL", value: lucroLiquidoSobreRL, formatter: formatPercent, hideValue:true },
            { label: "Margem de Lucro Total", value: lucroLiquidoPercent, isFinal: true, formatter: formatPercent, hideValue: true },
        ];
        
        analysisData.push({
            title: "Análise de Margens",
            headers: { value: 'VALORES', percent: '%' },
            data: margensData
        });

        const paybackReceitaBruta = finalPrice;
        const paybackComissao = paybackReceitaBruta * configuredCommissionRate;
        const paybackCustosFinanceiros = custoFinanceiro;
        const paybackReceitaLiquida = paybackReceitaBruta - paybackComissao - paybackCustosFinanceiros;
        
        analysisData.push({
            title: "PAYBACK",
            headers: { value: 'VALORES' },
            data: [
                { label: "Receita", value: paybackReceitaBruta, formatter: formatCurrency },
                { label: "(-) Comissões", value: -paybackComissao, formatter: formatCurrency },
                { label: "(-) Custos Financeiros", value: -paybackCustosFinanceiros, formatter: formatCurrency },
                { label: "= Receita p/ Payback", value: paybackReceitaLiquida, isTotal: true, isFinal:true, formatter: formatCurrency },
                { label: "CUSTOS TOTAL", value: custoTotalAtivo, isTotal: true, formatter: formatCurrency },
                { label: "PAYBACK (Meses)", value: paybackReceitaLiquida > 0 ? custoTotalAtivo / paybackReceitaLiquida : Infinity, isTotal: true, isFinal:true, formatter: (val: number) => isFinite(val) ? val.toFixed(2) : 'N/A' },
            ]
        });
        
        // VPL Analysis
        const vplDiscountRate = taxaDescontoVPL / 100;
        const monthlyVplCashFlow = paybackReceitaLiquida;
        
        let totalPvOfCashFlows = 0;
        const MAX_VPL_YEARS = 5;
        const vplData = [];

        for (let y = 1; y <= MAX_VPL_YEARS; y++) {
            let cashFlowForYear = 0;
            const startMonth = (y - 1) * 12 + 1;
            const endMonth = y * 12;

            if (rentalPeriod >= startMonth) {
                const monthsInThisYear = Math.min(rentalPeriod, endMonth) - startMonth + 1;
                cashFlowForYear = monthlyVplCashFlow * monthsInThisYear;
            }
            
            const pvForYear = vplDiscountRate > 0 ? cashFlowForYear / Math.pow(1 + vplDiscountRate, y) : cashFlowForYear;
            
            vplData.push({
                label: `Recebido Ano ${y}`,
                value: pvForYear,
                formatter: (v: number) => (v === 0 ? '-' : formatCurrency(v))
            });
            totalPvOfCashFlows += pvForYear;
        }
        
        const vplValue = totalPvOfCashFlows - custoTotalAtivo;
        const vplPercent = custoTotalAtivo > 0 ? (vplValue / custoTotalAtivo) * 100 : 0;
        
        analysisData.push({
            title: "VPL - VALOR PRESENTE LÍQUIDO",
            headers: { value: 'VALORES' },
            data: [
                 { label: "CUSTOS TOTAL", value: custoTotalAtivo, formatter: formatCurrency, isHeader: true },
                 { label: "Taxa Desconto", value: vplDiscountRate * 100, formatter: formatPercent, isHeader: true },
                 ...vplData,
                { label: "VPL", value: vplValue, isTotal: true, isFinal: true, formatter: formatCurrency },
                { label: "VPL %", value: vplPercent, isTotal: true, isFinal: true, formatter: (v) => formatPercent(v) },
            ]
        });
    }
    
    return {
      calculationResults: { 
          finalPrice: operationType === 'locacao' ? finalPrice * rentalPeriod : finalPrice, 
 monthlyPrice: operationType === 'locacao' ? finalPrice : 0,
          divisor: null, 
          taxRegimeName: activeRegime.name, 
          itemCalculations, 
          impostosValor: totalImpostos, 
          margemEComissaoValor, 
          baseCost: baseCost,
          accountingCost: accountingCost
      },
      operationAnalysis: analysisData,
    };
  }, [
    operationType, activeRegimeId, regimes, outrosCustos, laborCostConfig, icmsInterstate, 
    saleItems, rentalItems, serviceItems, rentalPeriod, desiredMarginVenda, desiredMarginLocacao, desiredMarginServicos,
    isIcmsContributor, destinationUF
  ]);

  return { calculationResults, operationAnalysis, calculateHourlyCost };
};

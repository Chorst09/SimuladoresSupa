import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PABXResult {
  setup: number;
  baseMonthly: number;
  deviceRentalCost: number;
  aiAgentCost: number;
  totalMonthly: number;
}

interface SIPResult {
  setup: number;
  monthly: number;
}

export interface DRETableProps {
  monthlyRevenue: number;
  totalCosts: number;
  commissionVendedor: number;
  commissionDiretor: number;
  commissionParceiro: number;
  pabxResult: PABXResult | null;
  sipResult: SIPResult | null;
  contractDuration: number;
  hasPartners?: boolean;
}

export const DRETable: React.FC<DRETableProps> = ({
  monthlyRevenue: propMonthlyRevenue,
  totalCosts: propTotalCosts,
  commissionVendedor,
  commissionDiretor,
  commissionParceiro,
  pabxResult,
  sipResult,
  contractDuration,
  hasPartners = false
}) => {

  // Calculate actual monthly revenue from PABX and SIP results
  const calculateMonthlyRevenue = () => {
    let revenue = 0;

    // Add PABX monthly revenue if available
    if (pabxResult) {
      revenue += pabxResult.totalMonthly || 0;
    }

    // Add SIP monthly revenue if available
    if (sipResult) {
      revenue += sipResult.monthly || 0;
    }

    return revenue > 0 ? revenue : propMonthlyRevenue;
  };

  // Calculate total costs (operational costs based on industry standards)
  const calculateTotalCosts = () => {
    // If we have actual cost data from products, use it
    if (pabxResult || sipResult) {
      let actualCosts = 0;

      // PABX costs: estimated at 50% of revenue for infrastructure and licensing
      if (pabxResult) {
        actualCosts += (pabxResult.totalMonthly || 0) * 0.50;
      }

      // SIP costs: estimated at 70% of revenue for telecom services
      if (sipResult) {
        actualCosts += (sipResult.monthly || 0) * 0.70;
      }

      return actualCosts;
    }

    // Fallback to provided costs or estimate based on revenue
    return propTotalCosts > 0 ? propTotalCosts : monthlyRevenue * 0.60;
  };

  // Calculate values
  const monthlyRevenue = calculateMonthlyRevenue();
  const totalCosts = calculateTotalCosts();
  // Calculate fixed costs based on contract duration (amortized setup costs)
  const calculateFixedCosts = () => {
    if (!pabxResult && !sipResult) return 0;

    let totalSetup = 0;

    if (pabxResult) {
      totalSetup += pabxResult.setup;
    }

    if (sipResult) {
      totalSetup += sipResult.setup || 0;
    }

    // Amortize setup costs over the contract duration (in months)
    return totalSetup / (contractDuration || 24);
  };

  // Tax rates
  const impostosReceita = {
    pis: 15.00,
    outros: 0
  };

  const impostosLucro = {};

  // Calculate taxes on revenue
  const totalImpostosReceita = Object.values(impostosReceita).reduce((sum, rate) => sum + rate, 0);
  const valorImpostosReceita = (monthlyRevenue * totalImpostosReceita) / 100;

  // Calculate net revenue (after taxes on revenue)
  const receitaLiquida = monthlyRevenue - valorImpostosReceita;
  const receitaLiquidaPercentual = monthlyRevenue > 0 ? (receitaLiquida / monthlyRevenue) * 100 : 0;

  // Calculate commission amounts based on gross revenue (receita bruta)
  const comissaoVendedor = monthlyRevenue * (commissionVendedor / 100);
  const comissaoDiretor = monthlyRevenue * (commissionDiretor / 100);
  const comissaoParceiro = monthlyRevenue * (commissionParceiro / 100);

  // Calculate gross profit (after operational costs)
  const lucroBruto = receitaLiquida - totalCosts;
  const lucroBrutoPercentual = monthlyRevenue > 0 ? (lucroBruto / monthlyRevenue) * 100 : 0;

  // Calculate profit after commissions
  const lucroAposComissoes = lucroBruto - comissaoVendedor - comissaoDiretor - comissaoParceiro;
  const lucroAposComissoesPercentual = monthlyRevenue > 0 ? (lucroAposComissoes / monthlyRevenue) * 100 : 0;

  // Calculate fixed costs (amortized setup costs)
  const despesasFixas = calculateFixedCosts();

  // Calculate profit before taxes on profit
  const lucroAntesImpostos = lucroAposComissoes - despesasFixas;
  const lucroAntesImpostosPercentual = monthlyRevenue > 0 ? (lucroAntesImpostos / monthlyRevenue) * 100 : 0;

  // Calculate taxes on profit (only if there's profit)
  const totalImpostosLucro = Object.values(impostosLucro).reduce((sum, rate) => sum + rate, 0);
  const valorImpostosLucro = lucroAntesImpostos > 0 ? (lucroAntesImpostos * totalImpostosLucro) / 100 : 0;

  // Calculate net profit
  const lucroLiquido = lucroAntesImpostos - valorImpostosLucro;
  const lucroLiquidoPercentual = monthlyRevenue > 0 ? (lucroLiquido / monthlyRevenue) * 100 : 0;

  // Debug log
  console.log('DRETable - Lucro Líquido:', lucroLiquido, 'Percentual:', lucroLiquidoPercentual);

  // Format number as Brazilian currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format number as percentage
  const formatPercent = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '%';
  };

  return (
    <div className="space-y-6">
      {/* Main DRE Table */}
      <Card className="border-slate-700">
        <CardHeader className="bg-slate-800 py-3">
          <CardTitle className="text-lg font-medium">Demonstrativo de Resultado do Exercício (DRE)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-700">
                <TableHead className="text-white w-2/3">Descrição</TableHead>
                <TableHead className="text-white text-right">Valor (R$)</TableHead>
                <TableHead className="text-white text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Receita Bruta */}
              <TableRow className="bg-blue-900/20">
                <TableCell className="font-medium">Receita Bruta</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(monthlyRevenue)}
                </TableCell>
                <TableCell className="text-right font-medium">100,00%</TableCell>
              </TableRow>

              {/* Impostos sobre Receita */}
              <TableRow className="bg-red-900/20">
                <TableCell className="font-medium">(-) Impostos sobre Receita</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(valorImpostosReceita)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatPercent(totalImpostosReceita)}
                </TableCell>
              </TableRow>



              {/* Receita Líquida */}
              <TableRow className="bg-green-900/20">
                <TableCell className="font-medium">(=) Receita Líquida</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(receitaLiquida)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatPercent(receitaLiquidaPercentual)}
                </TableCell>
              </TableRow>

              {/* Custos Operacionais */}
              <TableRow className="bg-slate-800/50">
                <TableCell className="font-medium">(-) Custos Operacionais</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totalCosts)}
                </TableCell>
                <TableCell className="text-right">
                  {monthlyRevenue > 0 ? formatPercent((totalCosts / monthlyRevenue) * 100) : '0,00%'}
                </TableCell>
              </TableRow>

              {/* Detalhamento dos Custos Operacionais */}
              {(pabxResult || sipResult) && (
                <>
                  {pabxResult && (
                    <TableRow className="bg-slate-800/30">
                      <TableCell className="pl-8">Custos PABX (Infraestrutura e Licenças)</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency((pabxResult.totalMonthly || 0) * 0.50)}
                      </TableCell>
                      <TableCell className="text-right"></TableCell>
                    </TableRow>
                  )}
                  {sipResult && (
                    <TableRow className="bg-slate-800/30">
                      <TableCell className="pl-8">Custos SIP (Serviços de Telecomunicações)</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency((sipResult.monthly || 0) * 0.70)}
                      </TableCell>
                      <TableCell className="text-right"></TableCell>
                    </TableRow>
                  )}
                </>
              )}

              {/* Lucro Bruto */}
              <TableRow className="bg-green-900/20">
                <TableCell className="font-medium">(=) Lucro Bruto</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(lucroBruto)}</TableCell>
                <TableCell className="text-right font-medium">{formatPercent(lucroBrutoPercentual)}</TableCell>
              </TableRow>

              {/* Comissões */}
              <TableRow className="bg-slate-800/30">
                <TableCell className="font-medium">(-) Comissões</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(comissaoVendedor + comissaoDiretor + comissaoParceiro)}
                </TableCell>
                <TableCell className="text-right">
                  {monthlyRevenue > 0 ? formatPercent(((comissaoVendedor + comissaoDiretor + comissaoParceiro) / monthlyRevenue) * 100) : '0,00%'}
                </TableCell>
              </TableRow>

              {comissaoVendedor > 0 && (
                <TableRow className="bg-slate-800/30">
                  <TableCell className="pl-8">
                    {hasPartners ? 'Comissão Canal/Vendedor' : 'Comissão Vendedor'} ({formatPercent(commissionVendedor)})
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(comissaoVendedor)}
                  </TableCell>
                  <TableCell className="text-right"></TableCell>
                </TableRow>
              )}

              {comissaoDiretor > 0 && (
                <TableRow className="bg-slate-800/30">
                  <TableCell className="pl-8">Comissão Diretor ({formatPercent(commissionDiretor)})</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(comissaoDiretor)}
                  </TableCell>
                  <TableCell className="text-right"></TableCell>
                </TableRow>
              )}

              {comissaoParceiro > 0 && (
                <TableRow className="bg-slate-800/30">
                  <TableCell className="pl-8">Comissão Parceiro ({formatPercent(commissionParceiro)})</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(comissaoParceiro)}
                  </TableCell>
                  <TableCell className="text-right"></TableCell>
                </TableRow>
              )}

              {/* Lucro após Comissões */}
              <TableRow className="bg-blue-900/20">
                <TableCell className="font-medium">(=) Lucro após Comissões</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(lucroAposComissoes)}</TableCell>
                <TableCell className="text-right font-medium">{formatPercent(lucroAposComissoesPercentual)}</TableCell>
              </TableRow>

              {/* Despesas Fixas */}
              <TableRow className="bg-slate-800/50">
                <TableCell className="pl-8">(-) Despesas Fixas (Setup / {contractDuration} meses)</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(despesasFixas)}
                </TableCell>
                <TableCell className="text-right">
                  {monthlyRevenue > 0 ? formatPercent((despesasFixas / monthlyRevenue) * 100) : '0,00%'}
                </TableCell>
              </TableRow>

              {/* Lucro antes dos Impostos sobre Lucro */}
              <TableRow className="bg-blue-900/20">
                <TableCell className="font-medium">(=) Lucro antes dos Impostos</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(lucroAntesImpostos)}</TableCell>
                <TableCell className="text-right font-medium">{formatPercent(lucroAntesImpostosPercentual)}</TableCell>
              </TableRow>

              {/* Impostos sobre Lucro */}
              {valorImpostosLucro > 0 && (
                <>
                  <TableRow className="bg-red-900/20">
                    <TableCell className="font-medium">(-) Impostos sobre Lucro</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(valorImpostosLucro)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatPercent(totalImpostosLucro)}
                    </TableCell>
                  </TableRow>


                </>
              )}

              {/* Lucro Líquido */}
              <TableRow className="bg-green-900/30">
                <TableCell className="font-bold text-lg">LUCRO LÍQUIDO</TableCell>
                <TableCell className={`text-right font-bold text-lg ${lucroLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(lucroLiquido)}
                </TableCell>
                <TableCell className={`text-right font-bold ${lucroLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(lucroLiquidoPercentual)}
                </TableCell>
              </TableRow>

              {/* Métricas Adicionais */}
              <TableRow className="bg-slate-800/50">
                <TableCell className="font-medium">Balance</TableCell>
                <TableCell className={`text-right font-medium ${lucroLiquido >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(lucroLiquido)}
                </TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>

              <TableRow className="bg-slate-800/50">
                <TableCell className="font-medium">Rentabilidade %</TableCell>
                <TableCell className={`text-right font-medium ${lucroLiquidoPercentual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(lucroLiquidoPercentual)}
                </TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>

              <TableRow className="bg-slate-800/50">
                <TableCell className="font-medium">Lucratividade</TableCell>
                <TableCell className={`text-right font-medium ${lucroLiquidoPercentual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(lucroLiquidoPercentual)}
                </TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* Precificação PABX/SIP */}
      <Card className="border-slate-700">
        <CardHeader className="bg-slate-800 py-3">
          <CardTitle className="text-lg font-medium">Precificação PABX/SIP</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-700">
                <TableHead className="text-white w-2/3">Descrição</TableHead>
                <TableHead className="text-white text-right">Valor (R$)</TableHead>
                <TableHead className="text-white text-right">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Custos Operacionais</TableCell>
                <TableCell className="text-right">{formatCurrency(totalCosts)}</TableCell>
                <TableCell className="text-right">
                  {monthlyRevenue > 0 ? formatPercent((totalCosts / monthlyRevenue) * 100) : '0,00%'}
                </TableCell>
              </TableRow>
              <TableRow className="bg-slate-800/50">
                <TableCell className="pl-8">(+) Comissões</TableCell>
                <TableCell className="text-right">{formatCurrency(comissaoVendedor + comissaoDiretor + comissaoParceiro)}</TableCell>
                <TableCell className="text-right">
                  {monthlyRevenue > 0 ? formatPercent(((comissaoVendedor + comissaoDiretor + comissaoParceiro) / monthlyRevenue) * 100) : '0,00%'}
                </TableCell>
              </TableRow>
              <TableRow className="bg-slate-800/30">
                <TableCell className="pl-8">(+) Despesas Fixas</TableCell>
                <TableCell className="text-right">{formatCurrency(despesasFixas)}</TableCell>
                <TableCell className="text-right">
                  {monthlyRevenue > 0 ? formatPercent((despesasFixas / monthlyRevenue) * 100) : '0,00%'}
                </TableCell>
              </TableRow>
              <TableRow className="bg-slate-800/30">
                <TableCell className="pl-8">(+) Impostos</TableCell>
                <TableCell className="text-right">{formatCurrency(valorImpostosReceita + valorImpostosLucro)}</TableCell>
                <TableCell className="text-right">
                  {monthlyRevenue > 0 ? formatPercent(((valorImpostosReceita + valorImpostosLucro) / monthlyRevenue) * 100) : '0,00%'}
                </TableCell>
              </TableRow>
              <TableRow className="bg-slate-800/30">
                <TableCell className="pl-8">(+) Margem de Lucro Desejada</TableCell>
                <TableCell className="text-right">{formatCurrency(lucroLiquido)}</TableCell>
                <TableCell className="text-right">{formatPercent(lucroLiquidoPercentual)}</TableCell>
              </TableRow>
              <TableRow className="bg-green-900/20 font-medium">
                <TableCell>Preço de Venda Sugerido</TableCell>
                <TableCell className="text-right">{formatCurrency(monthlyRevenue)}</TableCell>
                <TableCell className="text-right">100,00%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>





    </div>
  );
};

export default DRETable;

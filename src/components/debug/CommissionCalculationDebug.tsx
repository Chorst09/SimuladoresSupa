import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useCommissions, getChannelSellerCommissionRate, getSellerCommissionRate, getChannelInfluencerCommissionRate, getChannelIndicatorCommissionRate } from '@/hooks/use-commissions';

export default function CommissionCalculationDebug() {
  const [receita, setReceita] = useState(1000);
  const [prazo, setPrazo] = useState(36);
  const [includeIndicador, setIncludeIndicador] = useState(false);
  const [includeInfluenciador, setIncludeInfluenciador] = useState(false);
  
  const { 
    channelSeller, 
    seller, 
    channelInfluencer, 
    channelIndicator 
  } = useCommissions();

  const calcularComissoes = () => {
    const temParceiros = includeIndicador || includeInfluenciador;
    
    // Comissão do Vendedor/Canal
    const comissaoVendedorRate = temParceiros 
      ? getChannelSellerCommissionRate(channelSeller, prazo) // Canal/Vendedor quando há parceiros
      : getSellerCommissionRate(seller, prazo); // Vendedor quando não há parceiros
    
    const comissaoVendedorValor = receita * (comissaoVendedorRate / 100);
    
    // Comissão Parceiro Indicador
    const comissaoIndicadorRate = includeIndicador 
      ? getChannelIndicatorCommissionRate(channelIndicator, receita, prazo)
      : 0;
    const comissaoIndicadorValor = receita * (comissaoIndicadorRate / 100);
    
    // Comissão Parceiro Influenciador
    const comissaoInfluenciadorRate = includeInfluenciador 
      ? getChannelInfluencerCommissionRate(channelInfluencer, receita, prazo)
      : 0;
    const comissaoInfluenciadorValor = receita * (comissaoInfluenciadorRate / 100);
    
    return {
      temParceiros,
      comissaoVendedorRate,
      comissaoVendedorValor,
      comissaoIndicadorRate,
      comissaoIndicadorValor,
      comissaoInfluenciadorRate,
      comissaoInfluenciadorValor,
      totalComissoes: comissaoVendedorValor + comissaoIndicadorValor + comissaoInfluenciadorValor
    };
  };

  const resultado = calcularComissoes();

  return (
    <Card className="bg-slate-900/80 border-slate-800 text-white">
      <CardHeader>
        <CardTitle>Debug - Cálculo de Comissões</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Receita Mensal (R$)</label>
            <Input
              type="number"
              value={receita}
              onChange={(e) => setReceita(Number(e.target.value))}
              className="bg-slate-800 border-slate-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Prazo (meses)</label>
            <Input
              type="number"
              value={prazo}
              onChange={(e) => setPrazo(Number(e.target.value))}
              className="bg-slate-800 border-slate-700"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Parceiros</label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="indicador"
                checked={includeIndicador}
                onCheckedChange={setIncludeIndicador}
              />
              <label htmlFor="indicador" className="text-sm">Parceiro Indicador</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="influenciador"
                checked={includeInfluenciador}
                onCheckedChange={setIncludeInfluenciador}
              />
              <label htmlFor="influenciador" className="text-sm">Parceiro Influenciador</label>
            </div>
          </div>
        </div>

        {/* Resultado */}
        <div className="bg-slate-800/50 p-4 rounded">
          <h3 className="font-semibold mb-4">Resultado do Cálculo</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Tem Parceiros:</span>
              <span className={resultado.temParceiros ? 'text-green-400' : 'text-red-400'}>
                {resultado.temParceiros ? 'SIM' : 'NÃO'}
              </span>
            </div>
            
            <div className="border-t border-slate-700 pt-3">
              <div className="flex justify-between">
                <span>
                  {resultado.temParceiros ? 'Comissão Canal/Vendedor:' : 'Comissão Vendedor:'}
                </span>
                <span>
                  {resultado.comissaoVendedorRate.toFixed(2)}% = R$ {resultado.comissaoVendedorValor.toFixed(2)}
                </span>
              </div>
            </div>
            
            {includeIndicador && (
              <div className="flex justify-between text-blue-400">
                <span>Comissão Parceiro Indicador:</span>
                <span>
                  {resultado.comissaoIndicadorRate.toFixed(2)}% = R$ {resultado.comissaoIndicadorValor.toFixed(2)}
                </span>
              </div>
            )}
            
            {includeInfluenciador && (
              <div className="flex justify-between text-purple-400">
                <span>Comissão Parceiro Influenciador:</span>
                <span>
                  {resultado.comissaoInfluenciadorRate.toFixed(2)}% = R$ {resultado.comissaoInfluenciadorValor.toFixed(2)}
                </span>
              </div>
            )}
            
            <div className="border-t border-slate-700 pt-3">
              <div className="flex justify-between font-semibold">
                <span>Total Comissões:</span>
                <span>R$ {resultado.totalComissoes.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Explicação */}
        <div className="bg-blue-900/20 border border-blue-700 p-4 rounded">
          <h4 className="font-semibold mb-2">Lógica Aplicada:</h4>
          <ul className="text-sm space-y-1">
            <li>• <strong>SEM parceiros:</strong> Usa "Comissão Vendedor" (1.2%, 2.4%, 3.6%)</li>
            <li>• <strong>COM parceiros:</strong> Usa "Comissão Canal/Vendedor" (0.6%, 1.2%, 2.0%) + Comissões dos Parceiros</li>
            <li>• <strong>Parceiro Indicador:</strong> Baseado na receita mensal (6 faixas)</li>
            <li>• <strong>Parceiro Influenciador:</strong> Baseado na receita mensal (6 faixas)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
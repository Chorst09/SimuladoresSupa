
"use client";

import React, { useState } from 'react';
import { Lightbulb, FileText, CheckCircle, BarChart, FileBarChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { OperationType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PriceOptimizerModal from '@/components/ai/price-optimizer-modal';

interface ResultPanelProps {
  results: any;
  operationAnalysis: any[];
  onAddToQuote: () => void;
  operationType: OperationType;
  rentalPeriod: number;
}

const ResultPanel = ({ results, operationAnalysis, onAddToQuote, operationType, rentalPeriod }: ResultPanelProps) => {
  const [isOptimizerOpen, setOptimizerOpen] = useState(false);

  const analysisContent = (
    <div className="space-y-4 text-sm max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
      {operationAnalysis.map((section, idx) => {
        if ((section.title === "Análise de Investimento" || section.title.includes("VPL")) && operationType !== 'locacao') {
          return null;
        }

        if (section.title === "Análise de Venda") {
           return (
              <div key={idx}>
                <h4 className="text-md font-semibold text-primary mb-2">{section.title}</h4>
                 <div className="max-w-md mx-auto space-y-2">
                  {section.data.map((item: any) => (
                    <div key={item.label} className={`flex justify-between items-center text-sm p-1.5 rounded-md ${item.isHighlighted ? 'bg-primary/10' : ''}`}>
                      <span className={`font-medium text-foreground/90 ${item.isLabelBold ? 'font-bold' : ''}`}>{item.label}</span>
                      <span className={`font-semibold font-mono ${item.isHighlighted ? 'text-primary' : 'text-foreground'}`}>{item.formatter(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
        }
        
        return (
          <div key={idx}>
            <div className="flex justify-between items-baseline mb-2">
              <h4 className="text-md font-semibold text-primary">{section.title}</h4>
              {section.headers && (
                <div className="flex gap-4 text-xs font-sans font-bold text-muted-foreground">
                  <span className="w-24 text-right">{section.headers.value}</span>
                  {section.headers.percent && <span className="w-20 text-right">{section.headers.percent}</span>}
                </div>
              )}
            </div>
            <div className="space-y-1">
              {section.data.map((row: any, rowIndex: number) => (
                <div key={rowIndex} className={`flex justify-between items-center p-2 rounded-md text-xs ${row.isTotal ? 'bg-muted/80 font-semibold' : (row.isHeader ? 'bg-transparent' : 'bg-muted/40')}`}>
                  <span className={cn('text-foreground/80', row.isFinal && 'text-primary font-bold', row.isHeader && 'font-semibold text-foreground' )}>
                    {row.label}
                  </span>
                  <div className="flex gap-4 font-mono">
                    {!row.hideValue && (
                       <span className={cn("w-24 text-right", row.isFinal && 'text-primary font-bold')}>
                        {row.formatter(row.value)}
                      </span>
                    )}
                    {row.percent !== undefined && (
                      <span className={cn("w-20 text-right", row.isFinal && 'text-primary font-bold')}>
                        {formatPercent(row.percent)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const displayPrice = operationType === 'locacao' ? results.monthlyPrice : results.finalPrice;
  const priceSubtext = operationType === 'locacao' && results.finalPrice && rentalPeriod > 0
    ? `(Total Contrato: ${formatCurrency(results.finalPrice)})`
    : null;

  const isAddButtonDisabled = !results.finalPrice || results.finalPrice <= 0 || (operationType === 'locacao' && (!results.monthlyPrice || results.monthlyPrice <= 0));

  return (
    <>
      <PriceOptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setOptimizerOpen(false)}
        currentPrice={displayPrice || 0}
        productDescription={
          operationType === 'venda' ? 'Venda de equipamentos de TI' :
          operationType === 'locacao' ? 'Locação de equipamentos de TI' : 'Prestação de serviços de TI'
        }
      />
      <Card className="shadow-lg h-full flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Resultados e Análise</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <Tabs defaultValue="resumo" className="flex-grow flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="resumo"><BarChart className="w-4 h-4 mr-2" />Resumo</TabsTrigger>
              <TabsTrigger value="analise"><FileBarChart className="w-4 h-4 mr-2" />Análise</TabsTrigger>
            </TabsList>
            <TabsContent value="resumo" className="flex-grow flex flex-col justify-between mt-4">
              <div className="text-center my-4">
                <p className="text-muted-foreground text-sm">
                  {operationType === 'locacao' ? 'Preço Mensal Sugerido' : 'Preço Final Sugerido'}
                </p>
                <p className="text-4xl lg:text-5xl font-bold text-primary tracking-tight my-2 font-headline">
                  {formatCurrency(displayPrice)}
                </p>
                {priceSubtext && (
                  <p className="text-accent text-sm">
                    {priceSubtext}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 text-center mb-4 border-t pt-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Custo Base</p>
                  <p className="text-lg font-semibold">{formatCurrency(results.baseCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">MARGEM+COM</p>
                  <p className="text-lg font-semibold">{formatCurrency(results.margemEComissaoValor)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Impostos</p>
                  <p className="text-lg font-semibold">{formatCurrency(results.impostosValor)}</p>
                </div>
              </div>
              
              <div className="space-y-2 mt-auto">
                 <Button onClick={() => setOptimizerOpen(true)} variant="outline" className="w-full">
                  <Lightbulb size={16} className="mr-2" /> Otimizar Preço com IA
                </Button>
                <Button onClick={onAddToQuote} className="w-full" disabled={isAddButtonDisabled}>
                  <CheckCircle size={16} className="mr-2" /> Adicionar ao Orçamento
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="analise" className="mt-4">
              {analysisContent}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default ResultPanel;

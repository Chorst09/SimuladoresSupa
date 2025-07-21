"use client"

import React from 'react';
import { Tag, Server, Briefcase, Trash2, FileText, ClipboardList } from 'lucide-react';
import type { QuoteItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';

interface QuoteDisplayProps {
  items: QuoteItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onGenerateQuote: () => void;
}

const QuoteSection = ({ title, items, onRemove, isRental = false, isService = false }: { title: React.ReactNode; items: QuoteItem[]; onRemove: (id: string) => void, isRental?: boolean, isService?: boolean }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">{title}</h3>
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-3/5">Descrição</TableHead>
              <TableHead className="text-center">{isService ? 'Horas Previstas' : 'Qtde'}</TableHead>
              <TableHead className="text-right">{isService ? 'Preço/Hora' : `Preço Unit. ${isRental ? 'Mensal' : ''}`}</TableHead>
              <TableHead className="text-right">Subtotal {isRental ? 'Mensal' : ''}</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-center">{isService ? `${item.estimatedHours}h` : item.quantity}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(item.price)}</TableCell>
                <TableCell className="text-right font-mono">
                    {isService ? formatCurrency(item.totalPrice) : formatCurrency(item.price * item.quantity)}
                </TableCell>
                <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => onRemove(item.id)}><Trash2 size={16} /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};


const QuoteDisplay = ({ items, onRemove, onClear, onGenerateQuote }: QuoteDisplayProps) => {
  if (items.length === 0) return null;

  const vendaItems = items.filter(i => i.type === 'venda');
  const locacaoItems = items.filter(i => i.type === 'locacao');
  const servicosItems = items.filter(i => i.type === 'servicos');

  const locacaoPeriod = locacaoItems.length > 0 ? locacaoItems[0].period : null;

  const vendaTotal = vendaItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const locacaoTotal = locacaoItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const servicosTotal = servicosItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const locacaoMonthlyTotal = locacaoItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-3 font-headline text-2xl"><ClipboardList /> Orçamento Final</CardTitle>
        <Button variant="destructive" size="sm" onClick={onClear}>Limpar Orçamento</Button>
      </CardHeader>
      <CardContent>
        {vendaItems.length > 0 && <QuoteSection title={<><Tag size={18} /> Venda</>} items={vendaItems} onRemove={onRemove} />}
        {locacaoItems.length > 0 && <QuoteSection title={<><Server size={18} /> Locação ({locacaoPeriod} meses)</>} items={locacaoItems} onRemove={onRemove} isRental />}
        {servicosItems.length > 0 && <QuoteSection title={<><Briefcase size={18} /> Serviços</>} items={servicosItems} onRemove={onRemove} isService />}
      </CardContent>
      <CardFooter className="flex-col items-end gap-4 pt-6">
        <div className="w-full sm:w-2/5 space-y-2 text-right">
            {vendaTotal > 0 && <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Total Venda:</span><span className="text-foreground/80 font-mono">{formatCurrency(vendaTotal)}</span></div>}
            {locacaoTotal > 0 && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Mensal Locação:</span>
                  <span className="text-foreground/80 font-mono">{formatCurrency(locacaoMonthlyTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Total Locação (Contrato):</span>
                  <span className="text-foreground/80 font-mono">{formatCurrency(locacaoTotal)}</span>
                </div>
              </>
            )}
            {servicosTotal > 0 && <div className="flex justify-between items-center text-sm"><span className="text-muted-foreground">Total Serviços:</span><span className="text-foreground/80 font-mono">{formatCurrency(servicosTotal)}</span></div>}
            
            <div className="flex justify-between items-center text-xl font-bold pt-2 border-t mt-2"><span className="text-foreground">TOTAL GERAL:</span><span className="text-primary font-mono">{formatCurrency(total)}</span></div>
        </div>
        <Button onClick={onGenerateQuote} size="lg">
          <FileText size={18} className="mr-2" /> Gerar Proposta Formal
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuoteDisplay;

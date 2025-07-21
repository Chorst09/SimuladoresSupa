"use client"

import React from 'react';
import { X, Printer, Tag, Server, Briefcase } from 'lucide-react';
import type { CompanyInfo, ClientInfo, AccountManagerInfo, QuoteItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyInfo: CompanyInfo;
  clientInfo: ClientInfo;
  accountManagerInfo: AccountManagerInfo;
  quoteItems: QuoteItem[];
  proposalNumber: string;
}

const QuoteSection = ({ title, items, isRental = false, isService = false }: { title: React.ReactNode; items: QuoteItem[]; isRental?: boolean; isService?: boolean }) => {
  if (items.length === 0) return null;
  const subtotal = items.reduce((sum, item) => sum + (isRental ? item.price * item.quantity : item.totalPrice), 0);

  return (
    <div className="mt-6">
      <h3 className="text-xl font-headline font-semibold text-primary mb-3 flex items-center gap-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-500 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3">Descrição</th>
              <th scope="col" className="px-6 py-3 text-center">{isService ? 'Horas Previstas' : 'Qtde'}</th>
              <th scope="col" className="px-6 py-3 text-right">{isService ? 'Preço/Hora' : `Preço Unit. ${isRental ? 'Mensal' : ''}`}</th>
              <th scope="col" className="px-6 py-3 text-right whitespace-nowrap">Subtotal {isRental ? 'Mensal' : ''}</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b">
                <td className="px-6 py-4">{item.description}</td>
                <td className="px-6 py-4 text-center">{isService ? `${item.estimatedHours}h` : item.quantity}</td>
                <td className="px-6 py-4 text-right font-mono">{formatCurrency(item.price)}</td>
                <td className="px-6 py-4 text-right font-mono">
                    {isService ? formatCurrency(item.totalPrice) : formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold text-gray-800 bg-gray-100">
              <td colSpan={3} className="px-6 py-3 text-right text-base">Subtotal</td>
              <td className="px-6 py-3 text-right font-mono text-base">{formatCurrency(subtotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const QuoteModal = ({ isOpen, onClose, companyInfo, clientInfo, accountManagerInfo, quoteItems, proposalNumber }: QuoteModalProps) => {
  if (!isOpen) return null;

  const vendaItems = quoteItems.filter(i => i.type === 'venda');
  const locacaoItems = quoteItems.filter(i => i.type === 'locacao');
  const servicosItems = quoteItems.filter(i => i.type === 'servicos');
  
  const vendaTotal = vendaItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const locacaoTotal = locacaoItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const servicosTotal = servicosItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const locacaoPeriod = locacaoItems.length > 0 ? locacaoItems[0].period : null;
  const locacaoMonthlyTotal = locacaoItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const total = quoteItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen max-w-none h-screen max-h-none p-0" id="quote-to-print">
        <DialogHeader className="sr-only">
          <DialogTitle>Proposta Formal</DialogTitle>
        </DialogHeader>
        <style>{`
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-hidden { display: none; }
            .printable-content {
                background-color: white !important;
                color: black !important;
            }
          }
        `}</style>
        <div className="p-10 text-gray-800 bg-white printable-content overflow-auto h-full">
          <div className="flex justify-between items-start mb-8">
            <div className="w-2/3">
              <h2 className="text-3xl font-bold text-gray-900 font-headline">{companyInfo.name}</h2>
              <p>{companyInfo.address}, {companyInfo.cityState}</p>
              <p>CNPJ: {companyInfo.cnpj}</p>
              <p>Telefone: {companyInfo.phone} | E-mail: {companyInfo.email}</p>
            </div>
            <div className="w-1/3 text-right">
              <h1 className="text-4xl font-bold text-primary font-headline">PROPOSTA</h1>
              <p className="text-gray-500">Data: {new Date().toLocaleDateString('pt-BR')}</p>
              {proposalNumber && <p className="text-gray-500">Número: {proposalNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold text-gray-600 uppercase text-sm mb-2">CLIENTE</h3>
              <p className="font-semibold">{clientInfo.company || 'Não informado'}</p>
              <p>A/C: {clientInfo.name || 'Não informado'}</p>
              <p>{clientInfo.phone || ''}</p>
              <p>{clientInfo.email || ''}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-bold text-gray-600 uppercase text-sm mb-2">GERENTE DE CONTAS</h3>
              <p className="font-semibold">{accountManagerInfo.name}</p>
              <p>{accountManagerInfo.phone}</p>
              <p>{accountManagerInfo.email}</p>
            </div>
          </div>
          
          <QuoteSection title={<><Tag size={20} /> Venda</>} items={vendaItems} />
          <QuoteSection title={<><Server size={20} /> Locação ({locacaoPeriod} meses)</>} items={locacaoItems} isRental />
          <QuoteSection title={<><Briefcase size={20} /> Serviços</>} items={servicosItems} isService />
          
          <div className="mt-8 pt-4 border-t-2 border-primary flex justify-end">
            <div className="w-full sm:w-2/5 space-y-2 text-right">
                {vendaTotal > 0 && <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Total Venda:</span><span className="text-gray-600 font-mono">{formatCurrency(vendaTotal)}</span></div>}
                {locacaoTotal > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Total Mensal Locação:</span>
                      <span className="text-gray-600 font-mono">{formatCurrency(locacaoMonthlyTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Total Locação (Contrato):</span>
                      <span className="text-gray-600 font-mono">{formatCurrency(locacaoTotal)}</span>
                    </div>
                  </>
                )}
                {servicosTotal > 0 && <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Total Serviços:</span><span className="text-gray-600 font-mono">{formatCurrency(servicosTotal)}</span></div>}

                <div className="flex justify-between items-center text-xl font-bold pt-2 border-t mt-2"><span className="text-gray-800">TOTAL GERAL:</span><span className="text-primary font-mono">{formatCurrency(total)}</span></div>
            </div>
          </div>
          <div className="absolute top-4 right-4 print-hidden flex gap-2">
            <Button onClick={() => window.print()} size="icon"><Printer size={20} /></Button>
            <Button onClick={onClose} variant="destructive" size="icon"><X size={20} /></Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteModal;


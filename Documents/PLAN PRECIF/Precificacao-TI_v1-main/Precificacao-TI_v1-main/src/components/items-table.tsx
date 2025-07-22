
'use client'

import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { OperationType, SaleItem, RentalItem, ServiceItem, Regime, LaborCost } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { uuidv4 } from '@/lib/uuid';

type Items = { saleItems: SaleItem[], rentalItems: RentalItem[], serviceItems: ServiceItem[] };
type SetItems = { setSaleItems: React.Dispatch<React.SetStateAction<SaleItem[]>>, setRentalItems: React.Dispatch<React.SetStateAction<RentalItem[]>>, setServiceItems: React.Dispatch<React.SetStateAction<ServiceItem[]>> };

interface ItemsTableProps {
  operationType: OperationType;
  items: Items;
  setItems: SetItems;
  laborCostConfig: LaborCost;
  calculationParams: {
    activeRegime: Regime;
    rentalPeriod: number;
    desiredMargin: number;
    divisor: number | null;
    isIcmsContributor: boolean;
    destinationUF: string;
    icmsInterstate: Record<string, number>;
  };
  calculationResults: any;
}

const ItemsTable = ({ operationType, items, setItems, laborCostConfig, calculationParams, calculationResults }: ItemsTableProps) => {

  const handleItemChange = (opType: keyof Items, id: string, field: string, value: any) => {
    const setter = setItems[`set${opType.charAt(0).toUpperCase() + opType.slice(1)}` as keyof SetItems];
    setter((prevItems: any[]) => prevItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (opType: keyof Items, id: string) => {
    const setter = setItems[`set${opType.charAt(0).toUpperCase() + opType.slice(1)}` as keyof SetItems];
    setter((prevItems: any[]) => prevItems.filter(item => item.id !== id));
  };

  const onAddItem = () => {
    switch (operationType) {
      case 'venda':
        setItems.setSaleItems(prev => [...prev, { id: uuidv4(), description: '', quantity: 1, unitCost: 0, creditoIcmsCompra: 0, icmsDestLocal: 18.0, icmsST: false }]);
        break;
      case 'locacao':
        setItems.setRentalItems(prev => [...prev, { id: uuidv4(), description: '', quantity: 1, assetValueBRL: 5000, sucataPercent: 10, icmsCompra: 600, icmsPr: 12.0, frete: 0 }]);
        break;
      case 'servicos':
        setItems.setServiceItems(prev => [...prev, { id: uuidv4(), description: '', estimatedHours: 8, baseSalary: laborCostConfig.geral.salarioBase, contractType: 'clt' }]);
        break;
    }
  };

  const renderTable = () => {
    const commonInputProps = (item: any, accessor: string, opType: keyof Items, type: string = 'number', step?: string) => ({
      value: item[accessor] ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(opType, item.id, accessor, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value),
      className: "w-full p-2 h-9 text-right min-w-[100px]",
      type: type,
      step: step || "0.01",
    });

    const config = {
      venda: {
        columns: [
          { header: 'Descrição', accessor: 'description', width: '250px' },
          { header: 'Qtde', accessor: 'quantity', type: 'number', width: '80px', align: 'center' },
          { header: 'Custo Unit. R$', accessor: 'unitCost', type: 'number', width: '120px' },
          { header: 'Créd. ICMS R$', accessor: 'creditoIcmsCompra', type: 'number', width: '120px' },
          { header: 'Custo Total', accessor: 'baseCost', isReadOnly: true, formatter: formatCurrency, width: '120px' },
          { header: 'ICMS Venda %', accessor: 'icmsVendaCalculated', isReadOnly: true, formatter: formatPercent, width: '120px' },
          { header: 'ICMS Dest. Local %', accessor: 'icmsDestLocal', type: 'number', width: '120px' },
          { header: 'DIFAL Venda', accessor: 'difalVenda', isReadOnly: true, formatter: formatCurrency, width: '120px' },
          { header: 'ICMS ST', accessor: 'icmsST', width: '80px', align: 'center' },
          { header: '(Margem+Comissão)', accessor: 'marginComissaoValor', isReadOnly: true, formatter: formatCurrency, width: '150px' },
          { header: 'Impostos', accessor: 'impostosValor', isReadOnly: true, formatter: formatCurrency, width: '120px' },
          { header: 'Receita Bruta', accessor: 'rbUnitario', isReadOnly: true, formatter: formatCurrency, width: '120px' },
        ],
        items: items.saleItems,
        opType: 'saleItems' as keyof Items,
        totalLabel: 'Custo Base Total'
      },
      servicos: {
        columns: [
          { header: 'Descrição', accessor: 'description', width: '25%' },
          { header: 'Salário Base', accessor: 'baseSalary', type: 'number', width: '15%' },
          { header: 'Tipo', accessor: 'contractType', width: '10%' },
          { header: 'Horas', accessor: 'estimatedHours', type: 'number', width: '10%' },
          { header: 'Custo/Hora', accessor: 'hourlyCost', isReadOnly: true, formatter: formatCurrency, width: '10%' },
          { header: 'Venda/Hora', accessor: 'sellPricePerHour', isReadOnly: true, formatter: formatCurrency, width: '10%' },
          { header: 'Subtotal/custo', accessor: 'totalCost', isReadOnly: true, formatter: formatCurrency, width: '10%' },
          { header: 'Subtotal/venda', accessor: 'totalSellPrice', isReadOnly: true, formatter: formatCurrency, width: '10%' }
        ],
        items: items.serviceItems,
        opType: 'serviceItems' as keyof Items,
        totalLabel: 'Custo Base Total'
      },
      locacao: {
        columns: [
          { header: 'Descrição', accessor: 'description', width: '200px' },
          { header: 'QTD', accessor: 'quantity', type: 'number', width: '80px', align: 'center' },
          { header: 'Valor Unit. R$', accessor: 'assetValueBRL', type: 'number', width: '120px' },
          { header: 'Valor Total R$', accessor: 'totalBRL', isReadOnly: true, formatter: formatCurrency, width: '120px' },
          { header: 'ICMS Compra', accessor: 'icmsCompra', type: 'number', width: '120px' },
          { header: 'ICMS PR %', accessor: 'icmsPr', type: 'number', width: '120px' },
          { header: 'DIFAL R$', accessor: 'difal', isReadOnly: true, formatter: formatCurrency, width: '120px' },
          { header: 'Frete R$', accessor: 'frete', type: 'number', width: '120px' },
          { header: 'Custo Total Ativo R$', accessor: 'totalAssetCost', isReadOnly: true, formatter: formatCurrency, width: '150px' },
          { header: 'CT Mensalizado R$', accessor: 'monthlyCostTotal', isReadOnly: true, formatter: formatCurrency, width: '150px' },
          { header: '(Margem + Comissão)', accessor: 'marginComissaoValor', isReadOnly: true, formatter: formatCurrency, width: '150px' },
          { header: 'Impostos R$', accessor: 'impostosValor', isReadOnly: true, formatter: formatCurrency, width: '120px' },
          { header: 'Receita Bruta R$', accessor: 'rbTotal', isReadOnly: true, formatter: formatCurrency, width: '150px' },
          { header: 'RB Unit. R$', accessor: 'rbUnitario', isReadOnly: true, formatter: formatCurrency, width: '150px' }
        ],
        items: items.rentalItems,
        opType: 'rentalItems' as keyof Items,
        totalLabel: 'Custo Base Mensal (Total)'
      }
    };

    const currentConfig = config[operationType];
    const currentItems = items[`${operationType}Items` as keyof Items] || [];

    const totalCost = currentItems.reduce((sum, item) => {
      const itemCalc = calculationResults.itemCalculations?.[item.id] || {};
      const qty = (item as any).quantity || 1;
      let lineCost = 0;
      if (operationType === 'venda') {
        const unitCost = itemCalc.baseCost || 0;
        lineCost = qty * unitCost;
      } else if (operationType === 'locacao') {
        const unitCost = itemCalc.monthlyCost || 0;
        lineCost = qty * unitCost;
      } else if (operationType === 'servicos') {
        const unitCost = itemCalc.totalCost || 0;
        lineCost = qty * unitCost; // Services are not quantity based in the same way
      }
      return sum + lineCost;
    }, 0);

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {currentConfig.columns.map(c => <TableHead key={c.header} style={{ width: c.width, minWidth: c.width }} className={(c as any).align === 'center' ? 'text-center' : ''}>{c.header}</TableHead>)}
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentConfig.items.map((item: any) => {
                const calculated = calculationResults.itemCalculations?.[item.id] || {};
                const qty = item.quantity || 1;

                let lineCalculation = { ...calculated };
                if (operationType === 'venda') {
                  // For display, scale unit values by quantity
                  lineCalculation.baseCost = (calculated.baseCost || 0) * qty;
                  lineCalculation.marginComissaoValor = (calculated.marginComissaoValor || 0) * qty;
                  lineCalculation.impostosValor = (calculated.impostosValor || 0) * qty;
                  lineCalculation.rbUnitario = (calculated.rbUnitario || 0) * qty;
                  lineCalculation.difalVenda = (calculated.difalVenda || 0) * qty;
                } else if (operationType === 'locacao') {
                  lineCalculation.totalBRL = (item.assetValueBRL || 0) * qty;
                  // Assign calculated values for locacao
                  lineCalculation.totalAssetCost = calculated.totalAssetCost;
                  lineCalculation.monthlyCostTotal = calculated.monthlyCostTotal;
                  lineCalculation.marginComissaoValor = calculated.marginComissaoValor;
                  lineCalculation.impostosValor = calculated.impostosValor;
                  lineCalculation.rbTotal = calculated.rbTotal;
                  lineCalculation.rbUnitario = calculated.rbUnitario;
                }

                return (
                  <TableRow key={item.id}>
                    {currentConfig.columns.map(col => (
                      <TableCell key={col.accessor} style={{ width: col.width }} className="p-1 align-top">
                        {
                          col.isReadOnly ? <span className="font-mono text-foreground p-2 block text-right h-9">{lineCalculation[col.accessor as keyof typeof lineCalculation] !== undefined && lineCalculation[col.accessor as keyof typeof lineCalculation] !== null ? col.formatter(lineCalculation[col.accessor as keyof typeof lineCalculation]) : '-'}</span> :
                            col.accessor === 'description' ? <Input {...commonInputProps(item, col.accessor, currentConfig.opType, 'text')} className="text-left" /> :
                              col.accessor === 'icmsST' ? <div className="flex justify-center items-center h-9"><Checkbox checked={item.icmsST} onCheckedChange={(checked) => handleItemChange(currentConfig.opType, item.id, 'icmsST', !!checked)} /></div> :
                                col.accessor === 'contractType' ? <Select value={item.contractType} onValueChange={(value) => handleItemChange(currentConfig.opType, item.id, 'contractType', value)}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="clt">CLT</SelectItem><SelectItem value="terceiro">Terceiro</SelectItem></SelectContent></Select> :
                                  <Input {...commonInputProps(item, col.accessor, currentConfig.opType, col.type, (col as any).step)} />
                        }
                      </TableCell>
                    ))}
                    <TableCell className="p-1 text-center align-top pt-2.5">
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-7 w-7" onClick={() => removeItem(currentConfig.opType, item.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between items-center mt-2">
          <Button variant="link" onClick={onAddItem} className="p-0 text-primary">
            <PlusCircle size={18} />
            <span className="ml-2">Adicionar Item</span>
          </Button>
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">{currentConfig.totalLabel}</span>
            <span className="font-bold text-lg text-foreground">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </div>
    );
  };

  return renderTable();
};

export default ItemsTable;

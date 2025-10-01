export type OperationType = 'venda' | 'locacao' | 'servicos';

export type RegimeType = 'presumido' | 'real' | 'simples' | 'mei';

export interface RegimeRates {
  pis?: number;
  cofins?: number;
  irpj?: number;
  csll?: number;
  presuncaoVenda?: number;
  presuncaoServico?: number;
  icms?: number;
  iss?: number;
  anexoI?: number;
  anexoIII?: number;
  taxa?: number;
}

export interface Regime {
  id: string;
  name: string;
  type: RegimeType;
  rates: RegimeRates;
}

export interface OutrosCustos {
  comissaoVenda: number;
  comissaoLocacao: number;
  comissaoServico: number;
  margemLucroServico: number;
  despesasAdmin: number;
  outrasDespesas: number;
  custoFinanceiroMensal: number;
  taxaDescontoVPL: number;
  depreciacao: number;
}

export interface LaborCost {
  clt: {
    encargos: Record<string, number>;
    beneficios: Record<string, number>;
  };
  geral: {
    diasUteis: number;
    horasDia: number;
    salarioBase: number;
  };
}

export interface CompanyInfo {
  name: string;
  cnpj: string;
  address: string;
  cityState: string;
  phone: string;
  email: string;
}

export interface ClientInfo {
  name: string;
  company: string;
  phone: string;
  email: string;
}

export interface AccountManagerInfo {
    name: string;
    email: string;
    phone: string;
}

export interface SaleItem {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
  creditoIcmsCompra: number;
  icmsDestLocal: number;
  icmsST: boolean;
}

export interface RentalItem {
  id: string;
  description: string;
  quantity: number;
  assetValueBRL: number;
  sucataPercent: number;
  icmsCompra: number;
  icmsPr: number;
  frete: number;
}

export interface ServiceItem {
  id: string;
  description: string;
  estimatedHours: number;
  baseSalary: number;
  contractType: 'clt' | 'terceiro';
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  type: 'venda' | 'locacao' | 'servicos';
  period?: number;
  baseCost: number;
  totalPrice: number;
  estimatedHours?: number;
}

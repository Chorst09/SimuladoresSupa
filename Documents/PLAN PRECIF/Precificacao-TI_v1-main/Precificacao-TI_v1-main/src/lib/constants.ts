import type { Regime, OutrosCustos, LaborCost, CompanyInfo } from '@/types';

export const initialRegimes: Regime[] = [
  { id: 'presumido_padrao', name: 'Lucro Presumido', type: 'presumido', rates: { pis: 0.65, cofins: 3.00, irpj: 15.00, csll: 9.00, presuncaoVenda: 8.00, presuncaoServico: 32.00, icms: 18.00, iss: 5.00 }},
  { id: 'real_padrao', name: 'Lucro Real', type: 'real', rates: { pis: 1.65, cofins: 7.60, irpj: 15.00, csll: 9.00, icms: 18.00, iss: 5.00 }},
  { id: 'simples_padrao', name: 'Simples Nacional', type: 'simples', rates: { anexoI: 8.00, anexoIII: 11.20 }},
  { id: 'mei_padrao', name: 'MEI', type: 'mei', rates: { taxa: 0 }}
];

export const initialOutrosCustos: OutrosCustos = {
    comissaoVenda: 3.00, comissaoLocacao: 10.00, comissaoServico: 5.00,
    margemLucroServico: 20.00,
    despesasAdmin: 2.00, outrasDespesas: 1.00, 
    custoFinanceiroMensal: 1.17,
    taxaDescontoVPL: 15.0,
    depreciacao: 0,
};

export const initialLaborCost: LaborCost = {
    clt: {
        encargos: { ferias: 8.33, tercoFerias: 2.78, decimoTerceiro: 8.33, inssBase: 20.00, inssSistemaS: 7.80, inssFerias13: 1.52, fgts: 8.00, fgtsFerias13: 1.56, multaFgts: 1.91, outros: 1.00 },
        beneficios: { valeTransporte: 200.00, planoSaude: 300.00, alimentacao: 550.00 },
    },
    geral: { diasUteis: 21, horasDia: 8, salarioBase: 5000 }
};

export const initialCompanyInfo: CompanyInfo = {
    name: "Sua Empresa de TI",
    cnpj: "00.000.000/0001-00",
    address: "Rua da Tecnologia, 123 - Centro",
    cityState: "Curitiba - PR",
    phone: "(41) 99999-9999",
    email: "contato@suaempresa.com",
};

export const initialIcmsInterstate: Record<string, number> = {
  AC: 7, AL: 7, AP: 7, AM: 7, BA: 7, CE: 7, DF: 7, ES: 7, GO: 7, MA: 7,
  MG: 12, MS: 7, MT: 7, PA: 7, PB: 7, PI: 7, PR: 19.5, RJ: 12, RN: 7, // RJ updated to 12 as per user code screenshot, PR was 7, now 12 from other source, let's use user's PR
  RO: 7, RR: 7, RS: 12, SC: 12, SE: 7, SP: 12, TO: 7,
};

export const brazilianStates = Object.keys(initialIcmsInterstate).sort();

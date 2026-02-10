// src/components/documentation/DocumentationView.tsx
'use client';

import React, { useMemo, useCallback } from 'react';
import { BookOpen, Calculator, ExternalLink } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type CalculatorTabId =
  | 'calculator-pabx-sip'
  | 'calculator-maquinas-virtuais'
  | 'calculator-internet-fibra'
  | 'calculator-internet-radio'
  | 'calculator-internet-ok-v2'
  | 'calculator-internet-man'
  | 'calculator-internet-man-radio';

type DocSection = {
  id: string;
  title: string;
  calculatorTabId: CalculatorTabId;
  summary: string;
  passos: string[];
  camposPrincipais: string[];
  resultado: string[];
  dicas: string[];
  observacoes?: string[];
};

export default function DocumentationView({
  onNavigateToCalculator,
}: {
  onNavigateToCalculator?: (tabId: CalculatorTabId) => void;
}) {
  const sections: DocSection[] = useMemo(
    () => [
      {
        id: 'pabx-sip',
        title: 'PABX/SIP',
        calculatorTabId: 'calculator-pabx-sip',
        summary: 'Precifica PABX em Nuvem (Standard/Premium) e SIP Trunk, permitindo montar uma proposta com itens e totais.',
        passos: [
          'Na tela de busca, crie uma Nova Proposta ou edite uma existente.',
          'Preencha/valide os dados do Cliente e do Gerente (no topo da calculadora).',
          'Na aba "Calculadora", configure o bloco "PABX em Nuvem": Modalidade (Standard/Premium), Quantidade de Ramais e Duração do Contrato.',
          'Marque/desmarque opções como "Incluir Taxa de Setup", "Incluir Aparelhos" e "Incluir Agente IA" (se aplicável).',
          'Se estiver usando SIP, configure o bloco "SIP Trunk": Plano SIP, Canais Adicionais (quando disponível) e "Com/sem Equipamentos".',
          'Confira os resultados (setup/mensal) e clique em "Adicionar à Proposta" em cada bloco (PABX e/ou SIP).',
          'No "Resumo da Proposta", revise os itens, selecione o "Status da Proposta" e use as ações de salvar/baixar conforme necessário.',
        ],
        camposPrincipais: [
          'PABX: Modalidade, Quantidade de Ramais, Duração do Contrato, Incluir Setup, Incluir Aparelhos (e quantidade), Incluir Agente IA (e plano).',
          'SIP: Plano SIP, Incluir Setup, Canais Adicionais (quando permitido), Com/sem Equipamentos.',
          'Parcerias: "Incluir Parceiro Indicador" e "Incluir Parceiro Influenciador" (quando exibidos).',
        ],
        resultado: [
          'Resultados parciais por produto (PABX e SIP) com Setup e Total Mensal.',
          'Resumo com itens adicionados e total consolidado da proposta.',
          'Abas adicionais: "Tabela Comissões" (consulta/ajuste conforme permissões) e, para admin, "Tabela de Preços" e "DRE".',
        ],
        dicas: [
          'Se o plano SIP for 30/60 canais (tarifado) ou 60 canais (ilimitado), "Canais Adicionais" pode aparecer como "Sem Possibilidade".',
          'Sempre clique em "Adicionar à Proposta" após ajustar parâmetros para refletir no resumo.',
        ],
      },
      {
        id: 'maquinas-virtuais',
        title: 'Máquinas Virtuais',
        calculatorTabId: 'calculator-maquinas-virtuais',
        summary: 'Precifica VMs na nuvem (vCPU/RAM/Disco/Rede/SO e serviços opcionais) e monta proposta com período contratual.',
        passos: [
          'Na busca, crie uma Nova Proposta ou edite uma existente.',
          'Preencha/valide Cliente e Gerente.',
          'Na aba "Calculadora VM", configure "Nome da VM" e os recursos: vCPU, RAM, Armazenamento (tipo e tamanho), Rede e Sistema Operacional.',
          'Configure serviços adicionais (ex: Backup em Bloco, IP Adicional, Snapshot, VPN Site-to-Site, Gestão e Suporte) e se inclui taxa de setup.',
          'Selecione o "Período Contratual" (12/24/36/48/60 meses).',
          'Clique em "Adicionar à Proposta".',
          'Revise os itens no resumo da proposta e use salvar/baixar conforme necessário.',
        ],
        camposPrincipais: [
          'Nome da VM.',
          'vCPU Cores, Memória RAM (GB).',
          'Armazenamento: Tipo (HDD SAS / SSD Performance / NVMe) e Tamanho (GB).',
          'Placa de Rede (1 Gbps / 10 Gbps) e Sistema Operacional.',
          'Serviços: Backup (GB), IP adicional, Snapshot, VPN Site-to-Site, Gestão e Suporte, Incluir Taxa de Setup.',
          'Período Contratual.',
        ],
        resultado: [
          'Produto VM adicionado na proposta com valores de setup/mensalidade.',
          'Abas adicionais: "Tabela Comissões" e, para admin, "Tabela de Preços VM/Configurações" e "DRE".',
        ],
        dicas: [
          'Preencha primeiro os recursos essenciais (vCPU/RAM/Disco) antes de ativar adicionais, para evitar distorções na leitura do valor final.',
          'Se for adicionar mais de uma VM, repita a configuração e clique "Adicionar à Proposta" para cada VM.',
        ],
      },
      {
        id: 'internet-fibra',
        title: 'Internet Fibra',
        calculatorTabId: 'calculator-internet-fibra',
        summary: 'Precifica links de fibra por velocidade e prazo, com opção de instalação, análise de payback e regras para cliente existente.',
        passos: [
          'Crie/edite uma proposta e confirme Cliente/Gerente.',
          'Na aba "Calculadora", selecione o "Prazo Contratual" e a "Velocidade".',
          'Marque "Incluir taxa de instalação no cálculo" se a proposta considerar setup/instalação.',
          'Informe/ajuste o "Custo Fibra" quando necessário.',
          'Se "Já é cliente da Base?", preencha "Mensalidade Anterior" para calcular diferença de valores.',
          'Se necessário, marque "Criar Last Mile?" e ajuste o "Fator Last Mile".',
          'Marque parceiros (Indicador/Influenciador) quando aplicável.',
          'Revise o bloco "Resultado do Cálculo" (mensal, instalação e payback) e clique "Adicionar Produto".',
          'Confira o resumo da proposta (status/alterações) e salve/baixe.',
        ],
        camposPrincipais: [
          'Prazo Contratual, Velocidade.',
          'Incluir taxa de instalação.',
          'Custo Fibra.',
          'Cliente existente: Mensalidade Anterior.',
          'Last Mile: habilitar e Fator.',
          'Parceiros: Indicador e Influenciador.',
        ],
        resultado: [
          'Valor Mensal e, se habilitado, Taxa de Instalação.',
          'Validação de Payback (alerta quando excede o máximo permitido para o prazo).',
          'Produto "Internet Fibra" adicionado ao resumo da proposta.',
        ],
        dicas: [
          'Quando a instalação estiver incluída, observe os alertas de payback (aprovado x excedido) antes de adicionar o produto.',
          'Se o cliente já é da base, a diferença de valor ajuda a avaliar o impacto contratual.',
        ],
      },
      {
        id: 'internet-radio',
        title: 'Internet Radio',
        calculatorTabId: 'calculator-internet-radio',
        summary: 'Precifica links de rádio por velocidade e prazo, com custo rádio, instalação, last mile e análise de payback.',
        passos: [
          'Crie/edite uma proposta e confirme Cliente/Gerente.',
          'Selecione "Prazo Contratual" e "Velocidade".',
          'Marque "Incluir taxa de instalação no cálculo" se aplicável.',
          'Informe/ajuste o "Custo Rádio".',
          'Se o cliente já é da base, preencha "Mensalidade Anterior".',
          'Se necessário, habilite "Criar Last Mile?" e ajuste o fator.',
          'Marque parceiros (Indicador/Influenciador) se aplicável.',
          'Revise o "Resultado do Cálculo" e clique "Adicionar Produto".',
          'Finalize no resumo/salvar/baixar.',
        ],
        camposPrincipais: [
          'Prazo Contratual, Velocidade.',
          'Incluir taxa de instalação.',
          'Custo Rádio.',
          'Cliente existente: Mensalidade Anterior.',
          'Last Mile: habilitar e Fator.',
          'Parceiros: Indicador e Influenciador.',
        ],
        resultado: [
          'Valor Mensal, taxa de instalação (se marcada) e validação de payback.',
          'Produto "Internet Rádio" incluído na proposta.',
        ],
        dicas: [
          'Ajuste o custo rádio somente quando necessário; o padrão já vem da tabela do plano selecionado.',
          'Se aparecer alerta de payback acima do permitido, revise custo/instalação/last mile antes de prosseguir.',
        ],
      },
      {
        id: 'double-fibra-radio',
        title: 'Double-Fibra/Radio',
        calculatorTabId: 'calculator-internet-ok-v2',
        summary: 'Precifica oferta "Double" (Fibra/Radio) por velocidade e prazo, com custo Fibra/Radio e validação de payback.',
        passos: [
          'Crie/edite uma proposta e confirme Cliente/Gerente.',
          'Selecione "Prazo Contratual" e "Velocidade".',
          'Marque "Incluir taxa de instalação no cálculo" se necessário.',
          'Informe/ajuste "Custo Fibra/Radio" quando aplicável.',
          'Se "Já é cliente da Base?", preencha "Mensalidade Anterior".',
          'Se necessário, habilite "Criar Last Mile?" e ajuste o fator.',
          'Marque parceiros (Indicador/Influenciador) se aplicável.',
          'Revise o resultado (mensal/instalação/payback) e clique "Adicionar Produto".',
        ],
        camposPrincipais: [
          'Prazo Contratual, Velocidade.',
          'Incluir taxa de instalação.',
          'Custo Fibra/Radio.',
          'Cliente existente: Mensalidade Anterior.',
          'Last Mile: habilitar e Fator.',
          'Parceiros: Indicador e Influenciador.',
        ],
        resultado: [
          'Valor Mensal, taxa de instalação (se marcada) e validação de payback.',
          'Produto "Double Fibra/Rádio" incluído na proposta.',
        ],
        dicas: [
          'Use a validação de payback como critério antes de adicionar o produto (principalmente quando instalação estiver marcada).',
        ],
      },
      {
        id: 'internet-man-fibra',
        title: 'Internet Man Fibra',
        calculatorTabId: 'calculator-internet-man',
        summary: 'Precifica MAN (Fibra) por velocidade e prazo, com custo MAN e possibilidade de ajustar alíquotas na "Tabela de Impostos".',
        passos: [
          'Crie/edite proposta e confirme Cliente/Gerente.',
          'Selecione "Prazo Contratual" e "Velocidade".',
          'Marque "Incluir taxa de instalação no cálculo" se necessário.',
          'Informe/ajuste o "Custo Man".',
          'Opcional: marque cliente existente e preencha "Mensalidade Anterior".',
          'Opcional: habilite "Criar Last Mile?" e ajuste o fator.',
          'Marque parceiros (Indicador/Influenciador) quando aplicável.',
          'Confira os blocos de resultado/DRE e, se necessário, ajuste a "Tabela de Impostos" (botão Editar/Salvar).',
          'Clique "Adicionar Produto" para incluir na proposta.',
        ],
        camposPrincipais: [
          'Prazo Contratual, Velocidade.',
          'Incluir taxa de instalação.',
          'Custo Man.',
          'Cliente existente: Mensalidade Anterior.',
          'Last Mile: habilitar e Fator.',
          'Parceiros: Indicador e Influenciador.',
          'Tabela de Impostos: Simples Nacional (%), Banda (%), Custo/Desp (%).',
        ],
        resultado: [
          'Resultado do cálculo e indicadores financeiros (payback, margens/ROI quando exibidos).',
          'Produto "Internet Man Fibra" incluído na proposta.',
        ],
        dicas: [
          'Só edite a Tabela de Impostos se tiver orientação para ajustar as alíquotas; alterações impactam DRE/validações.',
        ],
      },
      {
        id: 'internet-man-radio',
        title: 'Internet Man Radio',
        calculatorTabId: 'calculator-internet-man-radio',
        summary: 'Precifica MAN (Rádio) por velocidade e prazo, com custo rádio e alíquotas ajustáveis na "Tabela de Impostos".',
        passos: [
          'Crie/edite proposta e confirme Cliente/Gerente.',
          'Selecione "Prazo Contratual" e "Velocidade".',
          'Marque "Incluir taxa de instalação no cálculo" se aplicável.',
          'Informe/ajuste o "Custo Rádio".',
          'Opcional: cliente existente + "Mensalidade Anterior".',
          'Opcional: "Criar Last Mile?" + fator.',
          'Marque parceiros (Indicador/Influenciador) quando aplicável.',
          'Se necessário, ajuste a "Tabela de Impostos" (Editar/Salvar).',
          'Clique "Adicionar Produto" para incluir na proposta.',
        ],
        camposPrincipais: [
          'Prazo Contratual, Velocidade.',
          'Incluir taxa de instalação.',
          'Custo Rádio.',
          'Cliente existente: Mensalidade Anterior.',
          'Last Mile: habilitar e Fator.',
          'Parceiros: Indicador e Influenciador.',
          'Tabela de Impostos: Simples Nacional (%), Banda (%), Custo/Desp (%).',
        ],
        resultado: [
          'Resultado do cálculo e indicadores financeiros exibidos no DRE/resultado final.',
          'Produto "Internet Man Radio" incluído na proposta.',
        ],
        dicas: [
          'Após editar alíquotas, valide novamente os resultados (payback/margens) antes de salvar/baixar a proposta.',
        ],
      },
    ],
    []
  );

  const scrollToSection = useCallback((sectionId: string) => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(sectionId);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Anchor helper for scroll */}
      <div id="top" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Documentação
          </CardTitle>
          <CardDescription>
            Guia rápido de como usar cada calculadora. Use os atalhos para ir direto ao que precisa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <Button
                key={s.id}
                type="button"
                variant="secondary"
                className="h-8"
                onClick={() => scrollToSection(s.id)}
              >
                {s.title}
              </Button>
            ))}
          </div>

          <Separator />

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="text-foreground font-medium">Fluxo padrão (quase todas as calculadoras):</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Crie uma Nova Proposta ou edite uma proposta existente.</li>
              <li>Preencha Cliente e Gerente (dados aparecem no topo).</li>
              <li>Configure os parâmetros na aba &quot;Calculadora&quot;.</li>
              <li>Use &quot;Adicionar Produto&quot; ou &quot;Adicionar à Proposta&quot; para montar o resumo.</li>
              <li>Revise o resumo, ajuste o status, e então salve/baixe a proposta.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadoras
          </CardTitle>
          <CardDescription>Abra uma seção para ver o passo a passo, campos principais e dicas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {sections.map((s) => (
              <AccordionItem key={s.id} value={s.id} id={s.id} className="border-border">
                <AccordionTrigger className="text-left">
                  <span className="flex items-center gap-3">
                    <span className="font-semibold">{s.title}</span>
                    <Badge variant="secondary" className="font-normal">
                      Como usar
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{s.summary}</p>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Passo a passo</p>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {s.passos.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Campos principais</p>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {s.camposPrincipais.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">O que conferir no resultado</p>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {s.resultado.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Dicas</p>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        {s.dicas.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {s.observacoes && s.observacoes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">Observações</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          {s.observacoes.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        type="button"
                        onClick={() => onNavigateToCalculator?.(s.calculatorTabId)}
                        disabled={!onNavigateToCalculator}
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Abrir calculadora
                      </Button>
                      <Button type="button" variant="outline" onClick={() => scrollToSection('top')}>
                        Voltar ao topo
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AnalysisParams {
  product: string;
  speed: number;
  state: string;
  city: string;
  connectionType: string;
  contractTerm: number;
}

interface CompetitorResult {
  competitor: string;
  price: number;
  installationFee: number;
  totalFirstYear: number;
}

interface AnalysisData {
  timestamp: string;
  params: AnalysisParams;
  results: CompetitorResult[];
  isAI: boolean;
  aiInsights?: string;
}

export default function AnaliseConcorrencia() {
  const [formData, setFormData] = useState<AnalysisParams>({
    product: 'Internet Fibra',
    speed: 100,
    state: '',
    city: '',
    connectionType: 'ADSL',
    contractTerm: 12
  });

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CompetitorResult[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisData | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<AnalysisData[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  const citiesByState: Record<string, string[]> = {
    'SP': ['São Paulo', 'Campinas', 'Guarulhos', 'Santos'],
    'RJ': ['Rio de Janeiro', 'Niterói', 'Duque de Caxias', 'São Gonçalo'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa']
  };

  useEffect(() => {
    loadSavedAnalyses();
  }, []);

  const loadSavedAnalyses = () => {
    try {
      const saved = localStorage.getItem('telecomAnalyses');
      if (saved) {
        setSavedAnalyses(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar análises salvas:', error);
    }
  };

  const generateMockData = (product: string, speed: number, connectionType: string, contractTerm: number): CompetitorResult[] => {
    const competitors = [
      { name: 'Embratel', profile: 'premium' },
      { name: 'AlhambraIT Brasil', profile: 'competitive' },
      { name: 'Playnet Internet', profile: 'aggressive' },
      { name: 'Double TI', profile: 'competitive' }
    ];

    const productPricing: Record<string, any> = {
      'Internet Fibra': { base: 120, tiers: { 100: 2.5, 500: 2.0, 1000: 1.5, default: 1.2 } },
      'Internet Radio': { base: 250, tiers: { 100: 4.0, 500: 3.5, 1000: 3.0, default: 2.8 } },
      'Internet Man': { base: 800, tiers: { 100: 8.0, 500: 6.5, 1000: 5.0, default: 4.5 } },
      'Dupla abordagem (Fibra mais Radio)': { base: 1200, tiers: { 100: 10.0, 500: 8.0, 1000: 6.5, default: 6.0 } }
    };

    const installationPricing: Record<string, number> = {
      'Internet Fibra': 800,
      'Internet Radio': 1500,
      'Internet Man': 3000,
      'Dupla abordagem (Fibra mais Radio)': 4500
    };

    const ipDedicadoCost = 500;
    const termDiscounts: Record<number, number> = { 12: 1.0, 24: 0.95, 36: 0.90, 48: 0.85, 60: 0.80 };

    const pricing = productPricing[product];
    let costPerMbps = pricing.tiers.default;

    if (speed <= 100) costPerMbps = pricing.tiers[100];
    else if (speed <= 500) costPerMbps = pricing.tiers[500];
    else if (speed <= 1000) costPerMbps = pricing.tiers[1000];

    let servicePrice = pricing.base + (costPerMbps * speed);
    const discountFactor = termDiscounts[contractTerm] || 1.0;
    let basePrice = servicePrice * discountFactor;

    if (connectionType === 'IP dedicado') {
      basePrice += ipDedicadoCost;
    }

    return competitors.map(({ name, profile }) => {
      let finalPrice = basePrice;
      let finalInstallation = installationPricing[product];

      switch(profile) {
        case 'premium':
          finalPrice *= 1.15;
          finalInstallation *= 1.2;
          break;
        case 'aggressive':
          if (product === 'Internet Fibra' && speed <= 300) {
            finalPrice *= 0.88;
            finalInstallation *= 0.9;
          } else {
            finalPrice *= 1.05;
          }
          break;
        case 'competitive':
          finalPrice *= 1.02;
          break;
      }

      finalPrice *= (1 + (Math.random() - 0.5) * 0.1);

      if (contractTerm >= 36) finalInstallation *= 0.5;
      if (contractTerm >= 48) finalInstallation = 0;

      const totalFirstYear = finalInstallation + (finalPrice * 12);

      return {
        competitor: name,
        price: finalPrice,
        installationFee: finalInstallation,
        totalFirstYear
      };
    });
  };

  const generateAiInsights = (results: CompetitorResult[], params: AnalysisParams): string => {
    const minMonthly = results.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
    const minFirstYear = results.reduce((prev, curr) => prev.totalFirstYear < curr.totalFirstYear ? prev : curr);

    let insights = `**Ponto Chave:** A oferta com melhor **custo-benefício no primeiro ano** é da **${minFirstYear.competitor}**, totalizando R$ ${minFirstYear.totalFirstYear.toFixed(2)}. Isso se deve, principalmente, a uma taxa de instalação mais competitiva.\n\n`;

    if (minFirstYear.competitor !== minMonthly.competitor) {
      insights += `**Atenção à Mensalidade:** Apesar do melhor custo inicial, a menor mensalidade recorrente pertence à **${minMonthly.competitor}** (R$ ${minMonthly.price.toFixed(2)}). A longo prazo, após o primeiro ano, esta pode se tornar a opção mais econômica.\n\n`;
    }

    if (params.contractTerm >= 36) {
      insights += `**Análise de Contrato:** A opção por um contrato de ${params.contractTerm} meses é estratégica, pois resultou em descontos na mensalidade e na taxa de instalação, otimizando o TCO (Custo Total de Propriedade).\n\n`;
    } else {
      insights += `**Análise de Contrato:** O contrato de ${params.contractTerm} meses oferece flexibilidade, mas impacta diretamente no custo. Empresas com previsibilidade de longo prazo deveriam cotar prazos de 36 meses ou mais para obter economias substanciais.\n\n`;
    }

    insights += `**Recomendação:** Se o orçamento inicial (CAPEX) for a prioridade, a **${minFirstYear.competitor}** é a escolha indicada. Se o custo operacional mensal (OPEX) a longo prazo for mais importante, a **${minMonthly.competitor}** deve ser priorizada, tentando negociar a taxa de instalação.`;

    return insights;
  };

  const performAnalysis = async (isAI: boolean = false) => {
    if (!formData.state || !formData.city) {
      alert('Por favor, selecione o estado e a cidade.');
      return;
    }

    setIsLoading(true);
    setShowResults(false);
    setShowAIInsights(false);

    // Simular delay da análise
    await new Promise(resolve => setTimeout(resolve, 2500));

    const analysisResults = generateMockData(formData.product, formData.speed, formData.connectionType, formData.contractTerm);
    
    const analysis: AnalysisData = {
      timestamp: new Date().toISOString(),
      params: formData,
      results: analysisResults,
      isAI,
      aiInsights: isAI ? generateAiInsights(analysisResults, formData) : undefined
    };

    setResults(analysisResults);
    setCurrentAnalysis(analysis);
    setShowResults(true);
    setShowAIInsights(isAI);
    setIsLoading(false);
  };

  const saveAnalysis = () => {
    if (!currentAnalysis) return;

    try {
      const saved = [...savedAnalyses, currentAnalysis];
      localStorage.setItem('telecomAnalyses', JSON.stringify(saved));
      setSavedAnalyses(saved);
      alert('Análise salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar análise:', error);
      alert('Erro ao salvar análise.');
    }
  };

  const generatePDF = async () => {
    if (!reportRef.current || !currentAnalysis) return;

    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      const dateStr = new Date(currentAnalysis.timestamp).toLocaleDateString('pt-BR').replace(/\//g, '-');
      pdf.save(`relatorio-analise-${dateStr}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF.');
    }
  };

  const chartData = {
    labels: results.map(r => r.competitor),
    datasets: [
      {
        label: 'Valor da Mensalidade (R$)',
        data: results.map(r => r.price),
        backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'],
        borderRadius: 5,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Analisador de Concorrência Telecom
          </h1>
          <p className="text-md text-gray-600 dark:text-gray-400 mt-2">
            Compare preços e condições dos principais players do mercado.
          </p>
        </header>

        {/* Formulário de Análise */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Produto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Produto
              </label>
              <select
                value={formData.product}
                onChange={(e) => setFormData({...formData, product: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Internet Fibra">Internet Fibra</option>
                <option value="Internet Radio">Internet Rádio</option>
                <option value="Internet Man">Internet Man (Metro Ethernet)</option>
                <option value="Dupla abordagem (Fibra mais Radio)">Dupla abordagem (Fibra + Rádio)</option>
              </select>
            </div>

            {/* Velocidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Velocidade (em Mbps)
              </label>
              <input
                type="number"
                value={formData.speed}
                onChange={(e) => setFormData({...formData, speed: parseInt(e.target.value) || 0})}
                placeholder="Ex: 100"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                value={formData.state}
                onChange={(e) => {
                  setFormData({...formData, state: e.target.value, city: ''});
                }}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione um Estado</option>
                {Object.keys(citiesByState).map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Cidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cidade
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                disabled={!formData.state}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Selecione uma Cidade</option>
                {formData.state && citiesByState[formData.state]?.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Tipo de Conexão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Conexão
              </label>
              <select
                value={formData.connectionType}
                onChange={(e) => setFormData({...formData, connectionType: e.target.value})}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ADSL">Padrão (ADSL/DHCP)</option>
                <option value="IP dedicado">IP dedicado</option>
              </select>
            </div>

            {/* Prazo do Contrato */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prazo do Contrato (meses)
              </label>
              <select
                value={formData.contractTerm}
                onChange={(e) => setFormData({...formData, contractTerm: parseInt(e.target.value)})}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={12}>12 meses</option>
                <option value={24}>24 meses</option>
                <option value={36}>36 meses</option>
                <option value={48}>48 meses</option>
                <option value={60}>60 meses</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => performAnalysis(false)}
              disabled={isLoading}
              className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analisando...' : 'Analisar Mercado'}
            </button>
            <button
              onClick={() => performAnalysis(true)}
              disabled={isLoading}
              className="w-full sm:w-auto bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Analisando com IA...' : 'Análise com IA'}
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center my-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              {showAIInsights ? 'Analisando dados com IA...' : 'Realizando busca inteligente de preços...'}
            </p>
          </div>
        )}

        {/* Resultados */}
        {showResults && results.length > 0 && (
          <div ref={reportRef}>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              Resultados da Análise
            </h2>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {
                (() => {
                  const prices = results.map(r => r.price);
                  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
                  const minResult = results.reduce((prev, curr) => prev.price < curr.price ? prev : curr);
                  const maxResult = results.reduce((prev, curr) => prev.price > curr.price ? prev : curr);

                  const cards = [
                    { title: 'Preço Médio Mensal', value: `R$ ${avgPrice.toFixed(2)}`, color: 'blue' },
                    { title: 'Menor Mensalidade', value: `R$ ${minResult.price.toFixed(2)}`, subtitle: minResult.competitor, color: 'green' },
                    { title: 'Maior Mensalidade', value: `R$ ${maxResult.price.toFixed(2)}`, subtitle: maxResult.competitor, color: 'red' },
                    { title: 'Concorrentes', value: results.length.toString(), color: 'indigo' }
                  ];

                  return cards.map((card, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle>{card.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className={`text-3xl font-bold text-${card.color}-600 dark:text-${card.color}-400 mt-1`}>
                          {card.value}
                        </p>
                        {card.subtitle && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{card.subtitle}</p>
                        )}
                      </CardContent>
                    </Card>
                  ));
                })()
              }
            </div>

            {/* Tabela e Gráfico */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tabela */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Tabela Comparativa
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <th className="p-3 font-semibold">Concorrente</th>
                        <th className="p-3 font-semibold">Mensalidade</th>
                        <th className="p-3 font-semibold">Tx. Instalação</th>
                        <th className="p-3 font-semibold">Custo 1º Ano</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="p-3 font-medium">{result.competitor}</td>
                          <td className="p-3">R$ {result.price.toFixed(2)}</td>
                          <td className="p-3">R$ {result.installationFee.toFixed(2)}</td>
                          <td className="p-3 font-semibold">R$ {result.totalFirstYear.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Gráfico */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Gráfico de Mensalidades (R$)
                </h3>
                <div className="h-64">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Insights da IA */}
            {showAIInsights && currentAnalysis?.aiInsights && (
              <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                  <svg className="w-6 h-6 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  Análise e Insights da IA
                </h3>
                <div className="text-gray-700 dark:text-gray-300 space-y-4">
                  {currentAnalysis.aiInsights.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">
                      {paragraph.split('**').map((text, i) => 
                        i % 2 === 1 ? <strong key={i}>{text}</strong> : text
                      )}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="text-center mt-8 space-x-4">
              <button
                onClick={saveAnalysis}
                className="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition transform hover:scale-105"
              >
                Salvar Análise
              </button>
              <button
                onClick={generatePDF}
                className="bg-red-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition transform hover:scale-105"
              >
                Gerar PDF
              </button>
            </div>
          </div>
        )}

        {/* Análises Salvas */}
        {savedAnalyses.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mt-10">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Análises de Mercado Salvas
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <th className="p-3 font-semibold">Data</th>
                    <th className="p-3 font-semibold">Produto</th>
                    <th className="p-3 font-semibold">Velocidade</th>
                    <th className="p-3 font-semibold">Local</th>
                    <th className="p-3 font-semibold">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {savedAnalyses.map((analysis, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="p-3">{new Date(analysis.timestamp).toLocaleDateString('pt-BR')}</td>
                      <td className="p-3">{analysis.params.product}</td>
                      <td className="p-3">{analysis.params.speed} Mbps</td>
                      <td className="p-3">{analysis.params.city} - {analysis.params.state}</td>
                      <td className="p-3">
                        {analysis.isAI && (
                          <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                            [IA]
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
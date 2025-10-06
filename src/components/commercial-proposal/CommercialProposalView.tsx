"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Download, Printer } from 'lucide-react';

interface CommercialProposalViewProps {
  partners: any[];
  proposal?: any;
}

const CommercialProposalView: React.FC<CommercialProposalViewProps> = ({ partners, proposal }) => {
  console.log('\n\n=========== DEBUG PROPOSAL OBJECT ===========');
  console.log(JSON.stringify(proposal, null, 2));
  console.log('===========================================\n\n');
  const [proposalData, setProposalData] = useState({
    // Suporte para múltiplas estruturas de dados:
    // 1. Calculadoras salvam: clientData (objeto) e accountManagerData (objeto)
    // 2. Mock API usa: client (objeto) e accountManager (objeto)  
    // 3. Supabase armazena: client_data e account_manager (com underscore)
    clientName: proposal?.clientData?.name || proposal?.clientData?.companyName || 
                proposal?.client_data?.name || proposal?.client_data?.companyName || '',
    clientProject: proposal?.clientData?.projectName || proposal?.client_data?.projectName || '',
    clientEmail: proposal?.clientData?.email || proposal?.client_data?.email || '',
    clientPhone: proposal?.clientData?.phone || proposal?.client_data?.phone || '',
    clientContact: proposal?.clientData?.contact || proposal?.client_data?.contact || '',
    accountManagerName: proposal?.accountManager?.name || proposal?.accountManagerData?.name || 
                        (typeof proposal?.accountManager === 'string' ? proposal?.accountManager : '') || '',
    accountManagerEmail: proposal?.accountManager?.email || proposal?.accountManagerData?.email || '',
    accountManagerPhone: proposal?.accountManager?.phone || proposal?.accountManagerData?.phone || '',
    date: proposal?.date || new Date().toLocaleDateString('pt-BR'),
    productType: proposal?.type || 'Máquinas Virtuais',
    serviceImage: null as string | null,
    logoImage: null as string | null
  });

  const [showForm, setShowForm] = useState(false);

  const productTypes = ['Máquinas Virtuais', 'Datacenter', 'Firewall', 'Cloud', 'Segurança', 'Rede', 'Internet Fibra', 'PABX SIP'];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implementar download da proposta
    console.log('Download da proposta');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProposalData(prev => ({ ...prev, serviceImage: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProposalData(prev => ({ ...prev, logoImage: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Proposta Comercial</h2>
          <p className="text-muted-foreground">
            Gere propostas comerciais personalizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Ocultar Formulário' : 'Editar Dados'}
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="no-print">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <Input
                  id="clientName"
                  value={proposalData.clientName}
                  onChange={(e) => setProposalData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Digite o nome do cliente"
                />
              </div>
              <div>
                <Label htmlFor="clientProject">Projeto</Label>
                <Input
                  id="clientProject"
                  value={proposalData.clientProject}
                  onChange={(e) => setProposalData(prev => ({ ...prev, clientProject: e.target.value }))}
                  placeholder="Nome do projeto"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email do Cliente</Label>
                <Input
                  id="clientEmail"
                  value={proposalData.clientEmail}
                  onChange={(e) => setProposalData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  placeholder="email@cliente.com"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Telefone do Cliente</Label>
                <Input
                  id="clientPhone"
                  value={proposalData.clientPhone}
                  onChange={(e) => setProposalData(prev => ({ ...prev, clientPhone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="clientContact">Contato</Label>
                <Input
                  id="clientContact"
                  value={proposalData.clientContact}
                  onChange={(e) => setProposalData(prev => ({ ...prev, clientContact: e.target.value }))}
                  placeholder="Nome do contato"
                />
              </div>
              <div>
                <Label htmlFor="accountManagerName">Gerente de Contas</Label>
                <Input
                  id="accountManagerName"
                  value={proposalData.accountManagerName}
                  onChange={(e) => setProposalData(prev => ({ ...prev, accountManagerName: e.target.value }))}
                  placeholder="Nome do gerente"
                />
              </div>
              <div>
                <Label htmlFor="accountManagerEmail">Email do Gerente</Label>
                <Input
                  id="accountManagerEmail"
                  value={proposalData.accountManagerEmail}
                  onChange={(e) => setProposalData(prev => ({ ...prev, accountManagerEmail: e.target.value }))}
                  placeholder="gerente@empresa.com"
                />
              </div>
              <div>
                <Label htmlFor="accountManagerPhone">Telefone do Gerente</Label>
                <Input
                  id="accountManagerPhone"
                  value={proposalData.accountManagerPhone}
                  onChange={(e) => setProposalData(prev => ({ ...prev, accountManagerPhone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={proposalData.date}
                  onChange={(e) => setProposalData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="productType">Tipo de Produto</Label>
                <Select 
                  value={proposalData.productType} 
                  onValueChange={(value) => setProposalData(prev => ({ ...prev, productType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Campo de upload de imagem */}
            <div className="mt-4">
              <Label htmlFor="serviceImage">Imagem do Serviço</Label>
              <div className="mt-2">
                <Input
                  id="serviceImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Selecione uma imagem do serviço vendido (JPG, PNG, etc.)
                </p>
              </div>
            </div>
            
            {/* Campo de upload do logo */}
            <div className="mt-4">
              <Label htmlFor="logoImage">Logo da Empresa</Label>
              <div className="mt-2">
                <Input
                  id="logoImage"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Selecione o logo da empresa (JPG, PNG, etc.)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proposta Comercial - Página 1 */}
      <div className="proposal-page bg-white border rounded-lg shadow-lg print:shadow-none print:border-none" style={{ 
        width: '210mm', 
        height: '297mm', 
        margin: '0 auto',
        pageBreakAfter: 'always',
        pageBreakInside: 'avoid'
      }}>
        <div className="relative h-full w-full" style={{
          backgroundImage: `url('https://st4.depositphotos.com/1025323/27146/i/450/depositphotos_271460380-stock-photo-perspectives-of-virtual-world.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          
          {/* Overlay escuro para melhorar legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-800/80"></div>
          
          {/* Padrão de grade sutil sobre a imagem */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}></div>
          </div>

          {/* Logo no canto superior direito */}
          <div className="absolute top-8 right-8">
            <div className="bg-blue-900 border-2 border-white rounded-lg p-4 w-40 h-40 flex flex-col items-center justify-center overflow-hidden">
              {proposalData.logoImage ? (
                // Logo carregado pelo usuário
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src={proposalData.logoImage} 
                    alt="Logo da Empresa"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                // Logo padrão "double"
                <>
                  {/* Ícone de elos de corrente */}
                  <div className="flex items-center justify-center mb-1">
                    <div className="w-4 h-4 border-2 border-white rounded-full mr-1"></div>
                    <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="text-white font-bold text-lg">double</div>
                  <div className="text-white text-xs">ti + telecom</div>
                </>
              )}
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="p-12 text-white">
            {/* Título Principal */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-blue-200 leading-tight">
                Proposta<br />Comercial
              </h1>
            </div>

            {/* Informações do Cliente */}
            <div className="mb-8">
              <div className="text-xl mb-2">{proposalData.clientName || 'Nome do Cliente'}</div>
              <div className="text-lg opacity-90">{proposalData.date}</div>
              {proposalData.clientProject && (
                <div className="text-md opacity-80 mt-1">Projeto: {proposalData.clientProject}</div>
              )}
            </div>

            {/* Linha divisória */}
            <div className="border-t border-white opacity-30 mb-8"></div>

            {/* Produto */}
            <div className="space-y-4">
              <div className="text-xl font-semibold mb-4">Produto:</div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-blue-900" />
                </div>
                <span className="text-lg font-semibold">{proposalData.productType}</span>
              </div>
            </div>

            {/* Linha divisória */}
            <div className="border-t border-white opacity-30 mt-8"></div>
          </div>

          {/* Imagem do Serviço */}
          <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2">
            <div className="w-[500px] h-[375px] bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg border-2 border-white overflow-hidden">
              {proposalData.serviceImage ? (
                // Imagem carregada pelo usuário
                <div className="h-full w-full relative">
                  <img 
                    src={proposalData.serviceImage} 
                    alt="Imagem do Serviço"
                    className="h-full w-full object-cover"
                  />
                  {/* Overlay com texto sobre a imagem */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end">
                    <div className="text-center text-white p-4 w-full">
                      <div className="text-2xl font-bold mb-2">{proposalData.productType}</div>
                      <div className="text-sm opacity-90">Infraestrutura de Alta Tecnologia</div>
                    </div>
                  </div>
                </div>
              ) : (
                // Simulação padrão do datacenter
                <div className="h-full bg-gradient-to-b from-blue-500 to-blue-700 flex items-center justify-center relative">
                  {/* Simulação de corredor de datacenter com racks de servidor */}
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-600 to-blue-800">
                    {/* Racks de servidor à esquerda */}
                    <div className="absolute left-2 top-2 w-1 h-44 bg-blue-300 opacity-80"></div>
                    <div className="absolute left-4 top-2 w-1 h-44 bg-blue-300 opacity-80"></div>
                    <div className="absolute left-6 top-2 w-1 h-44 bg-blue-300 opacity-80"></div>
                    <div className="absolute left-8 top-2 w-1 h-44 bg-blue-300 opacity-80"></div>
                    <div className="absolute left-10 top-2 w-1 h-44 bg-blue-300 opacity-80"></div>
                    
                    {/* Racks de servidor à direita */}
                    <div className="absolute right-2 top-2 w-1 h-44 bg-blue-300 opacity-80"></div>
                    <div className="absolute right-4 top-2 w-1 h-44 bg-blue-300 opacity-80"></div>
                    <div className="absolute right-6 top-2 w-1 h-44 bg-blue-300 opacity-80"></div>
                    <div className="absolute right-8 top-2 w-1 h-44 bg-blue-300 opacity-80"></div>
                    <div className="absolute right-10 top-2 w-1 h-44 bg-blue-300 opacity-80"></div>
                    
                    {/* Luzes azuis nos racks */}
                    <div className="absolute left-3 top-8 w-1 h-1 bg-blue-200 rounded-full animate-pulse"></div>
                    <div className="absolute left-5 top-12 w-1 h-1 bg-blue-200 rounded-full animate-pulse"></div>
                    <div className="absolute left-7 top-16 w-1 h-1 bg-blue-200 rounded-full animate-pulse"></div>
                    <div className="absolute left-9 top-20 w-1 h-1 bg-blue-200 rounded-full animate-pulse"></div>
                    
                    <div className="absolute right-3 top-8 w-1 h-1 bg-blue-200 rounded-full animate-pulse"></div>
                    <div className="absolute right-5 top-12 w-1 h-1 bg-blue-200 rounded-full animate-pulse"></div>
                    <div className="absolute right-7 top-16 w-1 h-1 bg-blue-200 rounded-full animate-pulse"></div>
                    <div className="absolute right-9 top-20 w-1 h-1 bg-blue-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="text-center text-white relative z-10">
                    <div className="text-2xl font-bold mb-2">{proposalData.productType}</div>
                    <div className="text-sm opacity-80">Infraestrutura de Alta Tecnologia</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QR Code e Contato */}
          <div className="absolute bottom-8 left-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                {/* QR Code simulado */}
                <div className="w-12 h-12 bg-gray-800 rounded grid grid-cols-8 grid-rows-8 gap-0.5 p-1">
                  {/* Padrão de QR Code */}
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  
                  <div className="bg-white"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  
                  <div className="bg-white"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-white"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-white"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  
                  <div className="bg-white"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-white"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-white"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  
                  <div className="bg-white"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-white"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-white"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  
                  <div className="bg-white"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-gray-800"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                </div>
              </div>
              <div className="text-white">
                <div className="font-semibold text-lg">Visite Nosso Site</div>
                <div className="text-sm opacity-90">www.doubletelecom.com.br</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda Página - Dados Detalhados */}
      <div className="proposal-page bg-white border rounded-lg shadow-lg print:shadow-none print:border-none mt-6" style={{ 
        width: '210mm', 
        height: '297mm', 
        margin: '0 auto',
        pageBreakAfter: 'always',
        pageBreakInside: 'avoid'
      }}>
        <div className="p-12 h-full">
          {/* Cabeçalho */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Proposta Comercial</h1>
              <p className="text-gray-600">{proposalData.productType}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Data: {proposalData.date}</div>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Dados do Cliente</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Nome:</strong> {proposalData.clientName || 'N/A'}</p>
              <p><strong>Projeto:</strong> {proposalData.clientProject || 'N/A'}</p>
              <p><strong>Email:</strong> {proposalData.clientEmail || 'N/A'}</p>
              <p><strong>Telefone:</strong> {proposalData.clientPhone || 'N/A'}</p>
              <p><strong>Contato:</strong> {proposalData.clientContact || 'N/A'}</p>
            </div>
          </div>

          {/* Gerente de Contas */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Gerente de Contas</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Nome:</strong> {proposalData.accountManagerName || 'N/A'}</p>
              <p><strong>Email:</strong> {proposalData.accountManagerEmail || 'N/A'}</p>
              <p><strong>Telefone:</strong> {proposalData.accountManagerPhone || 'N/A'}</p>
            </div>
          </div>

          {/* Produtos e Serviços */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Produtos e Serviços</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Descrição</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Setup</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Mensal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">{proposalData.productType}</td>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                  <td className="border border-gray-300 px-4 py-2">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Rodapé */}
          <div className="absolute bottom-12 left-12 right-12">
            <div className="border-t border-gray-300 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Double TI + Telecom</p>
                  <p className="text-sm text-gray-600">www.doubletelecom.com.br</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Página 2 de 2</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Navegação */}
      <div className="flex justify-center space-x-4 mt-6 no-print">
        <Button variant="outline" disabled>
          Página Anterior
        </Button>
        <span className="flex items-center px-4 py-2 bg-gray-100 rounded">
          Página 1 de 2
        </span>
        <Button variant="outline" disabled>
          Próxima Página
        </Button>
      </div>
    </div>
  );
};

export default CommercialProposalView;
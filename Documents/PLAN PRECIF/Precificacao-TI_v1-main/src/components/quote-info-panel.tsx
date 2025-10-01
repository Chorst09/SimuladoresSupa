"use client";

import type { ClientInfo, AccountManagerInfo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputField from './input-field';

interface QuoteInfoPanelProps {
  clientInfo: ClientInfo;
  setClientInfo: React.Dispatch<React.SetStateAction<ClientInfo>>;
  accountManagerInfo: AccountManagerInfo;
  setAccountManagerInfo: React.Dispatch<React.SetStateAction<AccountManagerInfo>>;
}

const QuoteInfoPanel = ({ clientInfo, setClientInfo, accountManagerInfo, setAccountManagerInfo }: QuoteInfoPanelProps) => (
  <Card className="shadow-lg">
    <CardHeader>
      <CardTitle className="font-headline text-2xl">Informações da Proposta</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold text-primary mb-3">Dados do Cliente</h3>
          <div className="space-y-4">
            <InputField label="Nome da Empresa Cliente" value={clientInfo.company} onChange={(e) => setClientInfo(p => ({ ...p, company: e.target.value }))} />
            <InputField label="Nome do Contato" value={clientInfo.name} onChange={(e) => setClientInfo(p => ({ ...p, name: e.target.value }))} />
            <InputField label="Telefone" value={clientInfo.phone} onChange={(e) => setClientInfo(p => ({ ...p, phone: e.target.value }))} />
            <InputField label="E-mail" value={clientInfo.email} onChange={(e) => setClientInfo(p => ({ ...p, email: e.target.value }))} />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-primary mb-3">Dados do Gerente de Contas</h3>
          <div className="space-y-4">
            <InputField label="Nome do Gerente" value={accountManagerInfo.name} onChange={(e) => setAccountManagerInfo(p => ({ ...p, name: e.target.value }))} />
            <InputField label="E-mail do Gerente" value={accountManagerInfo.email} onChange={(e) => setAccountManagerInfo(p => ({ ...p, email: e.target.value }))} />
            <InputField label="Telefone do Gerente" value={accountManagerInfo.phone} onChange={(e) => setAccountManagerInfo(p => ({ ...p, phone: e.target.value }))} />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default QuoteInfoPanel;

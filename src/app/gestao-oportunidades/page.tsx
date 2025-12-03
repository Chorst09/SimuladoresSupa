import GestaoOportunidadesParceiros from '@/components/gestao-oportunidades/GestaoOportunidadesParceiros';
import AccessControl from '@/components/shared/AccessControl';

export const metadata = {
  title: 'Gestão de Oportunidades - Parceiros',
  description: 'Sistema para gestão de oportunidades de parceiros como Dell, Lenovo, HP, etc.',
};

export default function GestaoOportunidadesPage() {
  return (
    <AccessControl
      allowedRoles={['admin', 'diretor']}
      fallbackMessage="O sistema de Gestão de Oportunidades de Parceiros é restrito a Administradores e Diretores."
    >
      <GestaoOportunidadesParceiros />
    </AccessControl>
  );
}

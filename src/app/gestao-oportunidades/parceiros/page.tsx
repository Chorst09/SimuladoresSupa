import GestaoOportunidadesParceiros from '@/components/gestao-oportunidades/GestaoOportunidadesParceiros';
import AccessControl from '@/components/shared/AccessControl';

export const metadata = {
  title: 'Gestão de Oportunidades - Parceiros',
  description: 'Sistema para gestão de oportunidades de parceiros como Dell, Lenovo, HP, etc.',
};

export default function GestaoOportunidadesParceiroPage() {
  return (
    <AccessControl
      allowedRoles={['admin', 'diretor', 'user', 'vendedor', 'gerente']}
      fallbackMessage="Você precisa estar logado para acessar a Gestão de Oportunidades."
    >
      <GestaoOportunidadesParceiros />
    </AccessControl>
  );
}

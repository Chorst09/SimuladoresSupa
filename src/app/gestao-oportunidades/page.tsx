import GestaoOportunidades from '@/components/gestao-oportunidades/GestaoOportunidades'
import AccessControl from '@/components/shared/AccessControl'

export default function GestaoOportunidadesPage() {
  return (
    <AccessControl 
      allowedRoles={['admin', 'director']}
      fallbackMessage="O sistema de Gestão de Oportunidades é restrito a Administradores e Diretores."
    >
      <GestaoOportunidades />
    </AccessControl>
  )
}

export const metadata = {
  title: 'Sistema de Gestão de Oportunidades',
  description: 'Sistema completo para gestão de oportunidades de negócio, clientes e fornecedores',
}
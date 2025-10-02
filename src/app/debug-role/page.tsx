import UserRoleDebug from '@/components/debug/UserRoleDebug'

export default function DebugRolePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <UserRoleDebug />
    </div>
  )
}

export const metadata = {
  title: 'Debug - Role do Usuário',
  description: 'Página de debug para verificar o role do usuário logado',
}
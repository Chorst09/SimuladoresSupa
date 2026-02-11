/**
 * Configuração de Permissões por Função
 * 
 * Define quais funcionalidades cada função de usuário pode acessar
 */

export type UserRole = 'admin' | 'director' | 'user' | 'seller' | 'gerente' | 'pending';

export interface RolePermissions {
  canAccessCalculators: boolean;
  canViewAllProposals: boolean;
  canViewOwnProposals: boolean;
  canCreateProposals: boolean;
  canEditProposals: boolean;
  canDeleteProposals: boolean;
  canAccessAdmin: boolean;
  canManageUsers: boolean;
  canEditCommissions: boolean;
  canAccessGestaoOportunidades: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canAccessCalculators: true,
    canViewAllProposals: true,
    canViewOwnProposals: true,
    canCreateProposals: true,
    canEditProposals: true,
    canDeleteProposals: true,
    canAccessAdmin: true,
    canManageUsers: true,
    canEditCommissions: true,
    canAccessGestaoOportunidades: true,
  },
  director: {
    canAccessCalculators: true,
    canViewAllProposals: true,  // Diretor pode visualizar TODAS as propostas
    canViewOwnProposals: true,
    canCreateProposals: false,
    canEditProposals: false,
    canDeleteProposals: false,
    canAccessAdmin: false,
    canManageUsers: false,
    canEditCommissions: false,
    canAccessGestaoOportunidades: false,
  },
  user: {
    canAccessCalculators: true,
    canViewAllProposals: false,
    canViewOwnProposals: true,  // Usuário pode visualizar APENAS suas próprias propostas
    canCreateProposals: true,
    canEditProposals: true,
    canDeleteProposals: true,
    canAccessAdmin: false,
    canManageUsers: false,
    canEditCommissions: false,
    canAccessGestaoOportunidades: false,
  },
  seller: {
    canAccessCalculators: true,
    canViewAllProposals: true,
    canViewOwnProposals: true,
    canCreateProposals: true,
    canEditProposals: true,
    canDeleteProposals: true,
    canAccessAdmin: false,
    canManageUsers: false,
    canEditCommissions: false,
    canAccessGestaoOportunidades: true,
  },
  gerente: {
    canAccessCalculators: true,
    canViewAllProposals: true,
    canViewOwnProposals: true,
    canCreateProposals: true,
    canEditProposals: true,
    canDeleteProposals: true,
    canAccessAdmin: false,
    canManageUsers: false,
    canEditCommissions: false,
    canAccessGestaoOportunidades: true,
  },
  pending: {
    canAccessCalculators: false,
    canViewAllProposals: false,
    canViewOwnProposals: false,
    canCreateProposals: false,
    canEditProposals: false,
    canDeleteProposals: false,
    canAccessAdmin: false,
    canManageUsers: false,
    canEditCommissions: false,
    canAccessGestaoOportunidades: false,
  },
};

/**
 * Obtém as permissões para uma função específica
 */
export function getPermissionsForRole(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.pending;
}

/**
 * Verifica se um usuário pode acessar uma funcionalidade
 */
export function canUserAccess(role: UserRole, permission: keyof RolePermissions): boolean {
  const permissions = getPermissionsForRole(role);
  return permissions[permission] || false;
}

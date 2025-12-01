'use client';

// Fixed CSS class names - force Vercel rebuild
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { useUserProfile, UserRole } from '@/hooks/use-user-profile';
import { Users, UserPlus, Shield, Trash2, Edit, Crown, User, Briefcase, UserCheck, UserX, Loader2 } from 'lucide-react';

// Extended UserProfile interface to include password_changed
interface ExtendedUserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole | 'pending' | 'seller';
  created_at?: string;
  updated_at?: string;
  password_changed?: boolean;
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { isAdmin } = useUserProfile();
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ExtendedUserProfile | null>(null);

  // Form states
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);



  const loadUsers = async () => {
    try {
      console.log('🔄 Carregando usuários via API...');
      setLoading(true);

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();

      // Use the new API endpoint that bypasses RLS
      const response = await fetch(`/api/users?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      const result = await response.json();

      console.log('📊 Resposta da API (timestamp:', timestamp, '):', result);

      if (!result.success) {
        // Handle RLS blocking specifically
        if (result.needsRlsFix) {
          alert('🚨 Políticas RLS estão bloqueando o acesso aos usuários.\n\nClique no botão "🚨 Corrigir RLS" para resolver este problema.');
          setUsers([]);
          return;
        }
        throw new Error(result.error || 'Erro ao carregar usuários');
      }

      if (!result.users || result.users.length === 0) {
        console.log('⚠️ Nenhum usuário encontrado');
        setUsers([]);
        return;
      }

      // Mapear para ExtendedUserProfile
      const mappedUsers: ExtendedUserProfile[] = result.users.map((user: any) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name || user.email,
        role: user.role as UserRole | 'pending' | 'seller',
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
        password_changed: user.password_changed !== false
      }));

      setUsers(mappedUsers);
      console.log(`✅ ${mappedUsers.length} usuários carregados via API:`, mappedUsers);

      // Debug: Show detailed user info
      console.log('🔍 DETALHES DOS USUÁRIOS CARREGADOS:');
      mappedUsers.forEach((user, index) => {
        console.log(`👤 Usuário ${index + 1}:`, {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          created_at: user.created_at
        });
      });

    } catch (error: any) {
      console.error('❌ Erro ao carregar usuários via API:', error);
      setError('Erro ao carregar usuários: ' + error.message);
      setUsers([]);

    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    setAddUserError(null);

    if (!newUserEmail || !newUserPassword) {
      alert('Erro: Email e senha são obrigatórios.');
      return;
    }

    if (!newUserName) {
      alert('Erro: Nome completo é obrigatório.');
      return;
    }

    try {
      setIsSaving(true);
      console.log('🔄 Criando usuário via API signup...');

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          full_name: newUserName,
          role: newUserRole
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar usuário');
      }

      alert('✅ Usuário criado com sucesso!\n\nO usuário pode fazer login imediatamente.');

      // Reset form
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserName('');
      setNewUserRole('user');
      setIsAddDialogOpen(false);

      // Reload users with a small delay to ensure database consistency
      console.log('🔄 Recarregando lista de usuários...');
      setTimeout(async () => {
        await loadUsers();
        console.log('✅ Lista de usuários recarregada');
      }, 1000);

    } catch (error: any) {
      console.error('❌ Erro ao criar usuário:', error);

      let description = error.message || 'Não foi possível criar o usuário.';
      if (error.message.includes('User already registered') || error.message.includes('já existe')) {
        description = 'Este email já está em uso. Tente usar outro email.';
      } else if (error.message.includes('Invalid email') || error.message.includes('inválido')) {
        description = 'Email inválido. Verifique e tente novamente.';
      } else if (error.message.includes('Password should be at least') || error.message.includes('pelo menos 6')) {
        description = 'Senha fraca. Use uma senha com pelo menos 6 caracteres.';
      }

      alert(`❌ Erro: ${description}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;

    try {
      setIsSaving(true);
      console.log('🔄 Atualizando usuário via API:', editingUser);

      const response = await fetch(`/api/profiles/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: editingUser.full_name,
          role: editingUser.role
        })
      });

      const result = await response.json();

      console.log('📊 Resposta da API de atualização:', result);

      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar usuário');
      }

      console.log('✅ Usuário atualizado no servidor:', result.data);

      setIsEditDialogOpen(false);
      setEditingUser(null);
      
      // Reload users
      console.log('🔄 Recarregando lista de usuários...');
      await loadUsers();
      console.log('✅ Lista recarregada');
      
      alert('✅ Usuário atualizado com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao atualizar usuário:', error);
      alert(`Erro: ${error?.message || 'Não foi possível atualizar o usuário.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${userEmail}?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      setDeletingUserId(userId);
      console.log('🗑️ Excluindo usuário via API:', userId);

      const response = await fetch(`/api/profiles/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao excluir usuário');
      }

      alert('✅ Usuário excluído com sucesso!');
      
      // Reload users
      await loadUsers();
    } catch (error: any) {
      console.error('❌ Erro ao excluir usuário:', error);
      alert(`Erro: ${error?.message || 'Não foi possível excluir o usuário.'}`);
    } finally {
      setDeletingUserId(null);
    }
  };

  // TEMPORÁRIO: Remover verificação de admin para debug
  // if (!isAdmin) {
  //   return (
  //     <Card className="max-w-md mx-auto mt-8">
  //       <CardContent className="text-center py-8">
  //         <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
  //         <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
  //         <p className="text-muted-foreground">
  //           Você precisa ser administrador para acessar esta página.
  //         </p>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando usuários...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, permissões e acessos do sistema
          </p>
        </div>

        <div className="flex space-x-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="usuario@exemplo.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha (mínimo 6 caracteres)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Nome completo do usuário"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Função</Label>
                  <Select value={newUserRole} onValueChange={(value: UserRole) => setNewUserRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="director">Diretor</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddUser} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Criar Usuário'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => window.open('/signup', '_blank')}
          >
            📝 Cadastro Público
          </Button>

          <Button
            variant="outline"
            onClick={async () => {
              console.log('🔍 Executando debug de usuários...');
              try {
                const response = await fetch('/api/debug-users');
                const result = await response.json();
                console.log('🔍 RESULTADO DEBUG COMPLETO:', result);

                // Show detailed info in alert
                let message = '🔍 RESULTADO DEBUG:\n\n';

                if (result.results?.anonKey) {
                  message += `📊 Anon Key: ${result.results.anonKey.count} usuários\n`;
                  if (result.results.anonKey.users) {
                    result.results.anonKey.users.forEach((user: any, i: number) => {
                      message += `  ${i + 1}. ${user.email} (${user.role})\n`;
                    });
                  }
                  message += '\n';
                }

                if (result.results?.serviceKey) {
                  message += `🔑 Service Key: ${result.results.serviceKey.count} usuários\n`;
                  if (result.results.serviceKey.users) {
                    result.results.serviceKey.users.forEach((user: any, i: number) => {
                      message += `  ${i + 1}. ${user.email} (${user.role})\n`;
                    });
                  }
                  message += '\n';
                }

                if (result.results?.authUsers) {
                  message += `🔐 Auth Users: ${result.results.authUsers.count} usuários\n`;
                  if (result.results.authUsers.users) {
                    result.results.authUsers.users.forEach((user: any, i: number) => {
                      message += `  ${i + 1}. ${user.email}\n`;
                    });
                  }
                }

                message += '\n📋 Verifique o console para detalhes completos!';

                alert(message);
              } catch (error) {
                console.error('❌ Erro no debug:', error);
                alert('Erro no debug. Verifique o console.');
              }
            }}
          >
            🔍 Debug Usuários
          </Button>

          <Button
            variant="outline"
            onClick={async () => {
              console.log('📋 Mostrando informações do PostgreSQL...');

              const info = `
📊 INFORMAÇÕES DO POSTGRESQL:

🔗 Banco: PostgreSQL via Docker
🔧 ORM: Prisma
📋 ONDE VERIFICAR:
1. Execute: docker ps (verificar container)
2. Execute: npx prisma studio (interface web)
3. Vá em: http://localhost:5555
4. Procure pela tabela "profiles" (não "users")
5. Os usuários devem estar lá

🔍 TABELAS PARA VERIFICAR:
• "profiles" - Dados dos usuários da aplicação
• "auth.users" - Usuários de autenticação (aba Authentication > Users)

⚠️ IMPORTANTE:
Se você está olhando "auth.users", os dados podem ser diferentes.
A aplicação usa a tabela "profiles" para mostrar os usuários.
              `;

              console.log(info);
              alert(info);
            }}
          >
            📋 Info PostgreSQL
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Usuários do Sistema ({users.length})
          </CardTitle>
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
            💡 <strong>Dica:</strong> Se houver limite de criação de usuários, use o botão &quot;📝 Cadastro Público&quot;
            para que os usuários se cadastrem diretamente e depois aprove-os aqui.
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.full_name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {user.role === 'admin' ? (
                        <Shield className="h-4 w-4 mr-1 text-orange-500" />
                      ) : user.role === 'director' ? (
                        <Crown className="h-4 w-4 mr-1 text-purple-500" />
                      ) : (
                        <User className="h-4 w-4 mr-1 text-blue-500" />
                      )}
                      {user.role === 'admin' ? 'Administrador' :
                        user.role === 'director' ? 'Diretor' : 'Usuário'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.created_at ?
                      new Date(user.created_at).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.email !== currentUser?.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          disabled={deletingUserId === user.id}
                        >
                          {deletingUserId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  value={editingUser.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editingUser.full_name || ''}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    full_name: e.target.value
                  })}
                  placeholder="Nome do usuário"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Função</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value: UserRole | 'pending' | 'seller') =>
                    setEditingUser({ ...editingUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="director">Diretor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
                  Cancelar
                </Button>
                <Button onClick={handleEditUser} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
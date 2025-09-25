'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Table, Users, FileText, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not admin
  React.useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const adminModules = [
    {
      title: 'Tabelas de Comissões',
      description: 'Gerenciar e editar tabelas de comissões para calculadoras',
      icon: <Table className="h-8 w-8" />,
      href: '/admin/commission-tables',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Gerenciamento de Usuários',
      description: 'Administrar usuários e permissões do sistema',
      icon: <Users className="h-8 w-8" />,
      href: '/admin/users',
      color: 'from-green-500 to-green-600',
      disabled: true
    },
    {
      title: 'Relatórios',
      description: 'Visualizar relatórios e estatísticas do sistema',
      icon: <BarChart3 className="h-8 w-8" />,
      href: '/admin/reports',
      color: 'from-purple-500 to-purple-600',
      disabled: true
    },
    {
      title: 'Configurações',
      description: 'Configurações gerais do sistema',
      icon: <Settings className="h-8 w-8" />,
      href: '/admin/settings',
      color: 'from-orange-500 to-orange-600',
      disabled: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Painel de Administração</h1>
          <p className="text-slate-300">Gerencie as configurações e dados do sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module) => (
            <Card 
              key={module.title} 
              className={`bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-all duration-200 ${
                module.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${module.color} flex items-center justify-center text-white mb-4`}>
                  {module.icon}
                </div>
                <CardTitle className="text-white">{module.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">{module.description}</p>
                {module.disabled ? (
                  <Button disabled className="w-full">
                    Em breve
                  </Button>
                ) : (
                  <Link href={module.href}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                      Acessar
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
                <div>
                  <p className="text-sm text-slate-400">Usuário Logado</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Nível de Acesso</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Última Atualização</p>
                  <p className="font-medium">{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
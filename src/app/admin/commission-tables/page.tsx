'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, Edit, Eye } from 'lucide-react';
import CommissionTablesUnified from '@/components/calculators/CommissionTablesUnified';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function CommissionTablesAdmin() {
  const [isEditing, setIsEditing] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Card className="bg-slate-900/80 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Administração - Tabelas de Comissões</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-400">Visualizar</span>
                    <Switch
                      checked={isEditing}
                      onCheckedChange={setIsEditing}
                    />
                    <span className="text-sm text-slate-400">Editar</span>
                    <Edit className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-slate-300 space-y-2">
                <p>
                  {isEditing 
                    ? 'Modo de edição ativado. Clique nos valores para editá-los.'
                    : 'Modo de visualização. Ative o modo de edição para modificar os valores.'
                  }
                </p>
                {isEditing && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                    <p className="text-blue-200 text-sm">
                      <strong>Como editar:</strong> Clique em qualquer valor de comissão para editá-lo. 
                      Use Enter para salvar ou Escape para cancelar. As alterações são salvas automaticamente.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <CommissionTablesUnified editable={isEditing} />
      </div>
    </div>
  );
}
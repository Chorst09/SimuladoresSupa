'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabaseClient';
import { Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstLogin?: boolean;
  userEmail?: string;
}

export default function ChangePasswordModal({ 
  isOpen, 
  onClose, 
  isFirstLogin = false,
  userEmail 
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'A senha deve ter pelo menos 8 caracteres';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'A senha deve conter pelo menos uma letra minúscula';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'A senha deve conter pelo menos uma letra maiúscula';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'A senha deve conter pelo menos um número';
    }
    return null;
  };

  const handleChangePassword = async () => {
    setError(null);
    setLoading(true);

    try {
      // Validações
      if (!isFirstLogin && !currentPassword) {
        throw new Error('Senha atual é obrigatória');
      }

      if (!newPassword) {
        throw new Error('Nova senha é obrigatória');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      // Validar força da senha
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        throw new Error(passwordError);
      }

      if (isFirstLogin) {
        // Para primeiro login, usar signInWithPassword primeiro para validar a senha atual
        if (userEmail && currentPassword) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: currentPassword,
          });

          if (signInError) {
            throw new Error('Senha atual incorreta');
          }
        }
      }

      // Alterar a senha
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      // Se for primeiro login, marcar como senha alterada
      if (isFirstLogin) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ 
              password_changed: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
        }
      }

      alert('Senha alterada com sucesso!');
      onClose();
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      setError(error.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!isFirstLogin) {
      onClose();
    }
    // Se for primeiro login, não permitir fechar sem alterar a senha
  };

  return (
    <Dialog open={isOpen} onOpenChange={isFirstLogin ? undefined : handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {isFirstLogin ? 'Alterar Senha - Primeiro Acesso' : 'Alterar Senha'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isFirstLogin && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Por segurança, você deve alterar sua senha no primeiro acesso.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">
                {isFirstLogin ? 'Senha Temporária' : 'Senha Atual'}
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={isFirstLogin ? 'Digite a senha temporária' : 'Digite sua senha atual'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="new-password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 8 caracteres, com maiúscula, minúscula e número
              </p>
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            {!isFirstLogin && (
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancelar
              </Button>
            )}
            <Button 
              onClick={handleChangePassword} 
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabaseClient';
import { Lock, Eye, EyeOff, Shield, AlertTriangle } from 'lucide-react';

interface ForcePasswordChangeProps {
  onPasswordChanged: () => void;
}

export default function ForcePasswordChange({ onPasswordChanged }: ForcePasswordChangeProps) {
  const { user } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Senha deve conter pelo menos um número');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial');
    }
    
    return errors;
  };

  const handlePasswordChange = async () => {
    setError(null);
    
    if (!newPassword || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '));
      return;
    }
    
    setLoading(true);
    
    try {
      // Update password using Supabase Auth
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (passwordError) {
        throw passwordError;
      }
      
      // Update profile to mark password as changed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          password_changed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);
      
      if (profileError) {
        console.error('Erro ao atualizar profile:', profileError);
        // Don't throw error, password was changed successfully
      }
      
      // Call the callback to indicate password was changed
      onPasswordChanged();
      
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      setError(error.message || 'Erro ao alterar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/80 border-slate-700 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Alteração de Senha Obrigatória
          </CardTitle>
          <p className="text-slate-400 mt-2">
            Sua conta foi criada por um administrador. Por segurança, você deve alterar sua senha antes de continuar.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert className="bg-orange-900/20 border-orange-500/30">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-200">
              Esta é uma medida de segurança obrigatória para contas criadas por administradores.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password" className="text-white">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white pr-10"
                  placeholder="Digite sua nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="confirm-password" className="text-white">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white pr-10"
                  placeholder="Confirme sua nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-slate-400 space-y-1">
              <p>A senha deve conter:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Pelo menos 8 caracteres</li>
                <li>Uma letra maiúscula</li>
                <li>Uma letra minúscula</li>
                <li>Um número</li>
                <li>Um caractere especial (!@#$%^&*)</li>
              </ul>
            </div>
            
            {error && (
              <Alert className="bg-red-900/20 border-red-500/30">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <Button
              onClick={handlePasswordChange}
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
            >
              {loading ? (
                <>
                  <Lock className="h-4 w-4 mr-2 animate-spin" />
                  Alterando Senha...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Alterar Senha
                </>
              )}
            </Button>
          </div>
          
          <div className="text-center text-xs text-slate-500 mt-4">
            Após alterar sua senha, você será redirecionado para o sistema.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
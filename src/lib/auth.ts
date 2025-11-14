// import { query, transaction } from './database'; // Unused imports
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  role: string;
  full_name?: string;
}

export interface AuthResult {
  user: User | null;
  error: string | null;
}

// Função para hash de senha
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Função para verificar senha
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Função para gerar JWT
export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Função para verificar JWT
export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
}

// Função para fazer login
export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    console.log('🔐 Tentando fazer login:', email);
    
    const { prisma } = await import('./prisma');

    console.log('📊 Buscando usuário no banco...');
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return { user: null, error: 'Usuário não encontrado' };
    }

    console.log('✅ Usuário encontrado:', user.email);

    if (!user.encrypted_password) {
      console.log('❌ Senha não configurada para:', email);
      return { user: null, error: 'Senha não configurada' };
    }

    console.log('🔑 Verificando senha...');
    const isValidPassword = await verifyPassword(password, user.encrypted_password);

    if (!isValidPassword) {
      console.log('❌ Senha incorreta para:', email);
      return { user: null, error: 'Senha incorreta' };
    }

    console.log('✅ Login bem-sucedido:', email);

    const userData: User = {
      id: user.id,
      email: user.email,
      role: user.profile?.role || 'user',
      full_name: user.profile?.full_name
    };

    return { user: userData, error: null };
  } catch (error: any) {
    console.error('❌ Sign in error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return { user: null, error: `Erro interno: ${error.message}` };
  }
}

// Função para criar usuário
export async function signUp(email: string, password: string, fullName: string, role: string = 'user'): Promise<AuthResult> {
  try {
    const hashedPassword = await hashPassword(password);

    const { authService } = await import('./database');
    const result = await authService.createUser({
      email,
      encrypted_password: hashedPassword,
      full_name: fullName,
      role
    });

    const userData: User = {
      id: result.id,
      email: result.email,
      role: role,
      full_name: fullName
    };

    return { user: userData, error: null };
  } catch (error: unknown) {
    console.error('Sign up error:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') { // Prisma unique constraint violation
      return { user: null, error: 'Email já está em uso' };
    }

    return { user: null, error: 'Erro interno do servidor' };
  }
}

// Função para obter usuário atual
export async function getCurrentUser(token?: string): Promise<User | null> {
  try {
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return null;
    }

    // Buscar dados atualizados do usuário usando Prisma
    const { authService } = await import('./database');
    const user = await authService.findUserByEmail(decoded.email);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.profile?.role || user.user_compat?.role || 'user',
      full_name: user.profile?.full_name
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

// Função para fazer logout (será implementada nas API routes)
export async function signOut(): Promise<void> {
  // Esta função será implementada nas API routes que têm acesso aos cookies
  return;
}

// Função para verificar se o usuário tem permissão
export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// Função para obter usuário por ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const { prisma } = await import('./database');

    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true, user_compat: true }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.profile?.role || user.user_compat?.role || 'user',
      full_name: user.profile?.full_name
    };
  } catch (error) {
    console.error('Get user by ID error:', error);
    return null;
  }
}
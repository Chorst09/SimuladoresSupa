#!/usr/bin/env node

/**
 * Script para verificar se todas as variáveis de ambiente necessárias estão configuradas
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const optionalEnvVars = [
  'DIRECT_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NODE_ENV',
];

console.log('🔍 Verificando variáveis de ambiente...\n');

let hasErrors = false;

// Verificar variáveis obrigatórias
console.log('📋 Variáveis Obrigatórias:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: NÃO CONFIGURADA`);
    hasErrors = true;
  } else {
    // Mostrar apenas os primeiros e últimos caracteres para segurança
    const maskedValue = value.length > 20 
      ? `${value.substring(0, 10)}...${value.substring(value.length - 10)}`
      : '***';
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

console.log('\n📋 Variáveis Opcionais:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: não configurada (opcional)`);
  } else {
    const maskedValue = value.length > 20 
      ? `${value.substring(0, 10)}...${value.substring(value.length - 10)}`
      : value;
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

// Verificar formato da DATABASE_URL
console.log('\n🔍 Verificando formato da DATABASE_URL:');
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  if (dbUrl.includes('localhost')) {
    console.log('⚠️  DATABASE_URL aponta para localhost - isso só funciona em desenvolvimento');
  } else if (dbUrl.includes('supabase.com')) {
    console.log('✅ DATABASE_URL aponta para Supabase');
    
    if (dbUrl.includes(':6543')) {
      console.log('✅ Usando Transaction Mode (porta 6543) - Recomendado');
    } else if (dbUrl.includes(':5432')) {
      console.log('⚠️  Usando porta 5432 - Considere usar Transaction Mode (6543)');
    }
    
    if (dbUrl.includes('pgbouncer=true')) {
      console.log('✅ Connection pooling habilitado');
    } else {
      console.log('⚠️  Connection pooling não detectado - adicione ?pgbouncer=true');
    }
  } else {
    console.log('ℹ️  DATABASE_URL aponta para outro provedor');
  }
}

console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ Algumas variáveis obrigatórias não estão configuradas!');
  console.log('📖 Consulte CONFIGURAR_VERCEL.md para mais informações');
  process.exit(1);
} else {
  console.log('✅ Todas as variáveis obrigatórias estão configuradas!');
  process.exit(0);
}

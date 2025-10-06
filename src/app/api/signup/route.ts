import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Processando signup via API...');
    console.log('🔧 URL:', supabaseUrl);
    console.log('🔑 Service Key presente:', !!supabaseServiceKey);
    
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar cliente Supabase com service key para admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔐 Criando usuário usando Admin API...');
    
    // Usar Admin API para criar usuário
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Erro na criação do usuário:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (authData.user) {
      console.log('✅ Usuário criado no Auth, inserindo no profiles...');
      
      // Inserir usuário na tabela profiles
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          role: 'pending',
          full_name: fullName || email.split('@')[0],
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Erro ao inserir no profiles:', insertError);
        
        // Tentar inserção simples
        const { error: simpleInsertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            role: 'pending'
          });
        
        if (simpleInsertError) {
          console.error('❌ Erro mesmo com inserção simples:', simpleInsertError);
          return NextResponse.json(
            { error: 'Erro ao criar perfil do usuário' },
            { status: 500 }
          );
        }
      }

      console.log('✅ Usuário criado com sucesso!');
      
      return NextResponse.json({
        success: true,
        message: 'Usuário criado com sucesso',
        user: {
          id: authData.user.id,
          email: authData.user.email
        }
      });
    }

    return NextResponse.json(
      { error: 'Falha ao criar usuário' },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('❌ Erro geral no signup:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
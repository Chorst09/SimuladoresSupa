import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Tentando desabilitar RLS via API...');

    // Tentar executar comando SQL para desabilitar RLS
    const { data, error } = await supabase.rpc('disable_rls_profiles');

    if (error) {
      console.error('Erro ao desabilitar RLS:', error);
      return NextResponse.json(
        { error: 'Erro ao desabilitar RLS', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ RLS desabilitado com sucesso');
    return NextResponse.json({
      message: 'RLS desabilitado com sucesso',
      data
    });

  } catch (error: any) {
    console.error('Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno', details: error.message },
      { status: 500 }
    );
  }
}
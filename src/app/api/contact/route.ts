import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Parse do corpo da requisição
    const body: ContactFormData = await request.json();
    const { name, email, message } = body;

    // Validação básica dos dados
    if (!name || !email || !message) {
      return NextResponse.json(
        {
          success: false,
          message: 'Todos os campos são obrigatórios (nome, email, mensagem).'
        },
        { status: 400 }
      );
    }

    // Validação do formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Por favor, insira um email válido.'
        },
        { status: 400 }
      );
    }

    // Validação do tamanho dos campos
    if (name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: 'O nome deve ter no máximo 100 caracteres.'
        },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: 'A mensagem deve ter no máximo 1000 caracteres.'
        },
        { status: 400 }
      );
    }

    // Inserir dados no Supabase
    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          message: message.trim(),
          created_at: new Date().toISOString(),
          status: 'pending' // Status inicial para controle
        }
      ])
      .select();

    if (error) {
      console.error('Erro ao inserir no Supabase:', error);
      
      // Verificar se é erro de tabela não encontrada
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            message: 'Tabela de contatos não encontrada. Verifique a configuração do banco de dados.'
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: 'Erro interno do servidor. Tente novamente mais tarde.'
        },
        { status: 500 }
      );
    }

    // Sucesso
    return NextResponse.json(
      {
        success: true,
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
        data: data?.[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro na API de contato:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor. Tente novamente mais tarde.'
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar se a API está funcionando
export async function GET(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json(
    {
      success: true,
      message: 'API de contato está funcionando corretamente.'
    },
    { status: 200 }
  );
}

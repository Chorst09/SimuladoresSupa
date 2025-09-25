import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    // Buscar todas as tabelas de comissão
    const [
      channelSellerResult,
      channelDirectorResult,
      sellerResult,
      channelInfluencerResult,
      channelIndicatorResult
    ] = await Promise.all([
      supabase.from('commission_channel_seller').select('*').single(),
      supabase.from('commission_channel_director').select('*').single(),
      supabase.from('commission_seller').select('*').single(),
      supabase.from('commission_channel_influencer').select('*').order('revenue_min', { ascending: true }),
      supabase.from('commission_channel_indicator').select('*').order('revenue_min', { ascending: true })
    ]);

    return NextResponse.json({
      channelSeller: channelSellerResult.data,
      channelDirector: channelDirectorResult.data,
      seller: sellerResult.data,
      channelInfluencer: channelInfluencerResult.data,
      channelIndicator: channelIndicatorResult.data
    });
  } catch (error) {
    console.error('Erro ao buscar comissões:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { table, data } = body;

    if (!table || !data) {
      return NextResponse.json(
        { error: 'Tabela e dados são obrigatórios' },
        { status: 400 }
      );
    }

    let result;

    switch (table) {
      case 'channel_seller':
        result = await supabase
          .from('commission_channel_seller')
          .update(data)
          .eq('id', data.id)
          .select();
        break;
      
      case 'channel_director':
        result = await supabase
          .from('commission_channel_director')
          .update(data)
          .eq('id', data.id)
          .select();
        break;
      
      case 'seller':
        result = await supabase
          .from('commission_seller')
          .update(data)
          .eq('id', data.id)
          .select();
        break;
      
      case 'channel_influencer':
        result = await supabase
          .from('commission_channel_influencer')
          .update(data)
          .eq('id', data.id)
          .select();
        break;
      
      case 'channel_indicator':
        result = await supabase
          .from('commission_channel_indicator')
          .update(data)
          .eq('id', data.id)
          .select();
        break;
      
      default:
        return NextResponse.json(
          { error: 'Tabela inválida' },
          { status: 400 }
        );
    }

    if (result.error) {
      console.error('Erro ao atualizar comissão:', result.error);
      return NextResponse.json(
        { error: 'Erro ao atualizar dados' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
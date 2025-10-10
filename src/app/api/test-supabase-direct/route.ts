import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(): Promise<NextResponse> {
  console.log('🧪 DIRECT SUPABASE TEST');
  console.log('🔑 URL:', supabaseUrl);
  console.log('🔑 Service Key present:', !!supabaseServiceKey);
  console.log('🔑 Service Key length:', supabaseServiceKey?.length);
  console.log('🔑 Service Key first 50 chars:', supabaseServiceKey?.substring(0, 50));
  console.log('🔑 Service Key last 10 chars:', supabaseServiceKey?.substring(supabaseServiceKey.length - 10));

  if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
    return NextResponse.json({
      success: false,
      error: 'Environment variables missing',
      details: {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        hasAnonKey: !!supabaseAnonKey
      }
    });
  }

  try {
    // Try service key first, fallback to anon key
    const keyToUse = supabaseServiceKey || supabaseAnonKey;
    const keyType = supabaseServiceKey ? 'service_role' : 'anon';
    
    console.log('🔑 Using key type:', keyType);
    
    const supabase = createClient(supabaseUrl, keyToUse!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔄 Testing direct connection...');

    // Test 1: Simple query to check connection
    const { data: testData, error: testError } = await supabase
      .from('proposals')
      .select('count')
      .limit(1);

    console.log('📊 Test query result:', { testData, testError });

    if (testError) {
      return NextResponse.json({
        success: false,
        error: 'Connection test failed',
        details: testError
      });
    }

    // Test 2: Try to insert a simple record
    const testRecord = {
      title: 'Direct Test',
      client: 'Test Client'
    };

    console.log('📝 Attempting direct insert:', testRecord);

    const { data: insertData, error: insertError } = await supabase
      .from('proposals')
      .insert([testRecord])
      .select()
      .single();

    console.log('📝 Insert result:', { insertData, insertError });

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Insert test failed',
        details: insertError,
        connectionWorked: true
      });
    }

    // Test 3: Read it back
    const { data: readData, error: readError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', insertData.id)
      .single();

    console.log('📖 Read back result:', { readData, readError });

    // Clean up
    await supabase
      .from('proposals')
      .delete()
      .eq('id', insertData.id);

    return NextResponse.json({
      success: true,
      message: 'All tests passed!',
      results: {
        connection: !testError,
        insert: !insertError,
        readBack: !readError,
        insertedData: insertData,
        readBackData: readData
      }
    });

  } catch (error) {
    console.error('❌ Direct test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Direct test exception',
      details: error
    });
  }
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Use GET method for testing'
  });
}
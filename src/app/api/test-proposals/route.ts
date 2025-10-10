import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(): Promise<NextResponse> {
  console.log('🧪 Testing Supabase connection for proposals...');
  
  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured',
      details: {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey
      }
    });
  }

  try {
    // Test 1: Check if proposals table exists
    console.log('🔍 Testing proposals table access...');
    const { data: testRead, error: readError } = await supabase
      .from('proposals')
      .select('count')
      .limit(1);

    if (readError) {
      console.error('❌ Error reading proposals table:', readError);
      return NextResponse.json({
        success: false,
        error: 'Cannot read proposals table',
        details: readError
      });
    }

    console.log('✅ Proposals table accessible');

    // Test 2: Try to insert a test proposal
    console.log('🔄 Testing proposal insertion...');
    const testProposal = {
      base_id: `Test_${Date.now()}`,
      title: 'Test Proposal',
      client: 'Test Client',
      account_manager: 'Test Manager',
      type: 'VM',
      status: 'Rascunho',
      value: 100.00,
      total_setup: 50.00,
      total_monthly: 100.00,
      contract_period: 12,
      date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_by: 'test-system',
      distributor_id: '',
      version: 1,
      products: [],
      items: [],
      client_data: { name: 'Test Client', email: 'test@test.com' },
      metadata: {}
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('proposals')
      .insert([testProposal])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error inserting test proposal:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Cannot insert proposal',
        details: insertError
      });
    }

    console.log('✅ Test proposal inserted successfully:', insertResult.id);

    // Test 3: Clean up - delete the test proposal
    const { error: deleteError } = await supabase
      .from('proposals')
      .delete()
      .eq('id', insertResult.id);

    if (deleteError) {
      console.warn('⚠️ Could not delete test proposal:', deleteError);
    } else {
      console.log('🧹 Test proposal cleaned up');
    }

    return NextResponse.json({
      success: true,
      message: 'All tests passed',
      testResults: {
        tableAccess: true,
        insertion: true,
        cleanup: !deleteError
      }
    });

  } catch (error) {
    console.error('❌ Test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error
    });
  }
}

export async function POST(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Use GET method to run tests'
  });
}
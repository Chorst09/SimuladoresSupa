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
  console.log('🧪 Testing Supabase connection for proposals at:', new Date().toISOString());
  
  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured',
      details: {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
        url: supabaseUrl ? 'Present' : 'Missing',
        serviceKey: supabaseServiceKey ? 'Present' : 'Missing'
      }
    });
  }

  try {
    // Test 1: Check current proposals count
    console.log('🔍 Checking current proposals in database...');
    const { count, error: countError } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting proposals:', countError);
      return NextResponse.json({
        success: false,
        error: 'Cannot count proposals',
        details: countError
      });
    }

    console.log('📊 Current proposals count:', count);

    // Test 2: Get recent proposals
    const { data: recentProposals, error: recentError } = await supabase
      .from('proposals')
      .select('id, title, client, type, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('❌ Error getting recent proposals:', recentError);
    } else {
      console.log('📋 Recent proposals:', recentProposals);
    }

    // Test 3: Try to insert a test proposal
    console.log('🔄 Testing proposal insertion...');
    const testProposal = {
      base_id: `Test_${Date.now()}`,
      title: 'Test Proposal - Persistence Check',
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
      metadata: {},
      changes: 'Test changes field',
      apply_salesperson_discount: false,
      applied_director_discount_percentage: 0,
      base_total_monthly: 100.00
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
        details: insertError,
        currentCount: count,
        recentProposals: recentProposals
      });
    }

    console.log('✅ Test proposal inserted successfully:', insertResult.id);

    // Test 4: Wait and verify it still exists
    console.log('⏳ Waiting 2 seconds to verify persistence...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: verifyProposal, error: verifyError } = await supabase
      .from('proposals')
      .select('id, title, created_at')
      .eq('id', insertResult.id)
      .single();

    const stillExists = !verifyError && verifyProposal;
    console.log('🔍 Proposal still exists after 2 seconds:', stillExists);

    // Test 5: Clean up - delete the test proposal
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
      message: 'All tests completed',
      testResults: {
        tableAccess: true,
        currentCount: count,
        recentProposals: recentProposals?.length || 0,
        insertion: true,
        persistence: stillExists,
        cleanup: !deleteError
      },
      details: {
        insertedId: insertResult.id,
        verificationResult: verifyProposal
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
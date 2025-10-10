import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(): Promise<NextResponse> {
  console.log('🔍 DEBUG: Investigating Supabase proposals table...');
  
  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured'
    });
  }

  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: Check table structure
    console.log('📋 Checking table structure...');
    try {
      const { data: columns, error: structureError } = await supabase
        .rpc('get_table_columns', { table_name: 'proposals' });
      
      results.tests.tableStructure = {
        success: !structureError,
        error: structureError?.message,
        columns: columns
      };
    } catch (e) {
      results.tests.tableStructure = {
        success: false,
        error: 'Could not check table structure',
        details: e
      };
    }

    // Test 2: Check RLS policies
    console.log('🔒 Checking RLS policies...');
    try {
      const { data: policies, error: policyError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'proposals');
      
      results.tests.rlsPolicies = {
        success: !policyError,
        error: policyError?.message,
        policies: policies
      };
    } catch (e) {
      results.tests.rlsPolicies = {
        success: false,
        error: 'Could not check RLS policies',
        details: e
      };
    }

    // Test 3: Raw count without any filters
    console.log('📊 Getting raw count...');
    const { count: rawCount, error: countError } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true });
    
    results.tests.rawCount = {
      success: !countError,
      count: rawCount,
      error: countError?.message
    };

    // Test 4: Try to get all proposals (limited)
    console.log('📄 Getting sample proposals...');
    const { data: sampleProposals, error: sampleError } = await supabase
      .from('proposals')
      .select('id, title, client, type, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    results.tests.sampleData = {
      success: !sampleError,
      count: sampleProposals?.length || 0,
      error: sampleError?.message,
      samples: sampleProposals
    };

    // Test 5: Check for VM proposals specifically
    console.log('🖥️ Checking VM proposals...');
    const { data: vmProposals, error: vmError } = await supabase
      .from('proposals')
      .select('id, title, client, type, created_at')
      .eq('type', 'VM')
      .order('created_at', { ascending: false })
      .limit(5);
    
    results.tests.vmProposals = {
      success: !vmError,
      count: vmProposals?.length || 0,
      error: vmError?.message,
      samples: vmProposals
    };

    // Test 6: Check proposals from last 24 hours
    console.log('⏰ Checking recent proposals...');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentProposals, error: recentError } = await supabase
      .from('proposals')
      .select('id, title, client, type, created_at')
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false });
    
    results.tests.recentProposals = {
      success: !recentError,
      count: recentProposals?.length || 0,
      error: recentError?.message,
      samples: recentProposals
    };

    // Test 7: Try inserting and immediately reading back
    console.log('💾 Testing insert and immediate read...');
    const testProposal = {
      base_id: `Debug_${Date.now()}`,
      title: 'Debug Test Proposal',
      client: 'Debug Client',
      account_manager: 'Debug Manager',
      type: 'VM',
      status: 'Rascunho',
      value: 100.00,
      total_setup: 50.00,
      total_monthly: 100.00,
      contract_period: 12,
      date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_by: 'debug-system',
      distributor_id: '',
      version: 1,
      products: [],
      items: [],
      client_data: { name: 'Debug Client' },
      metadata: {}
    };

    const { data: insertedProposal, error: insertError } = await supabase
      .from('proposals')
      .insert([testProposal])
      .select()
      .single();

    if (insertError) {
      results.tests.insertTest = {
        success: false,
        error: insertError.message,
        details: insertError
      };
    } else {
      // Try to read it back immediately
      const { data: readBack, error: readError } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', insertedProposal.id)
        .single();

      results.tests.insertTest = {
        success: true,
        insertedId: insertedProposal.id,
        readBackSuccess: !readError,
        readBackError: readError?.message,
        readBackData: readBack
      };

      // Clean up
      await supabase
        .from('proposals')
        .delete()
        .eq('id', insertedProposal.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Debug analysis complete',
      results
    });

  } catch (error) {
    console.error('❌ Debug analysis failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug analysis failed',
      details: error
    });
  }
}
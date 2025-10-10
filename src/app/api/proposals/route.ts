import { NextRequest, NextResponse } from 'next/server';
import { Proposal } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('✅ Supabase client initialized with service key');
  console.log('🔑 Using URL:', supabaseUrl);
  console.log('🔑 Service key present:', !!supabaseServiceKey);
} else {
  console.error('❌ Supabase environment variables missing');
  console.error('❌ URL present:', !!supabaseUrl);
  console.error('❌ Service key present:', !!supabaseServiceKey);
}

let mockProposals: Proposal[] = [];

function generateProposalId(type: string = 'PROP'): string {
  const nextNumber = (mockProposals.length + 1).toString().padStart(4, '0');
  switch (type) {
    case 'VM': return `Prop_MV_${nextNumber}_v1`;
    case 'PABX': return `Prop_PabxSip_${nextNumber}_v1`;
    default: return `Prop_General_${nextNumber}_v1`;
  }
}

function validateProposalData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.title) errors.push('title is required');
  if (!data.client) errors.push('client is required');
  return { isValid: errors.length === 0, errors };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const debug = searchParams.get('debug');
    
    console.log('🔍 GET proposals request:', { type, debug, timestamp: new Date().toISOString() });

    // Debug mode - return diagnostic information
    if (debug === 'true') {
      console.log('🧪 DEBUG MODE ACTIVATED');
      
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
        // Test 1: Count all proposals
        const { count, error: countError } = await supabase
          .from('proposals')
          .select('*', { count: 'exact', head: true });

        // Test 2: Get recent proposals
        const { data: recentProposals, error: recentError } = await supabase
          .from('proposals')
          .select('id, title, client, type, status, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        // Test 3: Test insert and read
        const testProposal = {
          base_id: `Debug_${Date.now()}`,
          title: 'Debug Test',
          client: 'Debug Client',
          type: 'VM',
          status: 'Rascunho',
          value: 100,
          created_by: 'debug-system',
          version: 1
        };

        const { data: insertResult, error: insertError } = await supabase
          .from('proposals')
          .insert([testProposal])
          .select()
          .single();

        let readBackResult = null;
        if (!insertError && insertResult) {
          const { data: readBack, error: readError } = await supabase
            .from('proposals')
            .select('*')
            .eq('id', insertResult.id)
            .single();
          
          readBackResult = { success: !readError, data: readBack, error: readError?.message };
          
          // Clean up
          await supabase.from('proposals').delete().eq('id', insertResult.id);
        }

        return NextResponse.json({
          debug: true,
          timestamp: new Date().toISOString(),
          supabaseConfig: {
            hasUrl: !!supabaseUrl,
            hasServiceKey: !!supabaseServiceKey,
            url: supabaseUrl
          },
          tests: {
            count: { success: !countError, count, error: countError?.message },
            recentProposals: { success: !recentError, count: recentProposals?.length || 0, data: recentProposals, error: recentError?.message },
            insertTest: { success: !insertError, insertedId: insertResult?.id, error: insertError?.message },
            readBackTest: readBackResult
          }
        });
      } catch (debugError) {
        return NextResponse.json({
          debug: true,
          error: 'Debug test failed',
          details: debugError
        });
      }
    }

    if (supabase) {
      try {
        console.log('🔄 Loading from Supabase...');
        
        // Create a new client with explicit RLS bypass for service key
        const adminSupabase = createClient(supabaseUrl!, supabaseServiceKey!, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          },
          db: {
            schema: 'public'
          }
        });
        
        // First, let's check if we can connect to the table
        const { count, error: countError } = await adminSupabase
          .from('proposals')
          .select('*', { count: 'exact', head: true });
          
        if (countError) {
          console.error('❌ Error checking proposals table:', countError);
          console.error('❌ Count error details:', {
            message: countError.message,
            details: countError.details,
            hint: countError.hint,
            code: countError.code
          });
          throw countError;
        }
        
        console.log('📊 Total proposals in database:', count);
        
        // Try to get all proposals without any RLS restrictions
        let query = adminSupabase.from('proposals').select('*').order('created_at', { ascending: false });
        if (type) query = query.eq('type', type);

        const { data: proposals, error } = await query;

        if (error) {
          console.error('❌ Supabase query error:', error);
          throw error;
        }

        if (proposals) {
          console.log('✅ Loaded from Supabase:', proposals.length, 'proposals');
          console.log('📋 First proposal sample:', proposals[0] ? {
            id: proposals[0].id,
            title: proposals[0].title,
            created_at: proposals[0].created_at
          } : 'No proposals found');
          
          const transformed = proposals.map((p: any) => ({
            id: p.id,
            baseId: p.base_id,
            title: p.title,
            client: p.client,
            accountManager: p.account_manager,
            type: p.type,
            status: p.status,
            value: p.value,
            totalSetup: p.total_setup,
            totalMonthly: p.total_monthly,
            contractPeriod: p.contract_period,
            date: p.date,
            expiryDate: p.expiry_date,
            createdBy: p.created_by,
            distributorId: p.distributor_id,
            version: p.version,
            products: p.products,
            items: p.items,
            clientData: p.client_data,
            metadata: p.metadata,
            changes: p.changes,
            applySalespersonDiscount: p.apply_salesperson_discount,
            appliedDirectorDiscountPercentage: p.applied_director_discount_percentage,
            baseTotalMonthly: p.base_total_monthly,
            createdAt: p.created_at,
            updatedAt: p.updated_at
          }));
          return NextResponse.json(transformed, { status: 200 });
        }
      } catch (supabaseError) {
        console.error('❌ Supabase error:', supabaseError);
      }
    }

    console.log('📦 Using mock storage');
    let filtered = mockProposals;
    if (type) filtered = filtered.filter(p => p.type === type);
    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📥 POST /api/proposals - Request received at:', new Date().toISOString());
    const body = await request.json();
    console.log('📋 Request body keys:', Object.keys(body));
    console.log('📋 Essential fields:', {
      title: body.title,
      client: body.client,
      type: body.type,
      status: body.status,
      accountManager: body.accountManager
    });
    
    const validation = validateProposalData(body);
    console.log('✅ Validation result:', validation);
    
    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.errors);
      return NextResponse.json({ error: 'Validation failed', details: validation.errors }, { status: 400 });
    }

    const proposalType = body.type || 'GENERAL';
    const currentDate = new Date();
    let baseId = generateProposalId(proposalType);
    
    console.log('🏷️ Generated baseId:', baseId);

    if (supabase) {
      try {
        console.log('🔄 Attempting to save to Supabase...');
        
        // Create admin client to bypass RLS
        const adminSupabase = createClient(supabaseUrl!, supabaseServiceKey!, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          },
          db: {
            schema: 'public'
          }
        });
        
        // Build proposal data with only essential fields first
        const proposalData: any = {
          base_id: baseId,
          title: body.title,
          client: body.client,
          type: proposalType,
          status: body.status || 'Rascunho',
          value: body.value || 0,
          created_by: body.createdBy || 'system',
          version: body.version || 1
        };

        // Add optional fields only if they exist
        if (body.accountManager) proposalData.account_manager = body.accountManager;
        if (body.totalSetup !== undefined) proposalData.total_setup = body.totalSetup;
        if (body.totalMonthly !== undefined) proposalData.total_monthly = body.totalMonthly;
        if (body.contractPeriod !== undefined) proposalData.contract_period = body.contractPeriod;
        if (body.date) proposalData.date = body.date;
        else proposalData.date = currentDate.toISOString().split('T')[0];
        if (body.expiryDate) proposalData.expiry_date = body.expiryDate;
        else proposalData.expiry_date = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if (body.distributorId) proposalData.distributor_id = body.distributorId;
        if (body.products) proposalData.products = body.products;
        if (body.items) proposalData.items = body.items;
        if (body.clientData) proposalData.client_data = body.clientData;
        if (body.metadata) proposalData.metadata = body.metadata;
        if (body.changes) proposalData.changes = body.changes;
        if (body.applySalespersonDiscount !== undefined) proposalData.apply_salesperson_discount = body.applySalespersonDiscount;
        if (body.appliedDirectorDiscountPercentage !== undefined) proposalData.applied_director_discount_percentage = body.appliedDirectorDiscountPercentage;
        if (body.baseTotalMonthly !== undefined) proposalData.base_total_monthly = body.baseTotalMonthly;

        console.log('📤 Inserting data:', JSON.stringify(proposalData, null, 2));
        
        const { data: proposal, error } = await adminSupabase
          .from('proposals')
          .insert([proposalData])
          .select()
          .single();

        if (error) {
          console.error('❌ Insert error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        if (proposal) {
          console.log('✅ Successfully saved to Supabase!');
          console.log('📄 Saved proposal details:', {
            id: proposal.id,
            base_id: proposal.base_id,
            title: proposal.title,
            client: proposal.client,
            created_at: proposal.created_at
          });
          
          // Verify the proposal was actually saved by reading it back
          const { data: verifyProposal, error: verifyError } = await adminSupabase
            .from('proposals')
            .select('id, title, client, created_at')
            .eq('id', proposal.id)
            .single();
            
          if (verifyError) {
            console.error('⚠️ Could not verify saved proposal:', verifyError);
          } else {
            console.log('✅ Verification successful - proposal exists in database:', verifyProposal);
          }
          const transformed = {
            id: proposal.id,
            baseId: proposal.base_id,
            title: proposal.title,
            client: proposal.client,
            accountManager: proposal.account_manager,
            type: proposal.type,
            status: proposal.status,
            value: proposal.value,
            totalSetup: proposal.total_setup,
            totalMonthly: proposal.total_monthly,
            contractPeriod: proposal.contract_period,
            date: proposal.date,
            expiryDate: proposal.expiry_date,
            createdBy: proposal.created_by,
            distributorId: proposal.distributor_id,
            version: proposal.version,
            products: proposal.products,
            items: proposal.items,
            clientData: proposal.client_data,
            metadata: proposal.metadata,
            changes: proposal.changes,
            applySalespersonDiscount: proposal.apply_salesperson_discount,
            appliedDirectorDiscountPercentage: proposal.applied_director_discount_percentage,
            baseTotalMonthly: proposal.base_total_monthly,
            createdAt: proposal.created_at,
            updatedAt: proposal.updated_at
          };
          return NextResponse.json(transformed, { status: 201 });
        }
      } catch (supabaseError) {
        console.error('❌ Supabase error:', supabaseError);
      }
    }

    console.log('📦 Using mock storage');
    const createdProposal = {
      ...body,
      id: `mock_${Date.now()}`,
      baseId,
      title: body.title,
      client: body.client,
      type: proposalType,
      status: body.status || 'Rascunho',
      value: body.value || 0,
      date: body.date || currentDate.toISOString().split('T')[0],
      expiryDate: body.expiryDate || new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdBy: 'anonymous',
      createdAt: currentDate,
      version: body.version || 1,
      distributorId: body.distributorId || '',
      accountManager: body.accountManager || ''
    };

    mockProposals.push(createdProposal);
    return NextResponse.json(createdProposal, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('id');
    const body = await request.json();

    if (!proposalId) {
      return NextResponse.json({ error: 'Proposal ID is required' }, { status: 400 });
    }

    if (supabase) {
      try {
        // Create admin client to bypass RLS
        const adminSupabase = createClient(supabaseUrl!, supabaseServiceKey!, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          },
          db: {
            schema: 'public'
          }
        });
        
        const updateData: any = {};
        if (body.title) updateData.title = body.title;
        if (body.client) updateData.client = body.client;
        if (body.accountManager) updateData.account_manager = body.accountManager;
        if (body.status) updateData.status = body.status;
        if (body.value !== undefined) updateData.value = body.value;
        if (body.totalSetup !== undefined) updateData.total_setup = body.totalSetup;
        if (body.totalMonthly !== undefined) updateData.total_monthly = body.totalMonthly;
        if (body.contractPeriod !== undefined) updateData.contract_period = body.contractPeriod;
        if (body.products) updateData.products = body.products;
        if (body.items) updateData.items = body.items;
        if (body.clientData) updateData.client_data = body.clientData;
        if (body.metadata) updateData.metadata = body.metadata;
        if (body.changes !== undefined) updateData.changes = body.changes;
        if (body.applySalespersonDiscount !== undefined) updateData.apply_salesperson_discount = body.applySalespersonDiscount;
        if (body.appliedDirectorDiscountPercentage !== undefined) updateData.applied_director_discount_percentage = body.appliedDirectorDiscountPercentage;
        if (body.baseTotalMonthly !== undefined) updateData.base_total_monthly = body.baseTotalMonthly;

        const { data: proposal, error } = await adminSupabase
          .from('proposals')
          .update(updateData)
          .eq('id', proposalId)
          .select()
          .single();

        if (!error && proposal) {
          const transformed = {
            id: proposal.id,
            baseId: proposal.base_id,
            title: proposal.title,
            client: proposal.client,
            accountManager: proposal.account_manager,
            type: proposal.type,
            status: proposal.status,
            value: proposal.value,
            totalSetup: proposal.total_setup,
            totalMonthly: proposal.total_monthly,
            contractPeriod: proposal.contract_period,
            date: proposal.date,
            expiryDate: proposal.expiry_date,
            createdBy: proposal.created_by,
            distributorId: proposal.distributor_id,
            version: proposal.version,
            products: proposal.products,
            items: proposal.items,
            clientData: proposal.client_data,
            metadata: proposal.metadata,
            changes: proposal.changes,
            applySalespersonDiscount: proposal.apply_salesperson_discount,
            appliedDirectorDiscountPercentage: proposal.applied_director_discount_percentage,
            baseTotalMonthly: proposal.base_total_monthly,
            createdAt: proposal.created_at,
            updatedAt: proposal.updated_at
          };
          return NextResponse.json(transformed, { status: 200 });
        }
      } catch (supabaseError) {
        console.error('Supabase update error:', supabaseError);
      }
    }

    const proposalIndex = mockProposals.findIndex(p => p.id === proposalId);
    if (proposalIndex === -1) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const existingProposal = mockProposals[proposalIndex];
    const updatedProposal = { ...existingProposal, ...body, id: proposalId, updatedAt: new Date() };
    mockProposals[proposalIndex] = updatedProposal;

    return NextResponse.json(updatedProposal, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('id');

    if (!proposalId) {
      return NextResponse.json({ error: 'Proposal ID is required' }, { status: 400 });
    }

    if (supabase) {
      try {
        // Create admin client to bypass RLS
        const adminSupabase = createClient(supabaseUrl!, supabaseServiceKey!, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          },
          db: {
            schema: 'public'
          }
        });
        
        const { data: proposal, error } = await adminSupabase
          .from('proposals')
          .delete()
          .eq('id', proposalId)
          .select()
          .single();

        if (!error && proposal) {
          return NextResponse.json({ message: 'Proposal deleted successfully', proposal }, { status: 200 });
        }
      } catch (supabaseError) {
        console.error('Supabase delete error:', supabaseError);
      }
    }

    const proposalIndex = mockProposals.findIndex(p => p.id === proposalId);
    if (proposalIndex === -1) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const deletedProposal = mockProposals.splice(proposalIndex, 1)[0];
    return NextResponse.json({ message: 'Proposal deleted successfully', proposal: deletedProposal }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { Proposal } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('✅ Supabase client initialized');
} else {
  console.error('❌ Supabase environment variables missing');
}

let mockProposals: Proposal[] = [];

function generateProposalId(type: string = 'PROP'): string {
  const nextNumber = (mockProposals.length + 1).toString().padStart(4, '0');
  switch (type) {
    case 'VM': return `Prop_MV_${nextNumber}_v1`;
    case 'PABX': return `Prop_PabxSip_${nextNumber}_v1`;
    case 'FIBER': return `Prop_InternetFibra_${nextNumber}_v1`;
    case 'RADIO': return `Prop_InternetRadio_${nextNumber}_v1`;
    case 'DOUBLE': return `Prop_Double_${nextNumber}_v1`;
    case 'MAN': return `Prop_ManFibra_${nextNumber}_v1`;
    case 'MANRADIO': return `Prop_ManRadio_${nextNumber}_v1`;
    default: return `Prop_General_${nextNumber}_v1`;
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    console.log('🔍 GET proposals request:', { type, timestamp: new Date().toISOString() });

    // Try Supabase first
    if (supabase) {
      try {
        console.log('🔄 Loading from Supabase...');
        
        const { data: proposals, error: supabaseError } = await supabase
          .from('proposals')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (supabaseError) {
          console.error('❌ Supabase error:', supabaseError);
          console.log('📦 Falling back to mock storage');
        } else {
          console.log('✅ Loaded from Supabase:', proposals?.length || 0, 'proposals');
          
          // Map Supabase column names to frontend expected names
          const mappedProposals = proposals?.map(p => ({
            ...p,
            baseId: p.base_id, // Map base_id to baseId
            totalSetup: p.total_setup,
            totalMonthly: p.total_monthly,
            contractPeriod: p.contract_period,
            expiryDate: p.expiry_date,
            createdBy: p.created_by,
            distributorId: p.distributor_id,
            clientData: p.client_data,
            applySalespersonDiscount: p.apply_salesperson_discount,
            appliedDirectorDiscountPercentage: p.applied_director_discount_percentage,
            baseTotalMonthly: p.base_total_monthly,
            createdAt: p.created_at,
            updatedAt: p.updated_at
          })) || [];
          
          // Filter by type if specified
          let filteredProposals = mappedProposals;
          if (type) {
            filteredProposals = filteredProposals.filter(p => p.type === type);
          }
          
          return NextResponse.json(filteredProposals);
        }
      } catch (err) {
        console.error('❌ Supabase connection error:', err);
        console.log('📦 Falling back to mock storage');
      }
    }

    // Fallback to mock storage
    console.log('📦 Using mock storage');
    let filteredMockProposals = mockProposals;
    if (type) {
      filteredMockProposals = mockProposals.filter(p => p.type === type);
    }
    
    return NextResponse.json(filteredMockProposals);
    
  } catch (err) {
    console.error('❌ GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch proposals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    console.log('📝 POST proposal request:', { timestamp: new Date().toISOString() });

    // Validate required fields
    if (!body.title || !body.client) {
      return NextResponse.json(
        { error: 'Missing required fields: title and client' },
        { status: 400 }
      );
    }

    // Create proposal object
    const proposal: Proposal = {
      id: crypto.randomUUID(),
      baseId: body.baseId || generateProposalId(body.type),
      title: body.title,
      client: body.client,
      accountManager: body.accountManager || '',
      type: body.type || 'GENERAL',
      status: body.status || 'Rascunho',
      value: body.value || 0,
      totalSetup: body.totalSetup || 0,
      totalMonthly: body.totalMonthly || 0,
      contractPeriod: body.contractPeriod || 12,
      date: body.date || new Date().toISOString().split('T')[0],
      expiryDate: body.expiryDate || null,
      createdBy: body.createdBy || 'system',
      distributorId: body.distributorId || '',
      version: body.version || 1,
      products: body.products || [],
      items: body.items || [],
      clientData: body.clientData || null,
      metadata: body.metadata || {},
      changes: body.changes || '',
      applySalespersonDiscount: body.applySalespersonDiscount || false,
      appliedDirectorDiscountPercentage: body.appliedDirectorDiscountPercentage || 0,
      baseTotalMonthly: body.baseTotalMonthly || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Try Supabase first
    if (supabase) {
      try {
        console.log('💾 Saving to Supabase...');
        
        const { data: savedProposal, error: saveError } = await supabase
          .from('proposals')
          .insert([{
            base_id: proposal.baseId,
            title: proposal.title,
            client: proposal.client,
            account_manager: proposal.accountManager,
            type: proposal.type,
            status: proposal.status,
            value: proposal.value,
            total_setup: proposal.totalSetup,
            total_monthly: proposal.totalMonthly,
            contract_period: proposal.contractPeriod,
            date: proposal.date,
            expiry_date: proposal.expiryDate,
            created_by: proposal.createdBy,
            distributor_id: proposal.distributorId,
            version: proposal.version,
            products: proposal.products,
            items: proposal.items,
            client_data: proposal.clientData,
            metadata: proposal.metadata,
            changes: proposal.changes,
            apply_salesperson_discount: proposal.applySalespersonDiscount,
            applied_director_discount_percentage: proposal.appliedDirectorDiscountPercentage,
            base_total_monthly: proposal.baseTotalMonthly
          }])
          .select()
          .single();

        if (saveError) {
          console.error('❌ Supabase save error:', saveError);
          console.log('📦 Falling back to mock storage');
        } else {
          console.log('✅ Saved to Supabase:', savedProposal.id);
          return NextResponse.json(savedProposal, { status: 201 });
        }
      } catch (err) {
        console.error('❌ Supabase save error:', err);
        console.log('📦 Falling back to mock storage');
      }
    }

    // Fallback to mock storage
    console.log('📦 Saving to mock storage');
    mockProposals.push(proposal);
    return NextResponse.json(proposal, { status: 201 });

  } catch (err) {
    console.error('❌ POST error:', err);
    return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing proposal ID' }, { status: 400 });
    }

    console.log('✏️ PUT proposal request:', { id, timestamp: new Date().toISOString() });

    // Try Supabase first
    if (supabase) {
      try {
        console.log('💾 Updating in Supabase...');
        
        const { data: updatedProposal, error: updateError } = await supabase
          .from('proposals')
          .update({
            title: body.title,
            client: body.client,
            account_manager: body.accountManager,
            status: body.status,
            value: body.value,
            total_setup: body.totalSetup,
            total_monthly: body.totalMonthly,
            contract_period: body.contractPeriod,
            date: body.date,
            expiry_date: body.expiryDate,
            products: body.products,
            items: body.items,
            client_data: body.clientData,
            metadata: body.metadata,
            changes: body.changes,
            apply_salesperson_discount: body.applySalespersonDiscount,
            applied_director_discount_percentage: body.appliedDirectorDiscountPercentage,
            base_total_monthly: body.baseTotalMonthly,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ Supabase update error:', updateError);
          console.log('📦 Falling back to mock storage');
        } else {
          console.log('✅ Updated in Supabase:', id);
          return NextResponse.json(updatedProposal);
        }
      } catch (err) {
        console.error('❌ Supabase update error:', err);
        console.log('📦 Falling back to mock storage');
      }
    }

    // Fallback to mock storage
    console.log('📦 Updating in mock storage');
    const proposalIndex = mockProposals.findIndex(p => p.id === id);
    if (proposalIndex === -1) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    mockProposals[proposalIndex] = { ...mockProposals[proposalIndex], ...body, updatedAt: new Date().toISOString() };
    return NextResponse.json(mockProposals[proposalIndex]);

  } catch (err) {
    console.error('❌ PUT error:', err);
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
  }
}
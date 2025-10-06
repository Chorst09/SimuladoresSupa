import { NextRequest, NextResponse } from 'next/server';
import { Proposal } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (with fallback for build time)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
}

// Mock storage for proposals (fallback if Supabase fails)
let mockProposals: Proposal[] = [
  {
    id: 'mock_1',
    baseId: 'Prop_VM_0001_v1',
    title: 'Proposta VM Teste',
    client: 'EMPRESA XYZ',
    type: 'VM',
    status: 'Aprovada',
    value: 500.00,
    contractPeriod: 36,
    date: '2024-01-17',
    expiryDate: '2024-02-17',
    createdBy: 'admin',
    createdAt: new Date('2024-01-17T09:15:00Z'),
    version: 1,
    distributorId: 'dist003',
    accountManager: 'Pedro Lima'
  }
];

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const baseId = searchParams.get('baseId');

    // Try Supabase first, fallback to mock data
    if (supabase) {
      try {
        // Build query for Supabase
        let query = supabase
          .from('proposals')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply filters if provided
        if (type) {
          query = query.eq('type', type);
        }
        if (baseId) {
          query = query.eq('base_id', baseId);
        }

        const { data: proposals, error } = await query;

        if (!error && proposals) {
          // Transform Supabase data to match expected format
          const transformedProposals = proposals.map((p: any) => ({
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
            createdAt: p.created_at,
            updatedAt: p.updated_at
          }));

          return NextResponse.json(transformedProposals, { status: 200 });
        }
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
      }
    }

    // Fallback to mock data
    let filteredProposals = mockProposals;
    if (type) {
      filteredProposals = filteredProposals.filter(p => p.type === type);
    }
    if (baseId) {
      filteredProposals = filteredProposals.filter(p => p.baseId === baseId);
    }
    filteredProposals.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(filteredProposals, { status: 200 });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Helper function to generate unique proposal ID
function generateProposalId(type: string = 'PROP'): string {
  const typeProposals = mockProposals.filter(p => p.type === type);
  const nextNumber = (typeProposals.length + 1).toString().padStart(4, '0');
  
  switch (type) {
    case 'RADIO':
      return `Prop_Radio_${nextNumber}_v1`;
    case 'FIBER':
      return `Prop_Fibra_${nextNumber}_v1`;
    case 'VM':
      return `Prop_MV_${nextNumber}_v1`;
    case 'PABX':
      return `Prop_PabxSip_${nextNumber}_v1`;
    case 'MAN':
      return `Prop_InterMan_${nextNumber}_v1`;
    case 'DOUBLE_FIBRA_RADIO':
      return `Prop_Double_${nextNumber}_v1`;
    default:
      return `Prop_General_${nextNumber}_v1`;
  }
}

// Supported proposal types
const SUPPORTED_PROPOSAL_TYPES = [
  'FIBER', 'VM', 'RADIO', 'PABX', 'MAN', 'DOUBLE_FIBRA_RADIO', 'GENERAL'
] as const;

// Validation function for proposal data
function validateProposalData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || (typeof data.title === 'string' && data.title.trim() === '')) {
    errors.push('title is required and cannot be empty');
  }
  
  if (!data.client) {
    errors.push('client is required');
  } else if (typeof data.client === 'object' && !data.client.name) {
    errors.push('client.name is required when client is an object');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const validation = validateProposalData(body);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const proposalType = body.type || 'GENERAL';
    const currentDate = new Date();
    
    let baseId = generateProposalId(proposalType);
    let createdProposal: Proposal;

    // Try Supabase first, fallback to mock storage
    if (supabase) {
      try {
        // Generate base_id using Supabase function
        const { data: baseIdResult, error: baseIdError } = await supabase
          .rpc('generate_proposal_base_id', { proposal_type: proposalType });

        if (!baseIdError && baseIdResult) {
          baseId = baseIdResult;

          // Prepare data for Supabase
          const proposalData = {
            base_id: baseId,
            title: body.title,
            client: body.client,
            account_manager: body.accountManager,
            type: proposalType,
            status: body.status || 'Rascunho',
            value: body.value || 0,
            total_setup: body.totalSetup || 0,
            total_monthly: body.totalMonthly || 0,
            contract_period: body.contractPeriod || 12,
            date: body.date || currentDate.toISOString().split('T')[0],
            expiry_date: body.expiryDate || new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            created_by: null,
            distributor_id: body.distributorId || '',
            version: body.version || 1,
            products: body.products || [],
            items: body.items || [],
            client_data: body.clientData,
            metadata: body.metadata || {}
          };

          const { data: proposal, error } = await supabase
            .from('proposals')
            .insert([proposalData])
            .select()
            .single();

          if (!error && proposal) {
            // Transform response to match expected format
            const transformedProposal = {
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
              createdAt: proposal.created_at,
              updatedAt: proposal.updated_at
            };

            return NextResponse.json(transformedProposal, { status: 201 });
          }
        }
      } catch (supabaseError) {
        console.error('Supabase error:', supabaseError);
      }
    }

    // Fallback to mock storage
    createdProposal = {
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
    console.error('Error creating proposal:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('id');
    const body = await request.json();

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    // Try Supabase first, fallback to mock storage
    if (supabase) {
      try {
        // Prepare update data for Supabase
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

        const { data: proposal, error } = await supabase
          .from('proposals')
          .update(updateData)
          .eq('id', proposalId)
          .select()
          .single();

        if (!error && proposal) {
          // Transform response to match expected format
          const transformedProposal = {
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
            createdAt: proposal.created_at,
            updatedAt: proposal.updated_at
          };

          return NextResponse.json(transformedProposal, { status: 200 });
        }
      } catch (supabaseError) {
        console.error('Supabase update error:', supabaseError);
      }
    }

    // Fallback to mock storage
    const proposalIndex = mockProposals.findIndex(p => p.id === proposalId);
    
    if (proposalIndex === -1) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    const existingProposal = mockProposals[proposalIndex];
    const updatedProposal = {
      ...existingProposal,
      ...body,
      id: proposalId,
      updatedAt: new Date()
    };

    mockProposals[proposalIndex] = updatedProposal;

    return NextResponse.json(updatedProposal, { status: 200 });
  } catch (error) {
    console.error('Error updating proposal:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('id');

    if (!proposalId) {
      return NextResponse.json(
        { error: 'Proposal ID is required' },
        { status: 400 }
      );
    }

    // Try Supabase first, fallback to mock storage
    if (supabase) {
      try {
        const { data: proposal, error } = await supabase
          .from('proposals')
          .delete()
          .eq('id', proposalId)
          .select()
          .single();

        if (!error && proposal) {
          return NextResponse.json(
            { message: 'Proposal deleted successfully', proposal },
            { status: 200 }
          );
        }
      } catch (supabaseError) {
        console.error('Supabase delete error:', supabaseError);
      }
    }

    // Fallback to mock storage
    const proposalIndex = mockProposals.findIndex(p => p.id === proposalId);
    
    if (proposalIndex === -1) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }

    const deletedProposal = mockProposals.splice(proposalIndex, 1)[0];

    return NextResponse.json(
      { message: 'Proposal deleted successfully', proposal: deletedProposal },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export { SUPPORTED_PROPOSAL_TYPES };
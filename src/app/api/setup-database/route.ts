import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(): Promise<NextResponse> {
  console.log('🔧 Setting up proposals table...');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({
      success: false,
      error: 'Supabase configuration missing'
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // First, check if table exists and get its structure
    const { data: existingColumns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'proposals')
      .eq('table_schema', 'public');

    console.log('📋 Existing table structure:', existingColumns);

    // Since we can't use exec_sql, we'll provide the SQL script for manual execution
    console.log('📋 Table structure analysis complete');
    
    const sqlScript = `
-- Execute this SQL in your Supabase SQL Editor:

-- Drop existing table if needed
DROP TABLE IF EXISTS public.proposals CASCADE;

-- Create proposals table with complete structure
CREATE TABLE public.proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    base_id TEXT NOT NULL,
    title TEXT NOT NULL,
    client TEXT NOT NULL,
    account_manager TEXT,
    type TEXT NOT NULL DEFAULT 'GENERAL',
    status TEXT DEFAULT 'Rascunho',
    value DECIMAL(10,2) DEFAULT 0,
    total_setup DECIMAL(10,2) DEFAULT 0,
    total_monthly DECIMAL(10,2) DEFAULT 0,
    contract_period INTEGER DEFAULT 12,
    date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_by TEXT NOT NULL,
    distributor_id TEXT DEFAULT '',
    version INTEGER DEFAULT 1,
    products JSONB DEFAULT '[]'::jsonb,
    items JSONB DEFAULT '[]'::jsonb,
    client_data JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    changes TEXT DEFAULT '',
    apply_salesperson_discount BOOLEAN DEFAULT false,
    applied_director_discount_percentage DECIMAL(5,2) DEFAULT 0,
    base_total_monthly DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_proposals_type ON public.proposals(type);
CREATE INDEX idx_proposals_created_by ON public.proposals(created_by);
CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_proposals_created_at ON public.proposals(created_at);
CREATE INDEX idx_proposals_base_id ON public.proposals(base_id);

-- Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_proposals_updated_at 
    BEFORE UPDATE ON public.proposals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all access for service role" ON public.proposals
    FOR ALL USING (true);
`;

    return NextResponse.json({
      success: true,
      message: 'Database setup script generated',
      instructions: 'Execute the provided SQL script in your Supabase SQL Editor',
      sqlScript: sqlScript,
      currentTableInfo: {
        exists: existingColumns && existingColumns.length > 0,
        columns: existingColumns?.length || 0,
        columnDetails: existingColumns
      }
    });

    // Test the table by inserting and reading a test record
    console.log('🧪 Testing table with sample data...');
    const testProposal = {
      base_id: `Setup_Test_${Date.now()}`,
      title: 'Setup Test Proposal',
      client: 'Test Client',
      account_manager: 'Test Manager',
      type: 'VM',
      status: 'Rascunho',
      value: 100.00,
      total_setup: 50.00,
      total_monthly: 100.00,
      created_by: 'setup-system',
      version: 1
    };

    const { data: insertedProposal, error: insertError } = await supabase
      .from('proposals')
      .insert([testProposal])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error testing table:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Table created but test insert failed',
        details: insertError
      });
    }

    console.log('✅ Test proposal inserted:', insertedProposal.id);

    // Clean up test data
    await supabase
      .from('proposals')
      .delete()
      .eq('id', insertedProposal.id);

    console.log('✅ Database setup completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Proposals table created and configured successfully',
      details: {
        tableCreated: true,
        indexesCreated: !indexError,
        triggerCreated: !triggerError,
        rlsConfigured: !rlsError,
        testPassed: true
      }
    });

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      details: error
    });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Use POST method to setup the database',
    instructions: 'Send a POST request to this endpoint to create the proposals table'
  });
}
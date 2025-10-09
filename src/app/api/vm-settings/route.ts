import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log('✅ Supabase client initialized for VM settings');
} else {
  console.error('❌ Supabase environment variables missing for VM settings');
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Loading VM settings for user:', userId);

    // Try Supabase first
    if (supabase) {
      try {
        const { data: settings, error } = await supabase
          .from('vm_settings')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!error && settings) {
          console.log('✅ VM settings loaded from Supabase');
          return NextResponse.json(settings.settings, { status: 200 });
        }
      } catch (supabaseError) {
        console.error('❌ Supabase error loading VM settings:', supabaseError);
      }
    }

    // Return default settings if not found
    console.log('📦 Returning default VM settings');
    return NextResponse.json({
      markup: 30,
      commissionPercentage: 3,
      setupFee: 500,
      managementAndSupportCost: 49,
      vcpuWindowsCost: 20,
      vcpuLinuxCost: 10,
      ramCost: 7,
      hddSasCost: 0.2,
      ssdPerformanceCost: 1.5,
      nvmeCost: 2.5,
      network1GbpsCost: 0,
      network10GbpsCost: 100,
      windowsServerCost: 135,
      windows10ProCost: 120,
      windows11ProCost: 25,
      ubuntuCost: 0,
      centosCost: 0,
      debianCost: 0,
      rockyLinuxCost: 0,
      backupCostPerGb: 1.25,
      additionalIpCost: 15,
      snapshotCost: 25,
      vpnSiteToSiteCost: 50,
      pisCofins: 15.00,
      iss: 0.00,
      csllIr: 0.00,
      vmQuantity: 1,
      contractDiscounts: {
        12: 0,
        24: 5,
        36: 10,
        48: 15,
        60: 20
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error loading VM settings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('💾 Saving VM settings for user:', userId);

    // Try Supabase first
    if (supabase) {
      try {
        const settingsData = {
          user_id: userId,
          settings: body,
          updated_at: new Date().toISOString()
        };

        const { data: settings, error } = await supabase
          .from('vm_settings')
          .upsert(settingsData, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (!error && settings) {
          console.log('✅ VM settings saved to Supabase');
          return NextResponse.json({ success: true, settings }, { status: 200 });
        } else {
          console.error('❌ Error saving VM settings to Supabase:', error);
        }
      } catch (supabaseError) {
        console.error('❌ Supabase error saving VM settings:', supabaseError);
      }
    }

    // Fallback - just return success (localStorage will handle it)
    console.log('📦 VM settings saved to localStorage only');
    return NextResponse.json({ success: true, fallback: true }, { status: 200 });
  } catch (error) {
    console.error('Error saving VM settings:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
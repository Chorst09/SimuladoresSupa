import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  const results: any[] = [];
  
  try {
    console.log('🔍 API /users-debug - Testando diferentes métodos...')
    
    // Test 1: Service Role Key
    if (supabaseServiceKey) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false }
        })

        const { data, error, count } = await supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact' })

        results.push({
          method: 'Service Role Key',
          success: !error,
          count: data?.length || 0,
          totalCount: count,
          error: error?.message,
          sample: data?.slice(0, 3).map(u => ({ email: u.email, role: u.role }))
        })
      } catch (err: any) {
        results.push({
          method: 'Service Role Key',
          success: false,
          error: err.message
        })
      }
    }

    // Test 2: Anon Key
    try {
      const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      })

      const { data, error, count } = await supabaseAnon
        .from('profiles')
        .select('*', { count: 'exact' })

      results.push({
        method: 'Anon Key',
        success: !error,
        count: data?.length || 0,
        totalCount: count,
        error: error?.message,
        sample: data?.slice(0, 3).map(u => ({ email: u.email, role: u.role }))
      })
    } catch (err: any) {
      results.push({
        method: 'Anon Key',
        success: false,
        error: err.message
      })
    }

    // Test 3: Raw SQL (if service key available)
    if (supabaseServiceKey) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
        
        const { data, error } = await supabaseAdmin
          .rpc('get_all_profiles')

        results.push({
          method: 'RPC Function',
          success: !error,
          count: data?.length || 0,
          error: error?.message,
          note: 'Requires custom RPC function'
        })
      } catch (err: any) {
        results.push({
          method: 'RPC Function',
          success: false,
          error: err.message
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      recommendation: getRecommendation(results)
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      results
    }, { status: 500 })
  }
}

function getRecommendation(results: any[]) {
  const serviceRoleResult = results.find(r => r.method === 'Service Role Key')
  const anonResult = results.find(r => r.method === 'Anon Key')

  if (serviceRoleResult?.success && serviceRoleResult.count > 0) {
    return {
      method: 'Service Role Key',
      message: `Use Service Role Key - encontrou ${serviceRoleResult.count} usuários`,
      action: 'Usar /api/users com service role key'
    }
  }

  if (anonResult?.success && anonResult.count > 0) {
    return {
      method: 'Anon Key',
      message: `Use Anon Key - encontrou ${anonResult.count} usuários`,
      action: 'RLS está funcionando parcialmente'
    }
  }

  return {
    method: 'Manual Fix',
    message: 'Nenhum método funcionou completamente',
    action: 'Execute: ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;'
  }
}
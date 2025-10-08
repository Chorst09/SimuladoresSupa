import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    console.log('🔍 DEBUG API - Verificando usuários no Supabase...')
    
    const results: any = {
      timestamp: new Date().toISOString(),
      supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasAnonKey: !!supabaseAnonKey,
      results: {}
    }

    // Test 1: Using Anon Key
    console.log('🔑 Teste 1: Usando Anon Key...')
    try {
      const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
      const { data: anonData, error: anonError } = await supabaseAnon
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      results.results.anonKey = {
        success: !anonError,
        error: anonError?.message,
        count: anonData?.length || 0,
        users: anonData?.map(u => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          role: u.role,
          created_at: u.created_at
        })) || []
      }
      
      console.log('✅ Anon Key result:', results.results.anonKey)
    } catch (error: any) {
      results.results.anonKey = {
        success: false,
        error: error.message,
        count: 0,
        users: []
      }
    }

    // Test 2: Using Service Key (if available)
    if (supabaseServiceKey) {
      console.log('🔑 Teste 2: Usando Service Key...')
      try {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })
        
        const { data: adminData, error: adminError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        results.results.serviceKey = {
          success: !adminError,
          error: adminError?.message,
          count: adminData?.length || 0,
          users: adminData?.map(u => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            role: u.role,
            created_at: u.created_at
          })) || []
        }
        
        console.log('✅ Service Key result:', results.results.serviceKey)
      } catch (error: any) {
        results.results.serviceKey = {
          success: false,
          error: error.message,
          count: 0,
          users: []
        }
      }
    } else {
      results.results.serviceKey = {
        success: false,
        error: 'Service key not available',
        count: 0,
        users: []
      }
    }

    // Test 3: Check Auth Users (if service key available)
    if (supabaseServiceKey) {
      console.log('🔑 Teste 3: Verificando Auth Users...')
      try {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })
        
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

        results.results.authUsers = {
          success: !authError,
          error: authError?.message,
          count: authUsers?.users?.length || 0,
          users: authUsers?.users?.map(u => ({
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            email_confirmed_at: u.email_confirmed_at,
            last_sign_in_at: u.last_sign_in_at
          })) || []
        }
        
        console.log('✅ Auth Users result:', results.results.authUsers)
      } catch (error: any) {
        results.results.authUsers = {
          success: false,
          error: error.message,
          count: 0,
          users: []
        }
      }
    }

    console.log('🔍 DEBUG COMPLETO:', results)

    return NextResponse.json(results)

  } catch (error: any) {
    console.error('❌ Erro na API debug:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
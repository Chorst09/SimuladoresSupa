"use client";

import CommissionTablesDebug from '@/components/debug/CommissionTablesDebug';
import CommissionCalculationDebug from '@/components/debug/CommissionCalculationDebug';
import SimpleCommissionTest from '@/components/debug/SimpleCommissionTest';
import SupabaseDirectTest from '@/components/debug/SupabaseDirectTest';
import CommissionTablesUnified from '@/components/calculators/CommissionTablesUnified';

export default function DebugCommissionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Debug - Tabelas de Comissão
        </h1>
        
        {/* Teste Simples */}
        <SimpleCommissionTest />
        
        {/* Teste Direto Supabase */}
        <SupabaseDirectTest />
        
        {/* Diagnóstico */}
        <CommissionTablesDebug />
        
        {/* Teste de Cálculo */}
        <CommissionCalculationDebug />
        
        {/* Tabelas Unificadas */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">
            Tabelas de Comissão (Como aparecem nas calculadoras)
          </h2>
          <CommissionTablesUnified />
        </div>
      </div>
    </div>
  );
}
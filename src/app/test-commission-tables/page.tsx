"use client";

import CommissionTablesUnified from '@/components/calculators/CommissionTablesUnified';

export default function TestCommissionTablesPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test Commission Tables Unified</h1>
        <CommissionTablesUnified />
      </div>
    </div>
  );
}
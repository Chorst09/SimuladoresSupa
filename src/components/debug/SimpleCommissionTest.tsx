import React from 'react';
import { useCommissions } from '@/hooks/use-commissions';

export default function SimpleCommissionTest() {
  const { 
    channelSeller, 
    seller, 
    isLoading, 
    error 
  } = useCommissions();

  // Apenas logs em desenvolvimento
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('SimpleCommissionTest - isLoading:', isLoading);
    console.log('SimpleCommissionTest - error:', error);
    console.log('SimpleCommissionTest - channelSeller:', channelSeller);
    console.log('SimpleCommissionTest - seller:', seller);
  }

  return (
    <div className="bg-slate-800 p-4 rounded text-white">
      <h3 className="font-bold mb-2">Teste Simples de Comissões</h3>
      <div>Loading: {isLoading ? 'true' : 'false'}</div>
      <div>Error: {error || 'null'}</div>
      <div>Channel Seller: {channelSeller ? 'loaded' : 'null'}</div>
      <div>Seller: {seller ? 'loaded' : 'null'}</div>
      
      {channelSeller && (
        <div className="mt-2">
          <div>Channel Seller 36m: {channelSeller.months_36}%</div>
        </div>
      )}
      
      {seller && (
        <div className="mt-2">
          <div>Seller 36m: {seller.months_36}%</div>
        </div>
      )}
    </div>
  );
}
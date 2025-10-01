import { useState } from 'react';
import { useCommissions } from './use-commissions';

interface UpdateCommissionParams {
  table: 'channel_seller' | 'channel_director' | 'seller' | 'channel_influencer' | 'channel_indicator';
  id: string;
  field: string;
  value: number;
}

export function useCommissionsEditor() {
  const { refreshData } = useCommissions();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateCommission = async ({ table, id, field, value }: UpdateCommissionParams) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/commissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table,
          data: {
            id,
            [field]: value
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar comissão');
      }

      // Refresh data after successful update
      await refreshData();
    } catch (error) {
      console.error('Erro ao atualizar comissão:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateCommission,
    isUpdating
  };
}
import useSWR from 'swr';
import { vaultApi } from '@services/api';
import type { ProtocolStats } from '@types/index';

export function useProtocolStats() {
  const { data, error, isLoading } = useSWR(
    'protocol-stats',
    async () => {
      const response = await vaultApi.getStats();
      return response.data.data;
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    stats: data as ProtocolStats | undefined,
    isLoading,
    error,
  };
}

import useSWR from 'swr';
import { poolsApi } from '@services/api';

export function usePools(offset = 0, limit = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    ['pools', offset, limit],
    async () => {
      const response = await poolsApi.getList({ offset, limit });
      return response.data;
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    pools: data?.data.data || [],
    meta: data?.data.meta,
    isLoading,
    error,
    mutate,
  };
}

export function usePool(asset: string | undefined) {
  const { data, error, isLoading } = useSWR(
    asset ? ['pool', asset] : null,
    async () => {
      const response = await poolsApi.getByAsset(asset!);
      return response.data.data;
    }
  );

  return {
    pool: data,
    isLoading,
    error,
  };
}

export function usePoolStats(asset: string | undefined) {
  const { data, error, isLoading } = useSWR(
    asset ? ['pool-stats', asset] : null,
    async () => {
      const response = await poolsApi.getStats(asset!);
      return response.data.data;
    }
  );

  return {
    stats: data,
    isLoading,
    error,
  };
}

export function useSearchPools(query: string) {
  const { data, error, isLoading } = useSWR(
    query ? ['search-pools', query] : null,
    async () => {
      const response = await poolsApi.search(query);
      return response.data.data;
    }
  );

  return {
    pools: data || [],
    isLoading,
    error,
  };
}

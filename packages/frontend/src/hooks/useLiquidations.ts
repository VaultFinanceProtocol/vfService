import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { liquidationApi } from '@services/api';
import type { LiquidatablePosition, LiquidationPreview } from '@types/index';

export function useLiquidations() {
  const { data, error, isLoading, mutate } = useSWR(
    'liquidations',
    async () => {
      const response = await liquidationApi.getAvailable();
      return response.data.data;
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    positions: data as LiquidatablePosition[] | undefined,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useLiquidationPreview() {
  const [preview, setPreview] = useState<LiquidationPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = useCallback(async (data: {
    borrowerAddr: string;
    debtAsset: string;
    collAsset: string;
    repayAmount: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await liquidationApi.preview(data);
      setPreview(response.data.data);
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch liquidation preview');
      setPreview(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPreview = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  return {
    preview,
    isLoading,
    error,
    fetchPreview,
    resetPreview,
  };
}

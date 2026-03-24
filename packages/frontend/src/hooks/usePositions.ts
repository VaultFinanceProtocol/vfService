import useSWR from 'swr';
import { positionsApi } from '@services/api';
import type { PositionSummary, UserAccountData } from '@types/index';

export function usePositions(address: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR(
    address ? ['positions', address] : null,
    async () => {
      const response = await positionsApi.getByUser(address!);
      return response.data.data;
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    summary: data as PositionSummary | undefined,
    isLoading,
    error,
    mutate,
  };
}

export function useHealthFactor(address: string | undefined) {
  const { data, error, isLoading } = useSWR(
    address ? ['health-factor', address] : null,
    async () => {
      const response = await positionsApi.getHealth(address!);
      return response.data.data.healthFactor;
    },
    {
      refreshInterval: 15000,
      revalidateOnFocus: true,
    }
  );

  return {
    healthFactor: data,
    isLoading,
    error,
  };
}

export function useAccountData(address: string | undefined) {
  const { data, error, isLoading } = useSWR(
    address ? ['account-data', address] : null,
    async () => {
      const response = await positionsApi.getAccountData(address!);
      return response.data.data;
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    accountData: data as UserAccountData | undefined,
    isLoading,
    error,
  };
}

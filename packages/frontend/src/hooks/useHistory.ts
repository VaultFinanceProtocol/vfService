import useSWR from 'swr';
import { historyApi } from '@services/api';
import type { OperationRecord, OperationStatus } from '@app-types';

export function useHistory(
  address: string | undefined,
  options?: {
    offset?: number;
    limit?: number;
    status?: OperationStatus;
  }
) {
  const { offset = 0, limit = 20, status } = options || {};

  const { data, error, isLoading, mutate } = useSWR(
    address ? ['history', address, offset, limit, status] : null,
    async () => {
      const response = await historyApi.getByUser(address!, { offset, limit, status });
      return response.data.data;
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    records: data?.records as OperationRecord[] | undefined,
    meta: data?.meta,
    isLoading,
    error,
    refresh: mutate,
  };
}

export function useOperation(id: string | undefined) {
  const { data, error, isLoading } = useSWR(
    id ? ['operation', id] : null,
    async () => {
      const response = await historyApi.getById(id!);
      return response.data.data;
    },
    {
      refreshInterval: 10000,
    }
  );

  return {
    operation: data as OperationRecord | undefined,
    isLoading,
    error,
  };
}

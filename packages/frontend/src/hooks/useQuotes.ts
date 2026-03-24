import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { quotesApi } from '@services/api';
import type { QuoteRequest, QuoteResponse } from '@types/index';

export function useQuote(operation: 'supply' | 'withdraw' | 'borrow' | 'repay') {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async (data: QuoteRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const api = quotesApi[operation];
      const response = await api(data);
      setQuote(response.data.data);
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quote');
      setQuote(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [operation]);

  const resetQuote = useCallback(() => {
    setQuote(null);
    setError(null);
  }, []);

  return {
    quote,
    isLoading,
    error,
    fetchQuote,
    resetQuote,
  };
}

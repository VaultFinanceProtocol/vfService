import axios from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Pool,
  PoolStats,
  PositionSummary,
  UserAccountData,
  QuoteRequest,
  QuoteResponse,
  TransactionDraft,
  ProtocolStats,
  LiquidatablePosition,
  LiquidationPreview,
  OperationRecord,
} from '@app-types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

// Vault API
export const vaultApi = {
  getStats: () => api.get<ApiResponse<ProtocolStats>>('/vault/stats'),
};

// Pools API
export const poolsApi = {
  getList: (params?: { offset?: number; limit?: number; paused?: boolean }) =>
    api.get<ApiResponse<PaginatedResponse<Pool>>>('/pools', { params }),
  search: (q: string) =>
    api.get<ApiResponse<Pool[]>>('/pools/search', { params: { q } }),
  getByAsset: (asset: string) =>
    api.get<ApiResponse<Pool>>(`/pools/${asset}`),
  getStats: (asset: string) =>
    api.get<ApiResponse<PoolStats>>(`/pools/${asset}/stats`),
};

// Positions API
export const positionsApi = {
  getByUser: (address: string) =>
    api.get<ApiResponse<PositionSummary>>(`/positions/${address}`),
  getHealth: (address: string) =>
    api.get<ApiResponse<{ healthFactor: string }>>(`/positions/${address}/health`),
  getAccountData: (address: string) =>
    api.get<ApiResponse<UserAccountData>>(`/positions/${address}/account-data`),
};

// Quotes API
export const quotesApi = {
  supply: (data: QuoteRequest) =>
    api.post<ApiResponse<QuoteResponse>>('/quotes/supply', data),
  withdraw: (data: QuoteRequest) =>
    api.post<ApiResponse<QuoteResponse>>('/quotes/withdraw', data),
  borrow: (data: QuoteRequest) =>
    api.post<ApiResponse<QuoteResponse>>('/quotes/borrow', data),
  repay: (data: QuoteRequest) =>
    api.post<ApiResponse<QuoteResponse>>('/quotes/repay', data),
};

// Liquidation API
export const liquidationApi = {
  getAvailable: () =>
    api.get<ApiResponse<LiquidatablePosition[]>>('/liquidations/available'),
  check: (address: string) =>
    api.get<ApiResponse<{ liquidatable: boolean; healthFactor: string; reason?: string }>>(`/liquidations/${address}/check`),
  preview: (data: {
    borrowerAddr: string;
    debtAsset: string;
    collAsset: string;
    repayAmount: string;
  }) => api.post<ApiResponse<LiquidationPreview>>('/liquidations/preview', data),
};

// History API
export const historyApi = {
  getByUser: (address: string, params?: { offset?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<{ records: OperationRecord[]; meta: { total: number; offset: number; limit: number; hasMore: boolean } }>>('/history', { params: { address, ...params } }),
  getById: (id: string) =>
    api.get<ApiResponse<OperationRecord>>(`/history/${id}`),
};

// Transactions API
export const transactionsApi = {
  createSupplyDraft: (data: {
    userAddr: string;
    asset: string;
    amount: string;
    useAsCollateral: boolean;
    inputs: any[];
  }) => api.post<ApiResponse<TransactionDraft>>('/transactions/supply/draft', data),
  createWithdrawDraft: (data: {
    userAddr: string;
    asset: string;
    shares: string;
    minAmount: string;
  }) => api.post<ApiResponse<TransactionDraft>>('/transactions/withdraw/draft', data),
  createBorrowDraft: (data: {
    userAddr: string;
    asset: string;
    amount: string;
  }) => api.post<ApiResponse<TransactionDraft>>('/transactions/borrow/draft', data),
  createRepayDraft: (data: {
    userAddr: string;
    asset: string;
    amount: string;
    useInternal: boolean;
    inputs?: any[];
  }) => api.post<ApiResponse<TransactionDraft>>('/transactions/repay/draft', data),
  broadcast: (data: {
    signedTx: string;
    operation: string;
    userAddr: string;
    asset: string;
    amount: string;
  }) => api.post<ApiResponse<{ txid: string; status: string }>>('/transactions/broadcast', data),
  getStatus: (txid: string) =>
    api.get<ApiResponse<any>>(`/transactions/${txid}`),
};

export default api;

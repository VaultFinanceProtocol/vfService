// Asset/Pool Types
export interface Pool {
  asset: string;
  symbol: string;
  name: string;
  decimals: number;
  liquidity: string;
  totalSupplied: string;
  totalBorrowed: string;
  supplyAPY: string;
  borrowAPY: string;
  utilization: string;
  ltv: number;
  liquidationThreshold: number;
  liquidationBonus: number;
  supplyCap: string;
  borrowCap: string;
  paused: boolean;
}

export interface PoolStats {
  asset: string;
  utilization: string;
  supplyAPY: string;
  borrowAPY: string;
  totalSupplied: string;
  totalBorrowed: string;
  availableLiquidity: string;
}

// Liquidation Types
export interface LiquidatablePosition {
  userAddr: string;
  asset: string;
  symbol: string;
  borrowedAmount: string;
  borrowedValueUSD: string;
  healthFactor: string;
  liquidationBonus: number;
  potentialProfitUSD: string;
}

export interface LiquidationPreview {
  borrowerAddr: string;
  debtAsset: string;
  collAsset: string;
  repayAmount: string;
  repayValueUSD: string;
  seizeAmount: string;
  seizeValueUSD: string;
  bonusAmount: string;
  bonusValueUSD: string;
}

// Position Types
export interface UserPosition {
  asset: string;
  symbol: string;
  decimals: number;
  suppliedAmount: string;
  suppliedShares: string;
  suppliedValueUSD: string;
  usedAsCollateral: boolean;
  supplyAPY: string;
  borrowedAmount: string;
  borrowedShares: string;
  borrowedValueUSD: string;
  borrowAPY: string;
}

export interface UserAccountData {
  totalCollateralUSD: string;
  totalDebtUSD: string;
  availableBorrowsUSD: string;
  currentLTV: number;
  liquidationThreshold: number;
  healthFactor: string;
}

export interface PositionSummary {
  supplies: UserPosition[];
  borrows: UserPosition[];
  healthFactor: string;
  accountData: UserAccountData;
}

// Quote Types
export interface QuoteRequest {
  userAddr: string;
  asset: string;
  amount?: string;
  shares?: string;
  useAsCollateral?: boolean;
  minAmount?: string;
  useInternal?: boolean;
}

export interface QuoteResponse {
  feasible: boolean;
  reasons?: string[];
  warnings?: string[];
  computed: {
    amount?: string;
    shares?: string;
    expectedAPY?: string;
    healthFactorBefore?: string;
    healthFactorAfter?: string;
    maxBorrowAmount?: string;
  };
  txPlan?: {
    operation: string;
    requiresGuard: boolean;
    requiresCreateOp: boolean;
    isToken: boolean;
    hasRefundPath: boolean;
    estimatedFee: string;
  };
}

// Transaction Types
export interface TransactionDraft {
  operation: string;
  psbtBase64: string;
  inputs: {
    txid: string;
    vout: number;
    scriptPubKey?: string;
    value?: string;
  }[];
  outputs: {
    address?: string;
    scriptPubKey?: string;
    value: string;
  }[];
  fee: string;
  estimatedSize: number;
  metadata: {
    requiresGuard: boolean;
    requiresCreateOp: boolean;
    hasRefundPath: boolean;
    expiryTime?: number;
  };
}

// Operation History Types
export enum OperationType {
  SUPPLY = 'supply',
  WITHDRAW = 'withdraw',
  BORROW = 'borrow',
  REPAY = 'repay',
  LIQUIDATE = 'liquidate',
  SET_COLLATERAL = 'setCollateral',
}

export enum OperationStatus {
  DRAFTED = 'drafted',
  BROADCAST = 'broadcast',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export interface OperationRecord {
  id: string;
  type: OperationType;
  status: OperationStatus;
  userAddr: string;
  asset: string;
  amount: string;
  txid?: string;
  draftData?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// Protocol Stats
export interface ProtocolStats {
  totalValueLocked: string;
  totalSupplied: string;
  totalBorrowed: string;
  poolCount: number;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ProtocolService } from '../protocol/protocol.service';
import { PoolsService } from '../pools/pools.service';
import { PositionsService } from '../positions/positions.service';

/**
 * Operation types
 */
export enum OperationType {
  SUPPLY = 'supply',
  WITHDRAW = 'withdraw',
  BORROW = 'borrow',
  REPAY = 'repay',
}

/**
 * Quote request DTOs
 */
export interface SupplyQuoteRequest {
  userAddr: string;
  asset: string;
  amount: string;
  useAsCollateral: boolean;
}

export interface WithdrawQuoteRequest {
  userAddr: string;
  asset: string;
  shares: string;  // LP shares to burn
  minAmount: string;  // Minimum amount to receive (slippage protection)
}

export interface BorrowQuoteRequest {
  userAddr: string;
  asset: string;
  amount: string;
}

export interface RepayQuoteRequest {
  userAddr: string;
  asset: string;
  amount: string;
  useInternal: boolean;  // Use supply position for repayment
}

/**
 * Quote response
 */
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
    operation: OperationType;
    requiresGuard: boolean;
    requiresCreateOp: boolean;
    isToken: boolean;
    hasRefundPath: boolean;
    estimatedFee: string;
  };
}

/**
 * Quotes Service
 *
 * Calculates quotes for all protocol operations.
 *
 * Quote output includes:
 * - feasible: boolean
 * - reasons: string[] (if not feasible)
 * - warnings: string[]
 * - computed: calculated values
 * - txPlan: transaction plan details
 */
@Injectable()
export class QuotesService {
  private readonly logger = new Logger(QuotesService.name);

  constructor(
    private protocolService: ProtocolService,
    private poolsService: PoolsService,
    private positionsService: PositionsService,
  ) {}

  /**
   * Get supply quote
   */
  async getSupplyQuote(request: SupplyQuoteRequest): Promise<QuoteResponse> {
    const { userAddr, asset, amount, useAsCollateral } = request;

    try {
      // Get pool info
      const pool = await this.poolsService.getPoolByAsset(asset);
      if (!pool) {
        return {
          feasible: false,
          reasons: ['Pool not found'],
          computed: {},
        };
      }

      // Check if pool is paused
      if (pool.paused) {
        return {
          feasible: false,
          reasons: ['Pool is paused'],
          warnings: [],
          computed: {
            expectedAPY: pool.supplyAPY,
          },
        };
      }

      // Check supply cap
      const amountNum = BigInt(amount);
      const currentSupply = BigInt(pool.totalSupplied);
      const supplyCap = BigInt(pool.supplyCap);

      if (supplyCap > 0n && currentSupply + amountNum > supplyCap) {
        return {
          feasible: false,
          reasons: ['Supply cap exceeded'],
          warnings: [],
          computed: {
            expectedAPY: pool.supplyAPY,
          },
        };
      }

      // Calculate expected shares (simplified - in reality uses exchange rate)
      const shares = amount; // Mock: 1:1 for simplicity

      const warnings: string[] = [];
      if (useAsCollateral) {
        warnings.push('Asset will be used as collateral. Can be liquidated if HF < 1.0');
      }

      return {
        feasible: true,
        reasons: [],
        warnings,
        computed: {
          amount,
          shares,
          expectedAPY: pool.supplyAPY,
        },
        txPlan: {
          operation: OperationType.SUPPLY,
          requiresGuard: false,
          requiresCreateOp: false,
          isToken: asset !== '0000000000000000000000000000000000000000000000000000000000000000',
          hasRefundPath: true,
          estimatedFee: '1000',
        },
      };
    } catch (error) {
      this.logger.error(`Supply quote error: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to calculate supply quote: ${error.message}`);
    }
  }

  /**
   * Get withdraw quote
   */
  async getWithdrawQuote(request: WithdrawQuoteRequest): Promise<QuoteResponse> {
    const { userAddr, asset, shares, minAmount } = request;

    try {
      // Get pool and position
      const [pool, position] = await Promise.all([
        this.poolsService.getPoolByAsset(asset),
        this.positionsService.getUserPosition(userAddr, asset),
      ]);

      if (!pool) {
        return {
          feasible: false,
          reasons: ['Pool not found'],
          computed: {},
        };
      }

      if (!position || position.suppliedShares === '0') {
        return {
          feasible: false,
          reasons: ['No supply position found'],
          computed: {},
        };
      }

      // Check if user has enough shares
      const withdrawShares = BigInt(shares);
      const userShares = BigInt(position.suppliedShares);

      if (withdrawShares > userShares) {
        return {
          feasible: false,
          reasons: ['Insufficient supply shares'],
          computed: {},
        };
      }

      // Calculate expected amount (simplified)
      const expectedAmount = shares; // Mock: 1:1 for simplicity

      // Calculate health factor after withdrawal
      const warnings: string[] = [];
      const accountData = await this.positionsService.getAccountData(userAddr);
      const healthFactorBefore = accountData.healthFactor;

      let healthFactorAfter = healthFactorBefore;

      // If this collateral is used, calculate new HF
      if (position.usedAsCollateral) {
        const withdrawnValue = Number(expectedAmount) / 10 ** pool.decimals;
        const newCollateral = Number(accountData.totalCollateralUSD) - withdrawnValue;
        const debt = Number(accountData.totalDebtUSD);

        if (debt > 0) {
          const liquidationThreshold = Number(accountData.liquidationThreshold) / 10000;
          const newHF = (newCollateral * liquidationThreshold) / debt;
          healthFactorAfter = newHF.toFixed(4);

          if (newHF < 1.0) {
            return {
              feasible: false,
              reasons: ['Health factor would drop below 1.0'],
              warnings: [],
              computed: {
                shares,
                amount: expectedAmount,
                healthFactorBefore,
                healthFactorAfter,
              },
            };
          }

          if (newHF < 1.1) {
            warnings.push('Health factor will be dangerously low after withdrawal');
          }
        }
      }

      return {
        feasible: true,
        reasons: [],
        warnings,
        computed: {
          shares,
          amount: expectedAmount,
          healthFactorBefore,
          healthFactorAfter,
        },
        txPlan: {
          operation: OperationType.WITHDRAW,
          requiresGuard: false,
          requiresCreateOp: true,  // Withdraw requires createOp backtrace
          isToken: asset !== '0000000000000000000000000000000000000000000000000000000000000000',
          hasRefundPath: true,
          estimatedFee: '2000',
        },
      };
    } catch (error) {
      this.logger.error(`Withdraw quote error: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to calculate withdraw quote: ${error.message}`);
    }
  }

  /**
   * Get borrow quote
   */
  async getBorrowQuote(request: BorrowQuoteRequest): Promise<QuoteResponse> {
    const { userAddr, asset, amount } = request;

    try {
      // Get pool info
      const pool = await this.poolsService.getPoolByAsset(asset);
      if (!pool) {
        return {
          feasible: false,
          reasons: ['Pool not found'],
          computed: {},
        };
      }

      // Check if pool is paused
      if (pool.paused) {
        return {
          feasible: false,
          reasons: ['Pool is paused'],
          computed: {},
        };
      }

      // Check borrow cap
      const amountNum = BigInt(amount);
      const currentBorrowed = BigInt(pool.totalBorrowed);
      const borrowCap = BigInt(pool.borrowCap);

      if (borrowCap > 0n && currentBorrowed + amountNum > borrowCap) {
        return {
          feasible: false,
          reasons: ['Borrow cap exceeded'],
          computed: {},
        };
      }

      // Check user's available borrow power
      const accountData = await this.positionsService.getAccountData(userAddr);
      const availableBorrows = Number(accountData.availableBorrowsUSD);

      // Convert borrow amount to USD (mock prices)
      const prices: Record<string, number> = {
        '0000000000000000000000000000000000000000000000000000000000000000': 65000,
        'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456': 1,
        'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1': 0.10,
      };
      const price = prices[asset] || 0;
      const borrowValueUSD = (Number(amount) / 10 ** pool.decimals) * price;

      if (borrowValueUSD > availableBorrows) {
        return {
          feasible: false,
          reasons: ['Insufficient collateral'],
          computed: {
            maxBorrowAmount: (availableBorrows / price * 10 ** pool.decimals).toFixed(0),
          },
        };
      }

      // Calculate expected shares (debt shares)
      const shares = amount; // Mock: 1:1 for simplicity

      // Calculate health factor after
      const healthFactorBefore = accountData.healthFactor;
      const totalDebtAfter = Number(accountData.totalDebtUSD) + borrowValueUSD;
      const totalCollateral = Number(accountData.totalCollateralUSD);
      const liquidationThreshold = Number(accountData.liquidationThreshold) / 10000;
      const healthFactorAfter = totalCollateral > 0
        ? ((totalCollateral * liquidationThreshold) / totalDebtAfter).toFixed(4)
        : '999999';

      const warnings: string[] = [];
      if (Number(healthFactorAfter) < 1.5) {
        warnings.push('Health factor will be low after borrowing. Monitor your position.');
      }

      return {
        feasible: true,
        reasons: [],
        warnings,
        computed: {
          amount,
          shares,
          expectedAPY: pool.borrowAPY,
          healthFactorBefore,
          healthFactorAfter,
          maxBorrowAmount: accountData.availableBorrowsUSD,
        },
        txPlan: {
          operation: OperationType.BORROW,
          requiresGuard: false,
          requiresCreateOp: true,
          isToken: asset !== '0000000000000000000000000000000000000000000000000000000000000000',
          hasRefundPath: true,
          estimatedFee: '2000',
        },
      };
    } catch (error) {
      this.logger.error(`Borrow quote error: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to calculate borrow quote: ${error.message}`);
    }
  }

  /**
   * Get repay quote
   */
  async getRepayQuote(request: RepayQuoteRequest): Promise<QuoteResponse> {
    const { userAddr, asset, amount, useInternal } = request;

    try {
      // Get position
      const position = await this.positionsService.getUserPosition(userAddr, asset);

      if (!position || position.borrowedShares === '0') {
        return {
          feasible: false,
          reasons: ['No borrow position found'],
          computed: {},
        };
      }

      // Check if repaying more than debt
      const repayAmount = BigInt(amount);
      const debtAmount = BigInt(position.borrowedAmount);

      const warnings: string[] = [];
      if (repayAmount > debtAmount) {
        warnings.push('Repaying more than debt. Excess will be refunded.');
      }

      // Calculate health factor after
      const accountData = await this.positionsService.getAccountData(userAddr);
      const healthFactorBefore = accountData.healthFactor;

      const pool = await this.poolsService.getPoolByAsset(asset);
      const prices: Record<string, number> = {
        '0000000000000000000000000000000000000000000000000000000000000000': 65000,
        'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456': 1,
        'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1': 0.10,
      };
      const price = prices[asset] || 0;
      const repayValueUSD = (Number(amount) / 10 ** (pool?.decimals || 8)) * price;

      const totalDebtAfter = Math.max(0, Number(accountData.totalDebtUSD) - repayValueUSD);
      const totalCollateral = Number(accountData.totalCollateralUSD);
      const liquidationThreshold = Number(accountData.liquidationThreshold) / 10000;
      const healthFactorAfter = totalDebtAfter > 0
        ? ((totalCollateral * liquidationThreshold) / totalDebtAfter).toFixed(4)
        : '999999';

      return {
        feasible: true,
        reasons: [],
        warnings,
        computed: {
          amount,
          shares: amount, // Mock: 1:1
          healthFactorBefore,
          healthFactorAfter,
        },
        txPlan: {
          operation: OperationType.REPAY,
          requiresGuard: !useInternal,  // External repay needs guard
          requiresCreateOp: useInternal,  // Internal repay needs createOp
          isToken: asset !== '0000000000000000000000000000000000000000000000000000000000000000',
          hasRefundPath: true,
          estimatedFee: useInternal ? '1500' : '2500',
        },
      };
    } catch (error) {
      this.logger.error(`Repay quote error: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to calculate repay quote: ${error.message}`);
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Pool View - Business-oriented pool data
 */
export interface PoolView {
  asset: string;              // Asset script hash
  symbol: string;             // Token symbol (BTC, USDT, etc.)
  name: string;               // Token name
  decimals: number;           // Token decimals

  // Liquidity
  liquidity: string;          // Available liquidity
  totalSupplied: string;      // Total supplied amount
  totalBorrowed: string;      // Total borrowed amount

  // APYs
  supplyAPY: string;          // Supply APY (decimal)
  borrowAPY: string;          // Borrow APY (decimal)

  // Utilization
  utilization: string;        // Utilization rate (0-1)

  // Risk parameters
  ltv: number;                // Loan-to-value (BPS)
  liquidationThreshold: number; // Liquidation threshold (BPS)
  liquidationBonus: number;   // Liquidation bonus (BPS)

  // Caps
  supplyCap: string;          // Supply cap (0 = unlimited)
  borrowCap: string;          // Borrow cap (0 = unlimited)

  // State
  paused: boolean;            // Whether pool is paused
}

/**
 * User Position View - Business-oriented position data
 */
export interface UserPositionView {
  asset: string;              // Asset script hash
  symbol: string;             // Token symbol
  decimals: number;           // Token decimals

  // Supply
  suppliedAmount: string;     // Supplied amount
  suppliedShares: string;     // LP shares
  suppliedValueUSD: string;   // USD value
  usedAsCollateral: boolean;  // Whether used as collateral
  supplyAPY: string;          // Current supply APY

  // Borrow
  borrowedAmount: string;     // Borrowed amount
  borrowedShares: string;     // Borrowed shares
  borrowedValueUSD: string;   // USD value
  borrowAPY: string;          // Current borrow APY
}

/**
 * User Account Data - Aggregated user data
 */
export interface UserAccountData {
  totalCollateralUSD: string;   // Total collateral value in USD
  totalDebtUSD: string;         // Total debt value in USD
  availableBorrowsUSD: string;  // Available borrow amount in USD
  currentLTV: number;           // Current LTV ratio
  liquidationThreshold: number; // Weighted liquidation threshold
  healthFactor: string;         // Health factor (1.0 = safe)
}

/**
 * Protocol Service
 *
 * Adapter for VaultFinance on-chain protocol.
 * Reads vault state, pool state, user positions from the blockchain.
 *
 * Currently using mock data for development.
 * TODO: Connect to actual contract SDK
 */
@Injectable()
export class ProtocolService {
  private readonly logger = new Logger(ProtocolService.name);
  private readonly mockPools: PoolView[];
  private readonly mockPositions: Map<string, UserPositionView[]>;

  constructor(private configService: ConfigService) {
    this.logger.log('ProtocolService initialized');

    // Initialize mock data for development
    this.mockPools = this.initializeMockPools();
    this.mockPositions = this.initializeMockPositions();
  }

  /**
   * Initialize mock pool data
   */
  private initializeMockPools(): PoolView[] {
    return [
      {
        asset: '0000000000000000000000000000000000000000000000000000000000000000',
        symbol: 'BTC',
        name: 'Bitcoin',
        decimals: 8,
        liquidity: '100000000000',      // 1000 BTC
        totalSupplied: '150000000000',  // 1500 BTC
        totalBorrowed: '50000000000',   // 500 BTC
        supplyAPY: '0.025',             // 2.5%
        borrowAPY: '0.08',              // 8%
        utilization: '0.333',           // 33.3%
        ltv: 7500,                      // 75%
        liquidationThreshold: 8000,     // 80%
        liquidationBonus: 500,          // 5%
        supplyCap: '0',
        borrowCap: '0',
        paused: false,
      },
      {
        asset: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 8,
        liquidity: '5000000000000',     // 50,000 USDT
        totalSupplied: '8000000000000', // 80,000 USDT
        totalBorrowed: '3000000000000', // 30,000 USDT
        supplyAPY: '0.045',             // 4.5%
        borrowAPY: '0.12',              // 12%
        utilization: '0.375',           // 37.5%
        ltv: 8000,                      // 80%
        liquidationThreshold: 8500,     // 85%
        liquidationBonus: 500,          // 5%
        supplyCap: '100000000000000',   // 1M USDT
        borrowCap: '80000000000000',    // 800K USDT
        paused: false,
      },
      {
        asset: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1',
        symbol: 'CAT',
        name: 'CAT Token',
        decimals: 8,
        liquidity: '20000000000000',    // 200,000 CAT
        totalSupplied: '30000000000000',// 300,000 CAT
        totalBorrowed: '10000000000000',// 100,000 CAT
        supplyAPY: '0.08',              // 8%
        borrowAPY: '0.18',              // 18%
        utilization: '0.333',           // 33.3%
        ltv: 6500,                      // 65%
        liquidationThreshold: 7500,     // 75%
        liquidationBonus: 800,          // 8%
        supplyCap: '500000000000000',   // 5M CAT
        borrowCap: '300000000000000',   // 3M CAT
        paused: false,
      },
    ];
  }

  /**
   * Initialize mock position data
   */
  private initializeMockPositions(): Map<string, UserPositionView[]> {
    const positions = new Map<string, UserPositionView[]>();

    // Mock user with positions
    const userAddr = 'user1234567890abcdef1234567890abcdef123456';
    positions.set(userAddr, [
      {
        asset: '0000000000000000000000000000000000000000000000000000000000000000',
        symbol: 'BTC',
        decimals: 8,
        suppliedAmount: '1000000000',   // 10 BTC
        suppliedShares: '1000000000000', // shares
        suppliedValueUSD: '650000',      // $650,000
        usedAsCollateral: true,
        supplyAPY: '0.025',
        borrowedAmount: '0',
        borrowedShares: '0',
        borrowedValueUSD: '0',
        borrowAPY: '0',
      },
      {
        asset: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
        symbol: 'USDT',
        decimals: 8,
        suppliedAmount: '0',
        suppliedShares: '0',
        suppliedValueUSD: '0',
        usedAsCollateral: false,
        supplyAPY: '0',
        borrowedAmount: '200000000000',  // 20,000 USDT
        borrowedShares: '200000000000000', // shares
        borrowedValueUSD: '20000',
        borrowAPY: '0.12',
      },
    ]);

    return positions;
  }

  // ==================== Pool Methods ====================

  /**
   * Get all pools
   */
  async getPools(): Promise<PoolView[]> {
    // TODO: Fetch from on-chain state
    return this.mockPools;
  }

  /**
   * Get pool by asset
   */
  async getPoolByAsset(asset: string): Promise<PoolView | null> {
    // TODO: Fetch from on-chain state
    const pool = this.mockPools.find(p => p.asset.toLowerCase() === asset.toLowerCase());
    return pool || null;
  }

  /**
   * Calculate utilization rate
   */
  calculateUtilization(totalBorrowed: string, totalSupplied: string): string {
    const borrowed = BigInt(totalBorrowed);
    const supplied = BigInt(totalSupplied);
    if (supplied === 0n) return '0';
    return (Number(borrowed) / Number(supplied)).toString();
  }

  // ==================== Position Methods ====================

  /**
   * Get user positions
   */
  async getUserPositions(userAddr: string): Promise<UserPositionView[]> {
    // TODO: Fetch from on-chain state
    return this.mockPositions.get(userAddr) || [];
  }

  /**
   * Calculate user account data
   */
  async getUserAccountData(userAddr: string): Promise<UserAccountData> {
    const positions = await this.getUserPositions(userAddr);

    let totalCollateralUSD = 0;
    let totalDebtUSD = 0;
    let weightedLTV = 0;
    let weightedLiquidationThreshold = 0;
    let totalCollateralWeight = 0;

    for (const pos of positions) {
      const pool = await this.getPoolByAsset(pos.asset);
      if (!pool) continue;

      if (pos.usedAsCollateral && pos.suppliedAmount !== '0') {
        const collateralUSD = Number(pos.suppliedValueUSD);
        totalCollateralUSD += collateralUSD;
        weightedLTV += collateralUSD * (pool.ltv / 10000);
        weightedLiquidationThreshold += collateralUSD * (pool.liquidationThreshold / 10000);
        totalCollateralWeight += collateralUSD;
      }

      if (pos.borrowedAmount !== '0') {
        totalDebtUSD += Number(pos.borrowedValueUSD);
      }
    }

    const currentLTV = totalCollateralWeight > 0 ? weightedLTV / totalCollateralWeight : 0;
    const liquidationThreshold = totalCollateralWeight > 0 ? weightedLiquidationThreshold / totalCollateralWeight : 0;

    // Health factor = (totalCollateral * liquidationThreshold) / totalDebt
    let healthFactor = '999999';
    if (totalDebtUSD > 0) {
      healthFactor = (totalCollateralUSD * liquidationThreshold / totalDebtUSD).toFixed(4);
    }

    const availableBorrowsUSD = Math.max(0, totalCollateralUSD * currentLTV - totalDebtUSD);

    return {
      totalCollateralUSD: totalCollateralUSD.toFixed(2),
      totalDebtUSD: totalDebtUSD.toFixed(2),
      availableBorrowsUSD: availableBorrowsUSD.toFixed(2),
      currentLTV: Math.round(currentLTV * 10000),
      liquidationThreshold: Math.round(liquidationThreshold * 10000),
      healthFactor,
    };
  }

  /**
   * Calculate health factor
   */
  async getHealthFactor(userAddr: string): Promise<string> {
    const accountData = await this.getUserAccountData(userAddr);
    return accountData.healthFactor;
  }

  // ==================== Vault Stats ====================

  /**
   * Get protocol statistics
   */
  async getProtocolStats(): Promise<{
    totalValueLocked: string;
    totalSupplied: string;
    totalBorrowed: string;
    poolCount: number;
  }> {
    const pools = await this.getPools();

    let totalSupplied = 0;
    let totalBorrowed = 0;

    // Mock price feed (BTC = $65,000, USDT = $1, CAT = $0.10)
    const prices: Record<string, number> = {
      '0000000000000000000000000000000000000000000000000000000000000000': 65000,
      'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456': 1,
      'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456a1': 0.10,
    };

    for (const pool of pools) {
      const price = prices[pool.asset] || 0;
      const supplied = Number(pool.totalSupplied) / 10 ** pool.decimals;
      const borrowed = Number(pool.totalBorrowed) / 10 ** pool.decimals;

      totalSupplied += supplied * price;
      totalBorrowed += borrowed * price;
    }

    return {
      totalValueLocked: totalSupplied.toFixed(2),
      totalSupplied: totalSupplied.toFixed(2),
      totalBorrowed: totalBorrowed.toFixed(2),
      poolCount: pools.length,
    };
  }
}

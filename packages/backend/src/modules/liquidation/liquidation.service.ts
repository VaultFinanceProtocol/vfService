import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProtocolService, UserPositionView, PoolView } from '../protocol/protocol.service';
import { PositionsService } from '../positions/positions.service';
import { PoolsService } from '../pools/pools.service';

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

/**
 * Liquidation Service
 *
 * Detects and manages liquidations.
 * - Scans for underwater positions (HF < 1.0)
 * - Calculates liquidation opportunities
 * - Generates liquidation transactions
 */
@Injectable()
export class LiquidationService {
  private readonly logger = new Logger(LiquidationService.name);

  constructor(
    private protocolService: ProtocolService,
    private positionsService: PositionsService,
    private poolsService: PoolsService,
  ) {}

  /**
   * Find all liquidatable positions
   */
  async findLiquidatablePositions(): Promise<LiquidatablePosition[]> {
    // In production, this would scan all positions
    // For mock, return some predefined liquidatable positions
    return [
      {
        userAddr: 'user_underwater_123',
        asset: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
        symbol: 'USDT',
        borrowedAmount: '50000000000', // 500 USDT
        borrowedValueUSD: '500',
        healthFactor: '0.85',
        liquidationBonus: 500, // 5%
        potentialProfitUSD: '25',
      },
    ];
  }

  /**
   * Preview liquidation
   */
  async previewLiquidation(
    borrowerAddr: string,
    debtAsset: string,
    collAsset: string,
    repayAmount: string,
  ): Promise<LiquidationPreview> {
    // Get pool info for liquidation bonus
    const pool = await this.poolsService.getPoolByAsset(debtAsset);
    const bonus = pool?.liquidationBonus || 500; // 5% default

    // Mock price data
    const prices: Record<string, number> = {
      '0000000000000000000000000000000000000000000000000000000000000000': 65000,
      'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456': 1,
    };

    const debtPrice = prices[debtAsset] || 1;
    const collPrice = prices[collAsset] || 65000;

    const repayValueUSD = (Number(repayAmount) / 1e8) * debtPrice;
    const bonusValueUSD = repayValueUSD * (bonus / 10000);
    const seizeValueUSD = repayValueUSD + bonusValueUSD;
    const seizeAmount = ((seizeValueUSD / collPrice) * 1e8).toFixed(0);
    const bonusAmount = ((bonusValueUSD / collPrice) * 1e8).toFixed(0);

    return {
      borrowerAddr,
      debtAsset,
      collAsset,
      repayAmount,
      repayValueUSD: repayValueUSD.toFixed(2),
      seizeAmount,
      seizeValueUSD: seizeValueUSD.toFixed(2),
      bonusAmount,
      bonusValueUSD: bonusValueUSD.toFixed(2),
    };
  }

  /**
   * Check if a position is liquidatable
   */
  async isLiquidatable(userAddr: string): Promise<{
    liquidatable: boolean;
    healthFactor: string;
    reason?: string;
  }> {
    const healthFactor = await this.positionsService.getHealthFactor(userAddr);
    const hf = parseFloat(healthFactor);

    if (isNaN(hf)) {
      return { liquidatable: false, healthFactor, reason: 'Invalid health factor' };
    }

    if (hf >= 1.0) {
      return {
        liquidatable: false,
        healthFactor,
        reason: `Health factor ${hf} >= 1.0`,
      };
    }

    return { liquidatable: true, healthFactor };
  }
}

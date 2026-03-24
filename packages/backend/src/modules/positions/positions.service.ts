import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProtocolService,
  UserPositionView,
  UserAccountData,
} from '../protocol/protocol.service';
import { PositionEntity } from './entities/position.entity';

/**
 * Positions Service
 *
 * Manages user positions (supply/borrow).
 * - Reads position state from protocol
 * - Calculates health factor, borrow power
 * - Returns UserPositionView for frontend
 */
@Injectable()
export class PositionsService {
  private readonly logger = new Logger(PositionsService.name);

  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
    private readonly protocolService: ProtocolService,
  ) {}

  /**
   * Get all positions for a user
   */
  async getUserPositions(userAddr: string): Promise<UserPositionView[]> {
    return this.protocolService.getUserPositions(userAddr);
  }

  /**
   * Get user position for a specific asset
   */
  async getUserPosition(
    userAddr: string,
    asset: string,
  ): Promise<UserPositionView | null> {
    const positions = await this.getUserPositions(userAddr);
    return positions.find((p) => p.asset.toLowerCase() === asset.toLowerCase()) || null;
  }

  /**
   * Get user health factor
   */
  async getHealthFactor(userAddr: string): Promise<string> {
    return this.protocolService.getHealthFactor(userAddr);
  }

  /**
   * Get user account data (aggregated)
   */
  async getAccountData(userAddr: string): Promise<UserAccountData> {
    return this.protocolService.getUserAccountData(userAddr);
  }

  /**
   * Get positions summary for a user
   */
  async getPositionsSummary(userAddr: string): Promise<{
    supplies: UserPositionView[];
    borrows: UserPositionView[];
    healthFactor: string;
    accountData: UserAccountData;
  }> {
    const positions = await this.getUserPositions(userAddr);

    // Separate supplies and borrows
    const supplies = positions.filter(
      (p) => p.suppliedAmount !== '0' || p.suppliedShares !== '0',
    );
    const borrows = positions.filter(
      (p) => p.borrowedAmount !== '0' || p.borrowedShares !== '0',
    );

    const [healthFactor, accountData] = await Promise.all([
      this.getHealthFactor(userAddr),
      this.getAccountData(userAddr),
    ]);

    return {
      supplies,
      borrows,
      healthFactor,
      accountData,
    };
  }
}

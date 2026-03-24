import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PoolEntity } from '../pools/entities/pool.entity';

export interface AddPoolRequest {
  asset: string;
  symbol: string;
  name: string;
  decimals: number;
  supplyCap: string;
  borrowCap: string;
  ltv: number;
  liquidationThreshold: number;
  liquidationBonus: number;
}

/**
 * Admin Service
 *
 * Admin operations implementation.
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(PoolEntity)
    private readonly poolRepository: Repository<PoolEntity>,
  ) {}

  /**
   * Add new pool
   */
  async addPool(request: AddPoolRequest): Promise<PoolEntity> {
    this.logger.log(`Adding new pool for asset: ${request.asset}`);

    // Check if pool already exists
    const existing = await this.poolRepository.findOne({
      where: { asset: request.asset },
    });

    if (existing) {
      throw new Error(`Pool already exists for asset: ${request.asset}`);
    }

    const pool = this.poolRepository.create({
      asset: request.asset,
      symbol: request.symbol,
      name: request.name,
      decimals: request.decimals,
      supplyCap: request.supplyCap,
      borrowCap: request.borrowCap,
      ltv: request.ltv,
      liquidationThreshold: request.liquidationThreshold,
      liquidationBonus: request.liquidationBonus,
      liquidity: '0',
      addedShares: '0',
      drawnShares: '0',
      premiumShares: '0',
      drawnIndex: '1000000000000000000000000000', // RAY = 1e27
      drawnRate: '0',
      accruedFees: '0',
      liquidityFee: '0',
      deficitRay: '0',
      lastUpdateTimestamp: 0,
      paused: false,
      currentRiskVersion: 1,
      collateralRisk: 0,
    });

    return this.poolRepository.save(pool);
  }

  /**
   * Pause/unpause pool
   */
  async setPoolPaused(asset: string, paused: boolean): Promise<PoolEntity | null> {
    this.logger.log(`${paused ? 'Pausing' : 'Unpausing'} pool: ${asset}`);

    const pool = await this.poolRepository.findOne({ where: { asset } });
    if (!pool) {
      return null;
    }

    pool.paused = paused;
    return this.poolRepository.save(pool);
  }

  /**
   * Get pool config
   */
  async getPoolConfig(asset: string): Promise<PoolEntity | null> {
    return this.poolRepository.findOne({ where: { asset } });
  }

  /**
   * List all pools (admin view with full details)
   */
  async listPools(): Promise<PoolEntity[]> {
    return this.poolRepository.find({ order: { createdAt: 'DESC' } });
  }

  /**
   * Check if user is admin
   */
  isAdmin(username: string, password: string): boolean {
    const adminUser = this.configService.get('ADMIN_USERNAME', 'admin');
    const adminPass = this.configService.get('ADMIN_PASSWORD', 'admin');
    return username === adminUser && password === adminPass;
  }
}

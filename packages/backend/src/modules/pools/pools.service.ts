import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProtocolService, PoolView } from '../protocol/protocol.service';
import { PoolEntity } from './entities/pool.entity';

export interface PoolStats {
  asset: string;
  utilization: string;
  supplyAPY: string;
  borrowAPY: string;
  totalSupplied: string;
  totalBorrowed: string;
  availableLiquidity: string;
}

/**
 * Pools Service
 *
 * Manages asset pool data.
 * - Reads pool state from protocol
 * - Calculates APY, utilization
 * - Returns PoolView for frontend
 */
@Injectable()
export class PoolsService {
  private readonly logger = new Logger(PoolsService.name);

  constructor(
    @InjectRepository(PoolEntity)
    private readonly poolRepository: Repository<PoolEntity>,
    private readonly protocolService: ProtocolService,
  ) {}

  /**
   * Get all pools with optional filtering
   */
  async getPools(options?: {
    offset?: number;
    limit?: number;
    paused?: boolean;
  }): Promise<{ pools: PoolView[]; total: number }> {
    const { offset = 0, limit = 20, paused } = options || {};

    // Get pools from protocol
    const allPools = await this.protocolService.getPools();

    // Filter by paused status if specified
    let filteredPools = allPools;
    if (paused !== undefined) {
      filteredPools = allPools.filter(p => p.paused === paused);
    }

    // Calculate total
    const total = filteredPools.length;

    // Apply pagination
    const paginatedPools = filteredPools.slice(offset, offset + limit);

    return {
      pools: paginatedPools,
      total,
    };
  }

  /**
   * Get pool by asset
   */
  async getPoolByAsset(asset: string): Promise<PoolView> {
    const pool = await this.protocolService.getPoolByAsset(asset);
    if (!pool) {
      throw new NotFoundException(`Pool not found for asset: ${asset}`);
    }
    return pool;
  }

  /**
   * Get pool statistics
   */
  async getPoolStats(asset: string): Promise<PoolStats> {
    const pool = await this.getPoolByAsset(asset);

    return {
      asset: pool.asset,
      utilization: pool.utilization,
      supplyAPY: pool.supplyAPY,
      borrowAPY: pool.borrowAPY,
      totalSupplied: pool.totalSupplied,
      totalBorrowed: pool.totalBorrowed,
      availableLiquidity: pool.liquidity,
    };
  }

  /**
   * Search pools by symbol or name
   */
  async searchPools(query: string): Promise<PoolView[]> {
    const allPools = await this.protocolService.getPools();
    const lowerQuery = query.toLowerCase();

    return allPools.filter(
      pool =>
        pool.symbol.toLowerCase().includes(lowerQuery) ||
        pool.name.toLowerCase().includes(lowerQuery)
    );
  }
}

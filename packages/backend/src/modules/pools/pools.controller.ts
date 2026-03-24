import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PoolsService } from './pools.service';
import { okResponse } from '../../common/utils/ok-response.util';

@ApiTags('Pools')
@Controller('pools')
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pools' })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'paused', required: false, type: Boolean })
  async getPools(
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('paused') paused?: string,
  ) {
    const result = await this.poolsService.getPools({
      offset: offset ? parseInt(offset, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 20,
      paused: paused !== undefined ? paused === 'true' : undefined,
    });

    return okResponse({
      pools: result.pools,
      meta: {
        total: result.total,
        offset: offset ? parseInt(offset, 10) : 0,
        limit: limit ? parseInt(limit, 10) : 20,
        hasMore: (offset ? parseInt(offset, 10) : 0) + (limit ? parseInt(limit, 10) : 20) < result.total,
      },
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search pools by symbol or name' })
  async searchPools(@Query('q') query: string) {
    if (!query) {
      return okResponse([]);
    }
    const pools = await this.poolsService.searchPools(query);
    return okResponse(pools);
  }

  @Get(':asset')
  @ApiOperation({ summary: 'Get pool by asset' })
  async getPoolByAsset(@Param('asset') asset: string) {
    const pool = await this.poolsService.getPoolByAsset(asset);
    return okResponse(pool);
  }

  @Get(':asset/stats')
  @ApiOperation({ summary: 'Get pool statistics' })
  async getPoolStats(@Param('asset') asset: string) {
    const stats = await this.poolsService.getPoolStats(asset);
    return okResponse(stats);
  }
}
